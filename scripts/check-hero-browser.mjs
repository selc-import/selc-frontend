/** Requires local Vite and a dedicated Chrome DevTools endpoint on 9333. */
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { connectPage } from './cdp-client.mjs'

const page=await connectPage()
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const snapshot=`(()=>{
  const hero=document.querySelector('.hero'),canvas=document.querySelector('.imagotype-scene canvas');
  const ctx=canvas?.__vueParentComponent?.exposed?.context?.value;
  const root=ctx?.scene.value.getObjectByName('SELC_Imagotype_3D');
  const meshes=[];const corners=[];
  root?.traverse(object=>{
    if(!object.isMesh)return;
    const g=object.geometry;if(!g.boundingBox)g.computeBoundingBox();const box=g.boundingBox;
    const m=object.material;
    meshes.push({name:object.name,depth:box.max.z-box.min.z,opacity:m.opacity,imageTexture:!!(m.map||m.normalMap||m.alphaMap),metalness:m.metalness});
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
      const v=box.min.clone().set(x,y,z).applyMatrix4(object.matrixWorld).project(ctx.camera.value);corners.push([v.x,v.y]);
    }
  });
  return {phase:hero?.dataset.phase,presentation:hero?.dataset.presentation,scene:hero?.dataset.scene,
    canvas:!!canvas,rotation:root?.rotation.toArray(),groups:root?.children.map(o=>o.name),meshes,corners,
    images:document.querySelectorAll('.hero img').length,phases:window.__heroPhases,
    width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,
    frame:document.querySelector('.brand-frame').getBoundingClientRect().toJSON(),
    footer:document.querySelector('.explore').getBoundingClientRect().toJSON(),
    headerVisible:document.querySelector('.site-header').getAttribute('aria-hidden')==='false',
    stageOpacity:getComputedStyle(document.querySelector('.hero-content')).opacity,
    fallback:!!document.querySelector('.brand-fallback img')?.complete,
  };
})()`
const observeCleanup=`(()=>{
  const ctx=document.querySelector('canvas').__vueParentComponent.exposed.context.value;
  const root=ctx.scene.value.getObjectByName('SELC_Imagotype_3D');
  window.__renderer=ctx.renderer.value;window.__geometryNames=new Set();window.__materialNames=new Set();window.__rendererDisposed=false;
  root.traverse(o=>{if(o.isMesh){o.geometry.addEventListener('dispose',()=>window.__geometryNames.add(o.name));o.material.addEventListener('dispose',()=>window.__materialNames.add(o.material.name));}});
  const dispose=ctx.renderer.value.dispose.bind(ctx.renderer.value);ctx.renderer.value.dispose=()=>{window.__rendererDisposed=true;dispose()};
})()`
const cleanup=`({geometries:window.__geometryNames.size,materials:window.__materialNames.size,renderer:window.__rendererDisposed,contextLost:window.__renderer.getContext().isContextLost(),remaining:window.__renderer.info.memory.geometries})`
function checkModel(state){
  assert.equal(state.presentation,'model')
  assert.equal(state.scene,'ready')
  assert.ok(state.canvas,'The canvas must remain after the introduction')
  assert.equal(state.images,0,'The successful hero must not render an image')
  assert.equal(state.meshes.length,52)
  assert.deepEqual(state.groups,['isotype','wordmark','import','descriptor'])
  assert.ok(state.meshes.every(m=>m.depth>.03 && !m.imageTexture && m.opacity===1 && m.metalness===1),'Every part must be a solid PBR mesh, without image textures')
  assert.ok(state.corners.every(([x,y])=>Math.abs(x)<1 && Math.abs(y)<1),'Keep the entire model inside the camera')
}
function checkReleased(state){assert.equal(state.geometries,52);assert.equal(state.materials,5);assert.ok(state.renderer&&state.contextLost);assert.equal(state.remaining,0)}
async function reloadAtTop(){await page.evaluate("history.replaceState(null,'','/');scrollTo({top:0,behavior:'instant'})");await page.send('Page.reload')}
try{
  await mkdir('.qa',{recursive:true})
  const source=await readFile('public/assets/brand/selc-original.png')
  const sourceHash=createHash('sha256').update(source).digest('hex')
  assert.equal(sourceHash,'fe759eba872920bba9e2d0256926db56635685fcda9f9982638082810f67c6f5')
  await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__heroPhases=['dark'];new MutationObserver(()=>{const p=document.querySelector('.hero')?.dataset.phase;if(p&&p!==window.__heroPhases.at(-1))window.__heroPhases.push(p)}).observe(document,{subtree:true,attributes:true,attributeFilter:['data-phase']});
  `})
  await page.send('Page.navigate',{url:'http://localhost:5173/'})
  await page.waitFor("document.querySelector('.hero')?.dataset.phase==='rotate'",24000)
  const rotatingA=await page.evaluate(snapshot)
  await delay(300)
  assert.notEqual((await page.evaluate(snapshot)).rotation[1],rotatingA.rotation[1])
  await page.waitFor("document.querySelector('.hero')?.dataset.presentation==='model'",24000)
  const final=await page.evaluate(snapshot)
  checkModel(final)
  assert.deepEqual(final.phases,['dark','reveal','rotate','shine','wordmark','idle'])
  await page.screenshot('.qa/imagotype-3d-desktop.png')
  await delay(700)
  const moving=await page.evaluate(snapshot)
  checkModel(moving)
  assert.notEqual(moving.rotation[1],final.rotation[1],'The whole imagotype should turn slowly')
  // Capture actual sides and backs: this cannot be produced by a flat image.
  await page.evaluate(`(()=>{const ctx=document.querySelector('canvas').__vueParentComponent.exposed.context.value;ctx.loop.pause();const root=ctx.scene.value.getObjectByName('SELC_Imagotype_3D');root.rotation.set(.10,.65,0);root.updateMatrixWorld(true);ctx.renderer.value.render(ctx.scene.value,ctx.camera.value)})()`)
  await page.screenshot('.qa/imagotype-3d-angled.png')
  await page.evaluate("document.querySelector('canvas').__vueParentComponent.exposed.context.value.loop.resume()")

  const responsive=[]
  for(const [width,height] of [[1920,1080],[1366,768],[768,1024],[390,844],[320,568],[844,390]]){
    await page.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<701})
    await delay(300)
    const state=await page.evaluate(snapshot);checkModel(state)
    assert.ok(state.scrollWidth<=width)
    assert.ok(state.frame.bottom<state.footer.top,'Keep the scroll control clear of the scene')
    responsive.push({width,height,framed:true,overflow:false})
    if(width===390)await page.screenshot('.qa/imagotype-3d-mobile.png')
    if(width===1920)await page.screenshot('.qa/imagotype-3d-large-desktop.png')
  }
  await page.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false})
  await page.evaluate("scrollTo({top:document.scrollingElement.scrollHeight,behavior:'instant'})")
  await page.waitFor("document.querySelector('.site-header').getAttribute('aria-hidden')==='false'")
  assert.ok(+(await page.evaluate(snapshot)).stageOpacity<.03)
  assert.equal(await page.evaluate("!!document.querySelector('.site-header svg') && !document.querySelector('.site-header img')"),true)
  await reloadAtTop()
  await page.waitFor("document.querySelector('.hero')?.dataset.phase==='reveal'",24000)
  await page.evaluate("document.querySelector('.explore').click()")
  await page.waitFor("document.querySelector('.hero')?.dataset.presentation==='model' && scrollY>0")
  assert.equal((await page.evaluate(snapshot)).images,0,'Skipping must settle the 3D model, not replace it with an image')

  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await reloadAtTop()
  await page.waitFor("document.querySelector('.hero')?.dataset.presentation==='fallback' && document.querySelector('.brand-fallback img')?.complete")
  const reduced=await page.evaluate(snapshot)
  assert.equal(reduced.canvas,false)
  assert.ok(reduced.fallback)
  assert.equal(await page.evaluate("performance.getEntriesByType('resource').filter(entry=>entry.name.includes('selc-imagotype.glb')).length"),0)

  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]})
  await reloadAtTop()
  await page.waitFor("document.querySelector('.hero')?.dataset.phase==='rotate'",24000)
  await page.evaluate(observeCleanup)
  await page.evaluate("document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()")
  await page.waitFor("document.querySelector('.hero')?.dataset.presentation==='fallback' && document.querySelector('.brand-fallback img')?.complete")
  const released=await page.evaluate(cleanup);checkReleased(released)

  const unsupported=await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return String(type).startsWith('webgl')?null:original.call(this,type,...args)}`})
  await reloadAtTop()
  await page.waitFor("document.querySelector('.hero')?.dataset.presentation==='fallback' && document.querySelector('.brand-fallback img')?.complete")
  assert.equal((await page.evaluate(snapshot)).canvas,false)
  await page.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:unsupported.identifier})

  await reloadAtTop()
  await page.waitFor("document.querySelector('.hero')?.dataset.phase==='rotate'",24000)
  await page.evaluate(observeCleanup)
  await page.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]})
  await page.waitFor("document.querySelector('.hero')?.dataset.presentation==='fallback'")
  checkReleased(await page.evaluate(cleanup))
  assert.equal(page.errors.length,0)
  const report={sourceHash,meshes:52,groups:final.groups,phases:final.phases,permanent3D:true,imageTextures:0,normalHeroImages:0,responsive,reducedMotion:'passed (initial and live)',contextLoss:'passed',unsupportedWebGL:'passed',skipIntro:'passed (keeps 3D)',released,browserErrors:page.errors}
  await writeFile('.qa/imagotype-3d-report.json',JSON.stringify(report,null,2))
  console.log(JSON.stringify(report,null,2))
}catch(error){const state=await page.evaluate(snapshot);delete state.corners;state.meshes=state.meshes.length;console.error(JSON.stringify({state,errors:page.errors},null,2));await page.screenshot('.qa/imagotype-3d-failure.png');throw error}
finally{await page.close()}
