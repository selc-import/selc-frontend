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
const accessories = [
  ['case-magsafe', 'Case MagSafe (carga inalámbrica)', 'S/ 14.99'],
  ['cubo-de-carga', 'Cubo de carga', 'S/ 35'],
  ['cable-c-a-c-o-lightning', 'Cable C a C o C a Lightning', 'S/ 19.90'],
  ['vidrio-mate-ceramic-shield', 'Vidrio Mate Ceramic Shield', 'S/ 9.90'],
  ['airpods-4ta-generacion', 'AirPods 4ta Generación', 'S/ 179.90'],
  ['airpods-pro-2da-generacion', 'AirPods Pro 2da Generación', 'S/ 129.90'],
]
// Commercial expectations from the supplied WhatsApp list, in its exact order.
const discountOffers = [
  ['pack-infiel','😏 PACK INFIEL',469.60,249.99,219.61,46,[['AirPods 4ta Generación',2],['Cubo',2],['Cable C a C o C a Lightning',2]]],
  ['pack-doble-vida','🕵️ PACK DOBLE VIDA',139.78,109.90,29.88,21,[['Case MagSafe',2],['Cubo',2],['Cable C a C o C a Lightning',2]]],
  ['pack-crush','💘 PACK CRUSH',164.79,124.99,39.80,24,[['AirPods Pro 2da Generación',1],['Case MagSafe',1],['Cable C a C o C a Lightning',1]]],
  ['pack-salvavidas','🪫 PACK SALVAVIDAS',69.89,54.90,14.99,21,[['Cubo',1],['Cable C a C o C a Lightning',1],['Case MagSafe',1]]],
  ['pack-universitario','🎓 PACK UNIVERSITARIO',64.80,52.90,11.90,18,[['Cubo',1],['Cable C a C o C a Lightning',1],['Vidrio Matte Ceramic',1]]],
  ['pack-cumple','🎂 PACK CUMPLE',199.80,119.99,79.81,39,[['AirPods 4ta Generación',1],['Cable C a C o C a Lightning',1]]],
  ['pack-mayorista','🏭 PACK MAYORISTA',549,320,229,41,[['Cubo',10],['Cable C a C o C a Lightning',10]]],
  ['revendedor-airpods','💰REVENDEDOR AIRPODS',704.40,369.99,334.41,47,[['AirPods 4ta Generación',3],['Cubo',3],['Cable C a C o C a Lightning',3]]],
  ['solo-cables-12','💰SOLO CABLES 12',238.80,179.90,58.90,24,[['Cable C a C o C a Lightning',12]]],
  ['solo-cubos-12','💰SOLO CUBOS 12',420,189.90,230.10,54,[['Cubo',12]]],
  ['pack-8','💰PACK 8',219.60,159.90,59.70,27,[['Cubo',4],['Cable C a C o C a Lightning',4]]],
  ['solo-cables-6','⚡SOLO CABLES 6',119.40,94.90,24.50,20,[['Cable C a C o C a Lightning',6]]],
  ['solo-cubos-6','⚡ SOLO CUBOS 6',210,99.90,110.10,52,[['Cubo',6]]],
]
const priceLabel = amount => `S/ ${amount.toLocaleString('en-US',{minimumFractionDigits:Number.isInteger(amount)?0:2,maximumFractionDigits:2})}`
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
  await page.waitFor("document.querySelectorAll('.product-card').length===13")
  assert.equal(await page.evaluate("scrollY===0&&document.querySelectorAll('.hero').length===1&&document.querySelectorAll('main').length===1&&document.querySelector('.site-header').getAttribute('aria-hidden')==='true'"),true)
  assert.equal(await page.evaluate("document.querySelectorAll('.product-card dl,.product-card fieldset,.product-card .battery-badge').length"),0)
  assert.equal(await page.evaluate("document.body.textContent.includes('Precios en soles · Fotos referenciales')"),false)
  await page.evaluate("document.querySelector('.explore').click()")
  await page.waitFor("Math.abs(document.querySelector('#continuar').getBoundingClientRect().top)<2")
  assert.equal(await page.evaluate("document.activeElement.id"),'continuar')
  assert.deepEqual(await ids(),[...expected,...accessories].map(([id])=>id))
  for (const [id,price,storage] of expected) {
    const card=await page.evaluate(`(()=>{const c=document.querySelector('[data-product="${id}"]');return {price:c.querySelector('.product-price strong').textContent,storage:c.querySelector('.storage-badge').textContent,link:c.querySelector('.catalog-button').href,logo:!!c.querySelector('[data-icon=whatsapp]')}})()`)
    assert.equal(card.price,price);assert.ok(card.storage.includes(storage));assert.ok(card.logo)
    const url=new URL(card.link);assert.equal(url.pathname,'/51977591210');assert.ok(url.searchParams.get('text').includes(price))
  }
  report.cards='7 published prices/capacities, authentic WhatsApp marks; specs and variants moved into detail'
  const logoPath=(await readFile('public/assets/icons/whatsapp.svg','utf8')).match(/<path d="([^"]+)"/)[1]
  assert.equal(await page.evaluate("document.querySelector('.storefront-contact [data-icon=whatsapp] path').getAttribute('d')"),logoPath)

  assert.deepEqual(await page.evaluate("Array.from(document.querySelectorAll('.generation-filter button'),button=>button.textContent)"), ['Todos','iPhone 17','iPhone 16','iPhone 15','iPhone 14','Accesorios'])
  const domain = await page.evaluate(`(async () => {
    const moduleUrl=path=>performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname===path)?.name??path;
    const { PromoEntity } = await import(moduleUrl('/src/catalog/domain/model/promo.entity.ts'));
    const { getPromos } = await import(moduleUrl('/src/catalog/infrastructure/promo.service.ts'));
    const data = { id: 'test', name: 'Prueba', description: 'Combo', items: [{productName:'Cubo',quantity:2}], priceSoles:10 };
    const valid = new PromoEntity(data);
    const invalid = [{id:''},{name:' '},{description:''},{priceSoles:0},{priceSoles:-1},{priceSoles:NaN},{priceSoles:Infinity},{items:[]}, ...[0,-1,1.5,NaN,Infinity].map(quantity=>({items:[{productName:'Cubo',quantity}]})), {items:[{productName:' ',quantity:1}]}, ...[NaN,Infinity,0,-1,9.99,10,10.004].map(regularPriceSoles=>({regularPriceSoles}))];
    const rejected = invalid.every(change => { try {new PromoEntity({...data,...change});return false} catch {return true} });
    data.items[0].quantity = 99;
    const start = performance.now();
    const promos = await getPromos();
    return { rejected, summary:valid.itemsSummary, immutable:Object.isFrozen(valid.items)&&Object.isFrozen(valid.items[0]), noDiscount:!valid.hasDiscount&&valid.savingsSoles===0&&valid.discountPercentage===0, latency:performance.now()-start, promos:promos.map(promo=>({id:promo.id,price:promo.priceSoles,total:promo.items.reduce((sum,item)=>sum+item.quantity,0),entity:promo instanceof PromoEntity})), offers:promos.filter(promo=>promo.hasDiscount).map(promo=>[promo.id,promo.name,promo.regularPriceSoles,promo.priceSoles,promo.savingsSoles,promo.discountPercentage,promo.items.map(item=>[item.productName,item.quantity])]) };
  })()`)
  assert.equal(domain.rejected,true); assert.equal(domain.immutable,true); assert.equal(domain.summary,'2 × Cubo'); assert.ok(domain.latency>=280)
  assert.equal(domain.noDiscount,true)
  assert.deepEqual(domain.offers,discountOffers)
  assert.deepEqual(domain.promos.slice(13),[{id:'combo-esencial',price:139.99,total:4,entity:true},{id:'promo-emprendedora',price:200,total:12,entity:true}])
  assert.equal(domain.promos.every(promo=>promo.entity),true)
  // Exercise rejection and retry in an isolated store without invalidating the page's cached promos.
  const retry = await page.evaluate(`(async()=>{
    const piniaUrl=performance.getEntriesByType('resource').find(entry=>entry.name.includes('/pinia.js?')).name;
    const {createPinia,setActivePinia}=await import(piniaUrl);
    const moduleUrl=path=>performance.getEntriesByType('resource').find(entry=>new URL(entry.name).pathname===path)?.name??path;
    const {usePromosStore}=await import(moduleUrl('/src/catalog/application/usePromos.ts'));
    const {promoMockData}=await import(moduleUrl('/src/catalog/infrastructure/promo.mock-data.ts'));
    const appPinia=document.querySelector('#app').__vue_app__.config.globalProperties.$pinia;
    const store=usePromosStore(createPinia());
    try {
      promoMockData[0].items[0].quantity=0;
      const request=store.loadPromos();const loading=store.loading;await request;
      const failed=!!store.error&&!store.loading&&store.promos.length===0;
      promoMockData[0].items[0].quantity=2;await store.loadPromos();
      return {loading,failed,recovered:!store.error&&!store.loading&&store.promos.length===15};
    } finally {promoMockData[0].items[0].quantity=2;setActivePinia(appPinia)}
  })()`)
  assert.deepEqual(retry,{loading:true,failed:true,recovered:true})
  assert.deepEqual(await page.evaluate("Array.from(document.querySelectorAll('.storefront-nav-links a'),link=>link.textContent)"),['iPhones','Accesorios','Cómo comprar','Contacto'])
  assert.equal(await page.evaluate("document.querySelectorAll('#catalog-products .accessory-card').length"),0)
  assert.equal(await page.evaluate("document.querySelectorAll('#accesorios .accessory-card').length"),6)
  await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#accesorios\"]').click()")
  await page.waitFor("location.hash==='#accesorios' && document.querySelectorAll('.product-card').length===6")
  await page.waitFor("document.querySelectorAll('.promo-card').length===15 && !document.querySelector('.catalog-promos .promo-status')")
  assert.deepEqual(await ids(), accessories.map(([id])=>id))
  assert.equal(await page.evaluate("document.querySelectorAll('#catalog-products .promo-card, .promo-card[data-product], .accessory-card .storage-badge, .accessory-card .variant-picker').length"),0)
  for (const [id,name,price] of accessories) {
    const card = await page.evaluate(`(()=>{const card=document.querySelector('[data-product="${id}"]');return {name:card.querySelector('h3').textContent,price:card.querySelector('.product-price strong').textContent,stock:card.querySelector('.accessory-stock').textContent.trim(),link:card.querySelector('.product-consult').href}})()`)
    assert.equal(card.name,name); assert.equal(card.price,price); assert.equal(card.stock,'disponible')
    const url = new URL(card.link); assert.equal(url.pathname,'/51977591210')
    assert.ok(url.searchParams.get('text').includes(name)); assert.ok(url.searchParams.get('text').includes(price)); assert.ok(!url.searchParams.get('text').includes('Separa'))
  }
  for (const [id,name,price] of [['combo-esencial','Combo Esencial','S/ 139.99'],['promo-emprendedora','Promo Emprendedora','S/ 200']]) {
    const card = await page.evaluate(`(()=>{const card=document.querySelector('[data-promo="${id}"]');return {name:card.querySelector('h4').textContent,price:card.querySelector('.promo-price').textContent,summary:card.querySelector('.promo-items').textContent,link:card.querySelector('.promo-consult').href,featured:card.classList.contains('promo-card--featured')}})()`)
    assert.equal(card.name,name); assert.equal(card.price,price); assert.equal(card.featured,id==='promo-emprendedora')
    assert.ok(new URL(card.link).searchParams.get('text').includes(name)); assert.match(card.summary,/× Cubo.* y /)
  }
  const sortedPromoIds = [...discountOffers.map(([id,,,price])=>[id,price]),['combo-esencial',139.99],['promo-emprendedora',200]]
    .sort((a,b)=>a[1]-b[1]).map(([id])=>id)
  assert.deepEqual(await page.evaluate("Array.from(document.querySelectorAll('.catalog-promos .promo-card'),card=>card.dataset.promo)"),sortedPromoIds)
  for (const [id,name,regularPrice,price,savings,percentage] of discountOffers) {
    const card=await page.evaluate(`(()=>{const card=document.querySelector('[data-promo="${id}"]');return {name:card.querySelector('h4').textContent,regular:card.querySelector('del').textContent,decoration:getComputedStyle(card.querySelector('del')).textDecorationLine,price:card.querySelector('.promo-price').textContent,savings:card.querySelector('.promo-savings strong').textContent,badge:card.querySelector('.promo-badge').textContent,fire:card.querySelector('.promo-fire').textContent,link:card.querySelector('.promo-consult').href}})()`)
    assert.equal(card.name,name); assert.equal(card.regular,priceLabel(regularPrice)); assert.ok(card.decoration.includes('line-through'))
    assert.equal(card.price,priceLabel(price)); assert.equal(card.savings,priceLabel(savings)); assert.equal(card.badge,`${percentage}% menos`); assert.equal(card.fire,'🔥')
    const inquiry=new URL(card.link).searchParams.get('text'); assert.ok(inquiry.includes(name)); assert.ok(inquiry.includes(priceLabel(price)))
  }
  assert.equal(await page.evaluate("document.querySelector('[data-promo=pack-infiel] .promo-description').textContent"),'Uno para ella y otro para "la otra"')
  assert.equal(await page.evaluate("document.querySelector('[data-promo=pack-doble-vida] .promo-description').textContent"),'Dos de todo, cero preguntas')
  assert.equal(await page.evaluate("document.querySelectorAll('[data-promo=combo-esencial] del,[data-promo=combo-esencial] .promo-savings,[data-promo=promo-emprendedora] del,[data-promo=promo-emprendedora] .promo-savings').length"),0)
  assert.equal(await page.evaluate("document.querySelector('[data-promo=promo-emprendedora] .promo-description').textContent"),'12 accesorios por tan solo S/ 200')
  await sort('price-asc'); await page.waitFor("document.querySelector('.product-card').dataset.product==='vidrio-mate-ceramic-shield'")
  assert.deepEqual(await ids(),['vidrio-mate-ceramic-shield','case-magsafe','cable-c-a-c-o-lightning','cubo-de-carga','airpods-pro-2da-generacion','airpods-4ta-generacion'])
  await search('Cable'); await page.waitFor("document.querySelectorAll('.product-card').length===1")
  assert.deepEqual(await ids(),['cable-c-a-c-o-lightning']); assert.equal(await page.evaluate("document.querySelectorAll('.promo-card').length"),15)
  await search(''); await sort('newest'); await page.waitFor("document.querySelectorAll('.product-card').length===6")
  await page.evaluate("document.querySelector('#explorar').scrollIntoView({behavior:'instant'})"); await delay(350)
  await page.screenshot('.qa/catalog-accessories-desktop.png')
  await page.evaluate("document.querySelector('#app').__vue_app__.config.globalProperties.$router.push('/iphone/iphone-17-pro-max')"); await page.waitFor("!!document.querySelector('.detail-box')")
  await returnToCatalog(); await page.waitFor("document.querySelectorAll('.accessory-card').length===6 && document.querySelectorAll('.promo-card').length===15")
  report.accessories='6 supplied prices and available stock, category/search/price sorting, category retained across detail navigation, dedicated WhatsApp inquiries'
  report.promos='15 promos in ascending sale-price order; 13 offers preserve emojis, regular/sale prices, strikethrough, cent-accurate savings and conservative percentages; validation/loading/retry and WhatsApp links verified'

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
  await page.waitFor("document.querySelectorAll('.product-card').length===13")
  await sort('price-asc');await page.waitFor("document.querySelector('.product-card').dataset.product==='iphone-14-pro'")
  await choose(14);await page.waitFor("document.querySelectorAll('.product-card').length===1")
  await openDetail('iphone-14-pro')
  await page.evaluate("document.querySelector('input[value=\"physical-sim\"]').click()")
  await page.waitFor("document.querySelector('.detail-price strong').textContent==='S/ 2,250'")
  let inquiry=new URL(await page.evaluate("document.querySelector('.detail-consult').href")).searchParams.get('text')
  assert.match(inquiry,/Chip físico.*S\/ 2,250/)
  await returnToCatalog();await page.waitFor("document.querySelectorAll('.product-card').length===1")
  assert.equal(await page.evaluate("document.querySelector('[data-product=iphone-14-pro] .product-price strong').textContent"),'S/ 2,250')
  assert.equal(await page.evaluate("document.querySelector('.catalog-sort select').value"),'price-asc')
  await openDetail('iphone-14-pro')
  assert.equal(await page.evaluate("document.querySelector('input[value=\"physical-sim\"]').checked"),true)
  await page.evaluate("document.querySelector('input[value=esim]').click()")
  await page.waitFor("document.querySelector('.detail-price strong').textContent==='S/ 2,200'")
  inquiry=new URL(await page.evaluate("document.querySelector('.detail-consult').href")).searchParams.get('text');assert.match(inquiry,/eSIM.*S\/ 2,200/)
  await returnToCatalog();await choose('all');await sort('price-desc');await page.waitFor("document.querySelector('.product-card').dataset.product==='iphone-17-pro-max'")
  await sort('newest')
  report.exploration='combined filtering/search, empty reset, sorting; Pinia preserves query, generation, sort and selected SIM across routes'

  // All direct/bookmarked detail routes expose the supplied specifications and actual photo.
  for (const [id,price,storage] of expected) {
    await navigate(`/iphone/${id}`);await page.waitFor(`!!document.querySelector('[data-product-detail="${id}"]')`)
    await page.waitFor("document.querySelector('.detail-photo img')?.complete&&document.querySelector('.detail-photo img')?.naturalWidth>0")
    assert.equal(await page.evaluate("document.querySelector('.detail-price strong').textContent"),price)
    assert.equal(await page.evaluate("document.querySelector('.detail-capacity').textContent"),storage)
    assert.equal(await page.evaluate("document.querySelectorAll('.detail-specifications dd').length"),4)
    assert.deepEqual(await page.evaluate("Array.from(document.querySelectorAll('.detail-box li'),item=>item.textContent.trim())"),['Cubo','Cable','Case','Mica'])
    assert.equal(await page.evaluate("document.querySelectorAll('.detail-box [data-icon=check]').length"),4)
    assert.equal(await page.evaluate("document.querySelectorAll('.hero').length"),0)
  }
  await page.screenshot('.qa/catalog-detail-desktop.png')
  await navigate('/iphone/modelo-inexistente');await page.waitFor("!!document.querySelector('.detail-not-found')")
  assert.ok(await page.evaluate("document.querySelector('.detail-not-found h1').textContent.includes('no está')"))
  report.details='7 direct routes, published specifications/photos, meaningful not-found state; no fabricated gallery/stock/colors'
  await navigate('/#continuar');await page.waitFor("document.querySelectorAll('.product-card').length===13")
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
      if(hash==='#contacto') await page.waitFor("document.querySelector('.storefront-nav-links [aria-current]')?.getAttribute('href')==='/#contacto'")
    }
    if(width===1440)await page.screenshot('.qa/catalog-contact-desktop.png')
    await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#explorar\"]').click()")
    await page.waitFor("location.hash==='#explorar'");await delay(100)
    assert.ok(await page.evaluate("document.querySelector('.catalog-controls').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom-1"))
    await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#accesorios\"]').click()")
    await page.waitFor("location.hash==='#accesorios' && document.querySelectorAll('.product-card').length===6 && document.querySelectorAll('#accesorios .promo-card').length===15")
    await page.waitFor("document.activeElement.id==='accesorios' && document.querySelector('#accesorios').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom-1")
    await page.waitFor("document.querySelector('.storefront-nav-links [aria-current]')?.getAttribute('href')==='/#accesorios'")
    await checkWidth(width)
    if(width===390)await page.screenshot('.qa/catalog-accessories-header-mobile.png')
    if(width===1440)await page.screenshot('.qa/catalog-accessories-header-desktop.png')
    await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#explorar\"]').click()")
    await page.waitFor("location.hash==='#explorar' && document.querySelectorAll('.product-card').length===13")
    responsive.push([width,height])
  }
  report.responsive=responsive
  await choose('Accesorios'); await page.waitFor("document.querySelectorAll('.promo-card').length===15 && document.querySelectorAll('.product-card').length===6")
  for (const width of [1440,1024,768,390,320,280]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<701})
    await page.evaluate("document.querySelector('#explorar').scrollIntoView({behavior:'instant'})"); await delay(120)
    await checkWidth(width)
    assert.equal(await page.evaluate("(()=>{const button=document.querySelector('.generation-filter [aria-pressed=true]').getBoundingClientRect(),indicator=document.querySelector('.generation-indicator').getBoundingClientRect();return Math.abs(button.x-indicator.x)<1&&Math.abs(button.y-indicator.y)<1&&Math.abs(button.width-indicator.width)<1&&Math.abs(button.height-indicator.height)<1})()"),true)
    if (width===390) await page.screenshot('.qa/catalog-accessories-mobile.png')
    if (width===1440) await page.screenshot('.qa/catalog-accessories-desktop.png')
  }
  await choose('all'); await page.waitFor("document.querySelectorAll('.product-card').length===13 && document.querySelectorAll('#accesorios .promo-card').length===15")
  for(const width of [1024,768,390,320,280]) {
    await page.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<701})
    await navigate('/iphone/iphone-14-pro');await page.waitFor("!!document.querySelector('input[value=esim]')")
    await checkWidth(width)
    if(width===390){await page.screenshot('.qa/catalog-detail-mobile.png');await page.evaluate("document.querySelector('.variant-picker').scrollIntoView({behavior:'instant',block:'center'})");await page.screenshot('.qa/catalog-detail-mobile-variant.png')}
  }
  await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#accesorios\"]').click()")
  await page.waitFor("location.hash==='#accesorios' && document.querySelectorAll('#accesorios .accessory-card').length===6 && document.querySelectorAll('#accesorios .promo-card').length===15")
  await navigate('/#accesorios')
  await page.waitFor("document.querySelectorAll('.product-card').length===6 && document.querySelectorAll('#accesorios .promo-card').length===15")
  assert.equal(await page.evaluate("document.querySelector('[data-generation=Accesorios]').getAttribute('aria-pressed')"),'true')
  report.navigation='header Accesorios opens its own section from the catalog and detail; direct anchor, active state, focus, iPhones return and responsive menu verified'
  await navigate('/#contacto');await page.waitFor("!!document.querySelector('.catalog-advisors')")
  const advisorLinks=await page.evaluate("Array.from(document.querySelectorAll('.catalog-advisors a'),a=>new URL(a.href).pathname)")
  assert.deepEqual(advisorLinks,['/51977591210','/51949092211'])
  assert.ok(await page.evaluate("document.querySelector('.commercial-conditions').textContent.includes('octubre de 2026')"))
  assert.equal(await page.evaluate("Array.from(document.querySelectorAll('a[target=_blank]')).every(a=>a.rel.includes('noopener')&&a.rel.includes('noreferrer'))"),true)
  await page.evaluate("document.querySelector('.photo-credits summary').click()")
  assert.equal(await page.evaluate("document.querySelectorAll('.photo-credits a').length"),6)
  // Graceful photo failure leaves the product information and inquiry usable.
  await page.evaluate("document.querySelector('.storefront-nav-links a[href=\"/#explorar\"]').click()")
  await page.waitFor("document.querySelectorAll('.product-card').length===13")
  await openDetail('iphone-17-pro-max');await page.evaluate("document.querySelector('.detail-photo img').dispatchEvent(new Event('error'))")
  await page.waitFor("!!document.querySelector('.detail-photo .photo-fallback')")
  assert.ok(await page.evaluate("!!document.querySelector('.detail-consult[href]')"))
  report.commerce='both advisors, contextual inquiries, price-confirmation terms, image fallback, credits and safe external links verified; no messages sent'
  // Catalog data/messages are checked by behavior above. Normalize Windows source line endings only.
  for(const [path,hash] of [['public/assets/brand/selc-original.png','fe759eba872920bba9e2d0256926db56635685fcda9f9982638082810f67c6f5'],['public/assets/brand/selc-imagotype.glb','36f00f9c360a8456915e0a204c83bae88c7a1e33dc458e827a8a1e8265529851'],['src/brand/presentation/components/ChromeSymbol.vue','8d668168c4164b4ca2c80fc70a366d26c17d1b35b976b6bc21554256fc350bed']]) {
    const data = await readFile(path)
    assert.equal(createHash('sha256').update(path.endsWith('.vue') ? data.toString('utf8').replaceAll('\r\n','\n') : data).digest('hex'),hash)
  }
  assert.deepEqual(page.errors,[]);report.browserErrors=page.errors
  await writeFile('.qa/catalog-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2))
} catch(error) { await page.screenshot('.qa/catalog-failure.png');console.error(JSON.stringify({report,errors:page.errors},null,2));throw error }
finally { await page.close() }
