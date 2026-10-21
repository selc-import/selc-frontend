/** Requires Vite on 5173 and the project's isolated Chrome endpoint on 9333. */
import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { connectPage } from './cdp-client.mjs'
const page = await connectPage()
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const choose = value => page.evaluate(`document.querySelector('[data-generation="${value}"]').click()`)
const search = value => page.evaluate(`(()=>{const input=document.querySelector('.catalog-search input');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('input',{bubbles:true}))})()`)
const sort = value => page.evaluate(`(()=>{const input=document.querySelector('.catalog-sort select');input.value=${JSON.stringify(value)};input.dispatchEvent(new Event('change',{bubbles:true}))})()`)
const ids = () => page.evaluate("Array.from(document.querySelectorAll('.product-card'),card=>card.dataset.product)")
const expected = [['iphone-17-pro-max','S/ 4,450','256 GB'],['iphone-17-pro','S/ 3,750','256 GB'],['iphone-16-pro-max','S/ 3,499','256 GB'],['iphone-16-pro','S/ 2,750','128 GB'],['iphone-15-pro-max','S/ 2,750','256 GB'],['iphone-15-pro','S/ 2,420','256 GB'],['iphone-14-pro','S/ 2,200','256 GB']]
const report = {}
async function navigate(url) { await page.send('Page.navigate',{url:`http://localhost:5173${url}`}) }
async function openDetail(id) {
  await page.evaluate(`document.querySelector('[data-product="${id}"] .product-discovery').click()`)
  await page.waitFor(`!!document.querySelector('[data-product-detail="${id}"]')`)
}
async function returnToCatalog() {
  await page.evaluate("document.querySelector('.back-to-catalog').click()")
  await page.waitFor("!!document.querySelector('.catalog-controls')")
}
async function checkWidth(width) {
  const state=await page.evaluate(`({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:Array.from(document.querySelectorAll('main *, .storefront-nav *')).filter(el=>el.getBoundingClientRect().right>${width}+1&&el.getBoundingClientRect().width>1&&!el.classList.contains('sr-only')).map(el=>el.className)})`)
  assert.ok(state.scrollWidth<=width,JSON.stringify(state))
  assert.deepEqual(state.overflow,[],JSON.stringify(state))
}
try {
  await mkdir('.qa',{recursive:true})
  await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
  await navigate('/')
  await page.waitFor("document.querySelectorAll('.product-card').length===7")
  assert.equal(await page.evaluate("scrollY===0&&document.querySelectorAll('.hero').length===1&&document.querySelectorAll('main').length===1&&document.querySelector('.site-header').getAttribute('aria-hidden')==='true'"),true)
  assert.equal(await page.evaluate("document.querySelectorAll('.product-card dl,.product-card fieldset,.product-card .battery-badge').length"),0)
  assert.equal(await page.evaluate("document.body.textContent.includes('Precios en soles · Fotos referenciales')"),false)
  await page.evaluate("document.querySelector('.explore').click()")
  await page.waitFor("Math.abs(document.querySelector('#continuar').getBoundingClientRect().top)<2")
  assert.equal(await page.evaluate("document.activeElement.id"),'continuar')
  assert.deepEqual(await ids(),expected.map(([id])=>id))
  for (const [id,price,storage] of expected) {
    const card=await page.evaluate(`(()=>{const c=document.querySelector('[data-product="${id}"]');return {price:c.querySelector('.product-price strong').textContent,storage:c.querySelector('.storage-badge').textContent,link:c.querySelector('.catalog-button').href,logo:!!c.querySelector('[data-icon=whatsapp]')}})()`)
    assert.equal(card.price,price);assert.ok(card.storage.includes(storage));assert.ok(card.logo)
    const url=new URL(card.link);assert.equal(url.pathname,'/51977591210');assert.ok(url.searchParams.get('text').includes(price))
  }
  report.cards='7 published prices/capacities, authentic WhatsApp marks; specs and variants moved into detail'
  const logoPath=(await readFile('public/assets/icons/whatsapp.svg','utf8')).match(/<path d="([^"]+)"/)[1]
  assert.equal(await page.evaluate("document.querySelector('.storefront-contact [data-icon=whatsapp] path').getAttribute('d')"),logoPath)
  await choose(16);await page.waitFor("document.querySelectorAll('.product-card').length===2")
  await search('128');await page.waitFor("document.querySelectorAll('.product-card').length===1")
  assert.deepEqual(await ids(),['iphone-16-pro'])
  await page.evaluate('window.__catalogScroll=scrollY')
  await openDetail('iphone-16-pro')
  assert.match(await page.evaluate("document.querySelector('.detail-specifications').textContent"),/A18 Pro/)
  await page.evaluate('history.back()')
  await page.waitFor("!!document.querySelector('.catalog-controls') && Math.abs(scrollY-window.__catalogScroll)<2")
  await page.waitFor("document.activeElement.getAttribute('href')==='/iphone/iphone-16-pro'")
  assert.equal(await page.evaluate("document.activeElement.getAttribute('href')"),'/iphone/iphone-16-pro',await page.evaluate("JSON.stringify({active:document.activeElement.outerHTML.slice(0,180),state:history.state,url:location.href})"))
  await openDetail('iphone-16-pro')
  await returnToCatalog()
  await page.waitFor("document.querySelectorAll('.product-card').length===1")
  assert.equal(await page.evaluate("document.querySelector('.catalog-search input').value"),'128')
  assert.equal(await page.evaluate("document.activeElement.id"),'explorar')
  assert.equal(await page.evaluate("document.querySelector('[data-generation=\"16\"]').getAttribute('aria-pressed')"),'true')
  await search('inexistente');await page.waitFor("!!document.querySelector('.catalog-empty')")
  await page.evaluate("document.querySelector('.catalog-empty button').click()")
  await page.waitFor("document.querySelectorAll('.product-card').length===7")
  await sort('price-asc');await page.waitFor("document.querySelector('.product-card').dataset.product==='iphone-14-pro'")
  await openDetail('iphone-14-pro')
  await page.evaluate("document.querySelector('input[value=\"physical-sim\"]').click()")
  await page.waitFor("document.querySelector('.detail-price strong').textContent==='S/ 2,250'")
  let inquiry=new URL(await page.evaluate("document.querySelector('.detail-consult').href")).searchParams.get('text')
  assert.match(inquiry,/Chip físico.*S\/ 2,250/)
  await returnToCatalog();await page.waitFor("document.querySelectorAll('.product-card').length===7")
  assert.equal(await page.evaluate("document.querySelector('[data-product=iphone-14-pro] .product-price strong').textContent"),'S/ 2,250')
  assert.equal(await page.evaluate("document.querySelector('.catalog-sort select').value"),'price-asc')
  await openDetail('iphone-14-pro')
  assert.equal(await page.evaluate("document.querySelector('input[value=\"physical-sim\"]').checked"),true)
  await page.evaluate("document.querySelector('input[value=esim]').click()")
  await page.waitFor("document.querySelector('.detail-price strong').textContent==='S/ 2,200'")
  inquiry=new URL(await page.evaluate("document.querySelector('.detail-consult').href")).searchParams.get('text');assert.match(inquiry,/eSIM.*S\/ 2,200/)
  await returnToCatalog();await sort('price-desc');await page.waitFor("document.querySelector('.product-card').dataset.product==='iphone-17-pro-max'")
  await sort('newest')
  report.exploration='combined filtering/search, empty reset, sorting; Pinia preserves query, generation, sort and selected SIM across routes'

  // All direct/bookmarked detail routes expose the supplied specifications and actual photo.
  for (const [id,price,storage] of expected) {
    await navigate(`/iphone/${id}`);await page.waitFor(`!!document.querySelector('[data-product-detail="${id}"]')`)
    await page.waitFor("document.querySelector('.detail-photo img')?.complete&&document.querySelector('.detail-photo img')?.naturalWidth>0")
    assert.equal(await page.evaluate("document.querySelector('.detail-price strong').textContent"),price)
    assert.equal(await page.evaluate("document.querySelector('.detail-capacity').textContent"),storage)
    assert.equal(await page.evaluate("document.querySelectorAll('.detail-specifications dd').length"),4)
    assert.equal(await page.evaluate("document.querySelectorAll('.hero').length"),0)
  }
  await page.screenshot('.qa/catalog-detail-desktop.png')
  await navigate('/iphone/modelo-inexistente');await page.waitFor("!!document.querySelector('.detail-not-found')")
  assert.ok(await page.evaluate("document.querySelector('.detail-not-found h1').textContent.includes('no está')"))
  report.details='7 direct routes, published specifications/photos, meaningful not-found state; no fabricated gallery/stock/colors'
  await navigate('/#continuar');await page.waitFor("document.querySelectorAll('.product-card').length===7")
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  const responsive=[]
  for (const [width,height] of [[1920,1080],[1440,1000],[1024,768],[768,1024],[390,844],[320,568],[280,640],[844,390]]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<701})
    await page.evaluate("document.querySelector('#continuar').scrollIntoView({behavior:'instant'})");await delay(120)
    await checkWidth(width)
    assert.equal(await page.evaluate("Array.from(document.querySelectorAll('.product-card-reveal')).every(c=>getComputedStyle(c).opacity==='1'&&getComputedStyle(c).transform==='none')"),true)
    if(width===1440)await page.screenshot('.qa/catalog-desktop.png')
    if(width===390)await page.screenshot('.qa/catalog-mobile.png')
    // Native router navigation must leave headings below the fixed header.
    for (const hash of ['#como-comprar','#contacto']) {
      await page.evaluate(`document.querySelector('.storefront-nav-links a[href="/${hash}"]').click()`)
      await page.waitFor(`location.hash==='${hash}'`);await delay(100)
      assert.ok(await page.evaluate(`document.querySelector('${hash}').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom-1`),`${width} ${hash} covered by header`)
      assert.equal(await page.evaluate("document.activeElement.id"),hash.slice(1))
      if(hash==='#contacto') assert.equal(await page.evaluate("document.querySelector('.storefront-nav-links [aria-current]').getAttribute('href')"),'/#contacto')
    }
    if(width===1440)await page.screenshot('.qa/catalog-contact-desktop.png')
    await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#explorar\"]').click()")
    await page.waitFor("location.hash==='#explorar'");await delay(100)
    assert.ok(await page.evaluate("document.querySelector('.catalog-controls').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom-1"))
    responsive.push([width,height])
  }
  report.responsive=responsive
  for(const width of [1024,768,390,320,280]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<701})
    await navigate('/iphone/iphone-14-pro');await page.waitFor("!!document.querySelector('input[value=esim]')")
    await checkWidth(width)
    if(width===390){await page.screenshot('.qa/catalog-detail-mobile.png');await page.evaluate("document.querySelector('.variant-picker').scrollIntoView({behavior:'instant',block:'center'})");await page.screenshot('.qa/catalog-detail-mobile-variant.png')}
  }
  await navigate('/#contacto');await page.waitFor("!!document.querySelector('.catalog-advisors')")
  const advisorLinks=await page.evaluate("Array.from(document.querySelectorAll('.catalog-advisors a'),a=>new URL(a.href).pathname)")
  assert.deepEqual(advisorLinks,['/51977591210','/51949092211'])
  assert.ok(await page.evaluate("document.querySelector('.commercial-conditions').textContent.includes('octubre de 2026')"))
  assert.equal(await page.evaluate("Array.from(document.querySelectorAll('a[target=_blank]')).every(a=>a.rel.includes('noopener')&&a.rel.includes('noreferrer'))"),true)
  await page.evaluate("document.querySelector('.photo-credits summary').click()")
  assert.equal(await page.evaluate("document.querySelectorAll('.photo-credits a').length"),6)
  // Graceful photo failure leaves the product information and inquiry usable.
  await openDetail('iphone-17-pro-max');await page.evaluate("document.querySelector('.detail-photo img').dispatchEvent(new Event('error'))")
  await page.waitFor("!!document.querySelector('.detail-photo .photo-fallback')")
  assert.ok(await page.evaluate("!!document.querySelector('.detail-consult[href]')"))
  report.commerce='both advisors, contextual inquiries, price-confirmation terms, image fallback, credits and safe external links verified; no messages sent'
  for(const [path,hash] of [['public/assets/brand/selc-original.png','fe759eba872920bba9e2d0256926db56635685fcda9f9982638082810f67c6f5'],['public/assets/brand/selc-imagotype.glb','36f00f9c360a8456915e0a204c83bae88c7a1e33dc458e827a8a1e8265529851'],['src/brand/presentation/components/ChromeSymbol.vue','8d668168c4164b4ca2c80fc70a366d26c17d1b35b976b6bc21554256fc350bed'],['src/catalog/infrastructure/selc-catalog.ts','13ddeddf66e3469e0e597fd7588ce943bb1a339d3547198daa320a4ffbeb160f'],['src/catalog/application/whatsapp.ts','d654bfab72539157f464889a9340e8daac3a63110853c32d4d2620ac43230b2b']]) assert.equal(createHash('sha256').update(await readFile(path)).digest('hex'),hash)
  assert.deepEqual(page.errors,[]);report.browserErrors=page.errors
  await writeFile('.qa/catalog-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
} catch(error) { await page.screenshot('.qa/catalog-failure.png');console.error(JSON.stringify({report,errors:page.errors},null,2));throw error }
finally { await page.close() }
