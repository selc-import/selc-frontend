/** Browser QA against a locally running Chrome DevTools endpoint. No test dependency.
 * Start Vite on 5173 and Chrome with --headless=new --remote-debugging-port=9333.
 * Screenshots and the report go to ignored .qa/. Uses the installed browser.
 */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
const target = await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' }).then(response => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject })
let serial = 0
const pending = new Map()
const errors = []
socket.onmessage = event => {
  const message = JSON.parse(event.data)
  if (message.id) {
    const request = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) request?.reject(new Error(message.error.message))
    else request?.resolve(message.result)
  }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails)
  if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') errors.push(message.params.entry)
  if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args)
}
function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++serial
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}
async function evaluate(expression) {
  const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text)
  return result.result.value
}
async function waitFor(expression, timeout = 16000) {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const result = await evaluate(expression)
    if (result) return result
    await delay(100)
  }
  throw new Error(`Timed out: ${expression}`)
}
async function screenshot(name) {
  const result = await send('Page.captureScreenshot', { format: 'png' })
  await writeFile(`.qa/${name}.png`, Buffer.from(result.data, 'base64'))
}
const snapshot = `(() => {
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('.symbol canvas');
  const copy = [...document.querySelectorAll('.brand-line')].map(el => ({opacity: getComputedStyle(el).opacity, visibility: getComputedStyle(el).visibility, rect: el.getBoundingClientRect().toJSON()}));
  return {scene: hero?.dataset.scene, phase: hero?.dataset.phase, canvas: !!canvas, width: innerWidth, scrollWidth: document.documentElement.scrollWidth, copy, phases: window.__heroPhases};
})()`
const sceneState = `(() => {
  const canvas = document.querySelector('.symbol canvas');
  const ctx = canvas?.__vueParentComponent?.exposed?.context?.value;
  const symbol = ctx?.scene.value.children.find(child => child.name.startsWith('SELC symbol'));
  if (!symbol) return null;
  const mesh = symbol.children[0];
  const box = mesh.geometry.boundingBox;
  const corners = [];
  for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
    const point = box.min.clone().set(x, y, z).applyMatrix4(mesh.matrixWorld).project(ctx.camera.value);
    corners.push({x: point.x, y: point.y});
  }
  return {rotation: symbol.rotation.toArray(), mode: ctx.render.mode.value, environment: !!ctx.scene.value.environment, envIntensity: mesh.material.envMapIntensity, corners};
})()`

function checkCopy(state) {
  assert.ok(state.copy.length === 3 && state.copy.every(item => item.opacity === '1' && item.visibility === 'visible'), 'All brand copy must be visible')
}
function checkFraming(state) {
  assert.ok(state?.corners.every(point => Math.abs(point.x) < 1 && Math.abs(point.y) < 1), 'Camera must frame the entire 3D symbol')
}
try {
  await mkdir('.qa', { recursive: true })
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Log.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    window.__heroPhases = ['dark'];
    new MutationObserver(() => {
      const phase = document.querySelector('.hero')?.dataset.phase;
      if (phase && phase !== window.__heroPhases.at(-1)) window.__heroPhases.push(phase);
    }).observe(document, {subtree: true, attributes: true, attributeFilter: ['data-phase']});
  ` })
  await send('Page.navigate', { url: 'http://localhost:5173/' })
  await waitFor(`document.querySelector('.hero')?.dataset.phase === 'idle'`)
  const desktop = await evaluate(snapshot)
  await screenshot('hero-desktop')
  assert.equal(desktop.scene, 'ready', '3D scene must render rather than silently fall back')
  assert.ok(desktop.scrollWidth <= desktop.width, 'No horizontal overflow')
  assert.deepEqual(desktop.phases, ['dark', 'reveal', 'rotate', 'shine', 'wordmark', 'idle'])
  checkCopy(desktop)
  const initialRig = await evaluate(sceneState)
  assert.ok(initialRig?.environment && initialRig.envIntensity > 0)
  checkFraming(initialRig)
  await delay(400)
  const movingRig = await evaluate(sceneState)
  assert.notEqual(initialRig.rotation[1], movingRig.rotation[1], 'Idle rotation must actually move')
  assert.ok(Math.abs(movingRig.rotation[1]) < 0.4, 'Idle turn must preserve the front-facing silhouette')

  // Check the generated mesh, independently of its rendered appearance.
  const geometry = await evaluate(`(async () => {
    const {createRibbonGeometry} = await import('/src/brand/presentation/components/ribbon-geometry.ts');
    const g = createRibbonGeometry(), p = g.getAttribute('position'), n = g.getAttribute('normal'), ix = g.getIndex();
    const edges = new Map(); let volume = 0, degenerate = 0, invalidNormals = 0;
    const key = i => [p.getX(i),p.getY(i),p.getZ(i)].map(v => Math.round(v * 100000)).join(',');
    for (let i = 0; i < n.count; i++) if (Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i)) - 1) > .001) invalidNormals++;
    for (let i = 0; i < ix.count; i += 3) {
      const ids = [ix.getX(i),ix.getX(i+1),ix.getX(i+2)];
      const [a,b,c] = ids.map(j => [p.getX(j),p.getY(j),p.getZ(j)]);
      const ab = b.map((v,j) => v-a[j]), ac = c.map((v,j) => v-a[j]);
      const cross = [ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
      if (Math.hypot(...cross) < 1e-10) degenerate++;
      volume += (a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
      for(let j=0;j<3;j++) {const k=[key(ids[j]),key(ids[(j+1)%3])].sort().join('|');edges.set(k,(edges.get(k)||0)+1);}
    }
    const result={vertices:p.count,triangles:ix.count/3,unclosedEdges:[...edges.values()].filter(v=>v!==2).length,degenerate,invalidNormals,volume};
    g.dispose(); return result;
  })()`)
  assert.equal(geometry.unclosedEdges, 0, 'Every mesh edge must have two incident faces')
  assert.equal(geometry.degenerate, 0, 'No degenerate triangles')
  assert.equal(geometry.invalidNormals, 0, 'Normals must be finite unit vectors')
  assert.ok(geometry.volume > 0, 'Closed geometry must have outward winding and positive volume')

  // Reduced motion must apply immediately, then remain still with demand rendering.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await send('Page.reload')
  await waitFor(`document.querySelector('.hero')?.dataset.scene === 'ready' && document.querySelector('.hero')?.dataset.phase === 'idle'`)
  await delay(200)
  const reduced = await evaluate(snapshot)
  const stillA = await evaluate(sceneState)
  await delay(400)
  const stillB = await evaluate(sceneState)
  checkCopy(reduced)
  assert.ok(!reduced.phases.includes('rotate'), 'Reduced motion must skip the introduction')
  assert.deepEqual(stillA.rotation, stillB.rotation, 'Reduced motion must remain completely still')
  assert.equal(stillB.mode, 'on-demand', 'Static mode must not continuously render')
  assert.equal(stillB.envIntensity, 1.05)

  const viewports = [[1920,1080],[1366,768],[768,1024],[390,844],[320,568],[844,390]]
  const responsive = []
  for (const [width, height] of viewports) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 701 })
    await delay(250)
    const state = await evaluate(snapshot)
    const frame = await evaluate(sceneState)
    assert.ok(state.scrollWidth <= width, `No overflow at ${width}x${height}`)
    checkCopy(state)
    checkFraming(frame)
    const layout = await evaluate(`(() => {const copy=document.querySelector('.brand-copy').getBoundingClientRect();const footer=document.querySelector('.hero-footer').getBoundingClientRect();return {copyBottom:copy.bottom,footerTop:footer.top};})()`)
    assert.ok(layout.copyBottom < layout.footerTop, `Copy and scroll control must not overlap at ${width}x${height}`)
    responsive.push({width,height,overflow:false,framed:true})
    if (width === 390) await screenshot('hero-mobile')
    if (width === 1920) await screenshot('hero-large-desktop')
  }

  await evaluate(`(() => {
    const canvas=document.querySelector('.symbol canvas');
    const ctx = canvas.__vueParentComponent.exposed.context.value;
    window.__disposedRenderer = ctx.renderer.value;
    window.__cleanup = {geometry:false,material:false,renderer:false};
    const mesh = ctx.scene.value.children.find(child=>child.name.startsWith('SELC symbol')).children[0];
    mesh.geometry.addEventListener('dispose',()=>window.__cleanup.geometry=true);
    mesh.material.addEventListener('dispose',()=>window.__cleanup.material=true);
    const dispose = ctx.renderer.value.dispose.bind(ctx.renderer.value);
    ctx.renderer.value.dispose = () => {window.__cleanup.renderer=true;dispose();};
    canvas.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext();
  })()`)
  await waitFor(`document.querySelector('.hero')?.dataset.scene === 'fallback'`)
  const contextLoss = await evaluate(snapshot)
  assert.equal(contextLoss.canvas, false, 'Context loss must unmount the 3D renderer')
  checkCopy(contextLoss)
  const released = await evaluate('({...window.__cleanup,contextLost:window.__disposedRenderer.getContext().isContextLost(),geometries:window.__disposedRenderer.info.memory.geometries})')
  assert.equal(released.geometries, 0, 'Unmount must release all GPU geometries')
  assert.ok(released.geometry && released.material && released.renderer && released.contextLost, 'Unmount must dispose owned resources and release the GPU context')
  await screenshot('hero-context-loss')

  const unsupportedScript = await send('Page.addScriptToEvaluateOnNewDocument', { source: `
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, ...args) { return String(type).startsWith('webgl') ? null : original.call(this, type, ...args); };
  ` })
  await send('Page.reload')
  await waitFor(`document.querySelector('.hero')?.dataset.scene === 'fallback'`)
  const unsupported = await evaluate(snapshot)
  checkCopy(unsupported)
  assert.equal(unsupported.canvas, false)
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: unsupportedScript.identifier })

  // Changing the OS preference during the introduction must cancel all motion.
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await send('Page.reload')
  await waitFor(`document.querySelector('.hero')?.dataset.phase === 'reveal'`)
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await waitFor(`document.querySelector('.hero')?.dataset.phase === 'idle'`)
  await delay(200)
  checkCopy(await evaluate(snapshot))
  const interruptedA = await evaluate(sceneState)
  await delay(400)
  assert.deepEqual((await evaluate(sceneState)).rotation, interruptedA.rotation)

  assert.equal(errors.length, 0, 'No browser exceptions or console errors')
  const report = { phases: desktop.phases, geometry, responsive, reducedMotion: 'passed (initial and live)', contextLoss: 'passed', released, unsupportedWebGL: 'passed', browserErrors: errors }
  await writeFile('.qa/hero-report.json', JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
} catch (error) {
  console.error(JSON.stringify({ state: await evaluate(snapshot), body: await evaluate('document.body.innerText.slice(0, 3000)'), errors }, null, 2))
  await screenshot('hero-failure')
  throw error
} finally {
  await send('Page.close').catch(() => {})
  socket.close()
}
