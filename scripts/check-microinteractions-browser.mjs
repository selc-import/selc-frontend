/** Requires the same isolated Chrome/Vite endpoints as test:catalog. Never sends messages. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { connectPage } from './cdp-client.mjs'

const page = await connectPage()
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const choose = value => page.evaluate(`document.querySelector('[data-generation="${value}"]').click()`)
const search = value => page.evaluate(`(()=>{const input=document.querySelector('.catalog-search input');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}))})()`)
const key = async value => { await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code: value }); await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code: value }) }
const hover = async selector => {
  const point = await page.evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point })
  await delay(260)
  return point
}
const report = {}
try {
  await mkdir('.qa', { recursive: true })
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await page.send('Page.navigate', { url: 'http://localhost:5173/' })
  await page.waitFor("document.querySelectorAll('.product-card').length===7 && document.querySelector('.generation-filter--ready')")
  await page.evaluate(`(async()=>{
    const url=performance.getEntriesByType('resource').find(e=>e.name.includes('/gsap_ScrollTrigger.js'))?.name;
    window.__qaScrollTrigger=(await import(url)).ScrollTrigger;
    window.__qaHeading=window.__qaScrollTrigger.getAll().find(t=>t.trigger?.classList?.contains('catalog'));
    window.__qaCard=document.querySelector('[data-product="iphone-17-pro-max"]');
  })()`)
  const stagger = await page.evaluate("window.__qaScrollTrigger.getAll().filter(t=>t.trigger?.classList?.contains('product-card-reveal')).map(t=>t.animation.delay())")
  assert.ok(stagger.length === 7 && Math.max(...stagger) > 0 && Math.max(...stagger) < 0.15)
  await page.evaluate("document.querySelector('.explore').click()")
  await page.waitFor("Math.abs(document.querySelector('#continuar').getBoundingClientRect().top)<2")
  await delay(650)
  await choose(17)
  await page.waitFor("document.querySelectorAll('.product-card').length===2")
  assert.equal(await page.evaluate("document.querySelector('[data-product=\"iphone-17-pro-max\"]')===window.__qaCard && window.__qaScrollTrigger.getAll().includes(window.__qaHeading)"), true)
  await delay(260)
  assert.equal(await page.evaluate("(()=>{const button=document.querySelector('[aria-pressed=true]'),indicator=document.querySelector('.generation-indicator');return Math.abs(indicator.getBoundingClientRect().x-button.getBoundingClientRect().x)<1&&Math.abs(indicator.getBoundingClientRect().width-button.getBoundingClientRect().width)<1})()"), true)
  await page.evaluate("document.querySelector('[data-generation=\"17\"]').focus()")
  await key('ArrowRight')
  await page.waitFor("document.querySelector('[data-generation=\"16\"]').getAttribute('aria-pressed')==='true'")
  assert.equal(await page.evaluate("document.activeElement.dataset.generation"), '16')
  await key('End')
  await page.waitFor("document.querySelector('[data-generation=\"14\"]').getAttribute('aria-pressed')==='true'")
  await key('Home')
  await page.waitFor("document.querySelector('[data-generation=all]').getAttribute('aria-pressed')==='true'")
  assert.equal(await page.evaluate("document.querySelectorAll('.generation-filter [aria-pressed=true]').length"), 1)
  assert.equal(await page.evaluate("getComputedStyle(document.activeElement).outlineStyle"), 'solid')
  await page.screenshot('.qa/microinteractions-filter-focus.png')
  report.filters = 'indicator alignment, aria-pressed, arrow/Home/End navigation, focus and retained heading/card passed'

  await choose(17)
  await search('Max')
  await page.waitFor("document.querySelectorAll('.product-card').length===1")
  await page.evaluate("document.querySelector('.search-clear').click()")
  await page.waitFor("document.querySelectorAll('.product-card').length===2")
  assert.equal(await page.evaluate("document.activeElement.id==='catalog-search-input' && !document.querySelector('.search-clear') && document.querySelector('[data-generation=\"17\"]').getAttribute('aria-pressed')==='true'"), true)
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.catalog-search')).outlineStyle"), 'solid')
  report.search = 'clear preserves generation and returns focus to the search input'

  await choose('all')
  await page.waitFor("document.querySelectorAll('.product-card').length===7")
  await page.evaluate("document.querySelector('.product-card').scrollIntoView({behavior:'instant',block:'center'})")
  await delay(650)
  await hover('.product-card')
  const cardHover = await page.evaluate("({translate:getComputedStyle(document.querySelector('.product-card')).translate,photo:new DOMMatrix(getComputedStyle(document.querySelector('.product-photo img')).transform).a,hover:document.querySelector('.product-card').matches(':hover'),hoverMedia:matchMedia('(hover:hover)').matches,fine:matchMedia('(pointer:fine)').matches,reduced:matchMedia('(prefers-reduced-motion:reduce)').matches})")
  assert.equal(cardHover.translate, '0px -3px', JSON.stringify(cardHover))
  assert.ok(cardHover.photo>1 && cardHover.photo<=1.0251)
  const button = '.product-card .catalog-button'
  const normalColor = await page.evaluate(`getComputedStyle(document.querySelector('${button}')).backgroundColor`)
  const point = await hover(button)
  const hovered = await page.evaluate(`(()=>{const button=document.querySelector('${button}'),icon=button.querySelector('[data-icon=whatsapp]'),m=new DOMMatrix(getComputedStyle(icon).transform);return {color:getComputedStyle(button).backgroundColor,shift:Math.hypot(m.m41,m.m42)}})()`)
  assert.notEqual(hovered.color, normalColor)
  assert.ok(hovered.shift > 0 && hovered.shift <= 4)
  await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point })
  await delay(240)
  assert.ok(await page.evaluate(`new DOMMatrix(getComputedStyle(document.querySelector('${button}')).transform).a<1`))
  await page.screenshot('.qa/microinteractions-card-active.png')
  // Release outside the link to avoid opening WhatsApp.
  await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 1400, y: 100 })
  await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, x: 1400, y: 100 })
  await key('Tab')
  await page.evaluate(`document.querySelector('${button}').focus()`)
  assert.equal(await page.evaluate(`getComputedStyle(document.querySelector('${button}')).outlineStyle`), 'solid')
  assert.equal(await page.evaluate("Array.from(document.querySelectorAll('.catalog .ui-icon')).every(icon=>icon.getAttribute('aria-hidden')==='true'&&icon.getAttribute('stroke-width')==='1.75')"), true)
  report.pointer = 'card lift -3px, photo zoom 1.025, icon travel below 4px, button hover/active passed'

  await page.evaluate(`(async()=>{
    const vueUrl=performance.getEntriesByType('resource').find(e=>e.name.includes('/vue.js?')).name;
    const {createApp,h}=await import(vueUrl);
    const {default:Button}=await import('/src/shared/presentation/components/AppButton.vue');
    const fixture=document.createElement('div');fixture.id='qa-disabled';document.body.append(fixture);window.__qaClicks=0;
    window.__qaFixture=createApp({render:()=>h('div',[
      h(Button,{disabled:true,onClick:()=>window.__qaClicks++},()=> 'Disabled'),
      h(Button,{variant:'ghost',disabled:true,href:'https://example.com',onClick:()=>window.__qaClicks++},()=> 'Disabled link')
    ])});window.__qaFixture.mount(fixture);
  })()`)
  await page.evaluate("document.querySelector('#qa-disabled button').click();document.querySelector('#qa-disabled a').click()")
  assert.equal(await page.evaluate("window.__qaClicks===0 && document.querySelector('#qa-disabled button').disabled && !document.querySelector('#qa-disabled a').hasAttribute('href') && document.querySelector('#qa-disabled a').tabIndex===-1"), true)
  await page.evaluate("window.__qaFixture.unmount();document.querySelector('#qa-disabled').remove()")
  report.disabled = 'native disabled and disabled links block activation and navigation'

  for (let index = 0; index < 6; index++) { await choose(index % 2 ? 'all' : 16); await delay(50) }
  await page.waitFor("document.querySelectorAll('.product-card').length===7")
  assert.equal(await page.evaluate("document.querySelectorAll('.product-grid-item[inert],.product-grid-item[aria-hidden=true]').length"), 0)
  assert.ok(await page.evaluate("window.__qaScrollTrigger.getAll().length<=9"), 'Triggers must remain bounded after rapid filtering')
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await page.waitFor("Array.from(document.querySelectorAll('.product-card-reveal')).every(card=>getComputedStyle(card).opacity==='1')")
  await page.evaluate("document.querySelector('.product-card').scrollIntoView({behavior:'instant',block:'center'})")
  await hover('.product-card')
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.product-card')).translate"), 'none')
  assert.equal(await page.evaluate("getComputedStyle(document.querySelector('.product-photo img')).transform"), 'none')
  assert.ok(await page.evaluate("!window.__qaScrollTrigger.getAll().some(t=>t.trigger?.classList?.contains('product-card-reveal'))"))
  await choose(14)
  await page.waitFor("document.querySelectorAll('.product-card').length===1")
  report.reducedMotion = 'live preference removes reveals, stagger, lift, zoom and category transitions'
  for (const width of [390,320,280]) {
    await page.send('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true })
    await page.evaluate("document.querySelector('#continuar').scrollIntoView({behavior:'instant'})")
    await search('14')
    assert.equal(await page.evaluate(`document.documentElement.scrollWidth<=${width}`), true)
    assert.ok(await page.evaluate("document.querySelector('.search-clear').getBoundingClientRect().width>=44"))
    if (width === 390) await page.screenshot('.qa/microinteractions-mobile-search.png')
    await page.evaluate("document.querySelector('.search-clear').click()")
  }
  for (const [path, hash] of [
    ['src/styles/main.css','adfe9cd70608f7704a0f472cf80d17d4e1c4c5e68a193c69b1d9cc31deb017b8'],
    ['src/catalog/infrastructure/selc-catalog.ts','13ddeddf66e3469e0e597fd7588ce943bb1a339d3547198daa320a4ffbeb160f'],
    ['src/catalog/application/whatsapp.ts','d654bfab72539157f464889a9340e8daac3a63110853c32d4d2620ac43230b2b'],
  ]) assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'), hash)
  const brandSource=(await readFile('src/brand/presentation/views/BrandScene.vue','utf8')).replace('<slot name="navigation">','').replace('</a></slot>','</a>')
  assert.equal(createHash('sha256').update(brandSource).digest('hex'),'1e3a6d6ade4da915fe4d35cf279d89c29f7572cb97414fe44fb55d77aca59d01')
  report.preservation = 'original hero source (apart from the navigation slot), original stylesheet, commercial data and WhatsApp messages unchanged'
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await page.waitFor("window.__qaScrollTrigger.getAll().length>0")
  await page.evaluate("document.querySelector('#app').__vue_app__.unmount()")
  assert.equal(await page.evaluate("window.__qaScrollTrigger.getAll().length"), 0)
  report.lifecycle = 'unmount removes all ScrollTriggers'
  assert.deepEqual(page.errors, [])
  report.browserErrors = page.errors
  await writeFile('.qa/microinteractions-report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  await page.screenshot('.qa/microinteractions-failure.png')
  console.error(JSON.stringify({ report, errors: page.errors }, null, 2))
  throw error
} finally { await page.close() }
