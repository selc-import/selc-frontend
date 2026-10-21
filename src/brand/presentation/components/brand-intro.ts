import gsap from 'gsap'
import type { BrandAnimationPhase } from '../../domain/model/brand-animation-phase.model'
import type { BrandSceneRig } from './studio-environment'

export function settleImagotype(rig: BrandSceneRig) {
  rig.symbol.rotation.set(0,0,0)
  for(const group of Object.values(rig.groups))group.position.y=0
  for(const material of rig.materials){material.envMapIntensity=1.05;material.opacity=1;material.transparent=false;material.depthWrite=true;material.needsUpdate=true}
  rig.lights.key.intensity=2.4
  rig.lights.fill.intensity=.85
  rig.lights.rim.intensity=3
  rig.lights.sweep.intensity=0
}

/** A single timeline reveals the complete GLB. No image or crossfade exists in
 * the successful WebGL path; all four groups remain real, lit 3D solids.
 */
export function createBrandIntro(
  rig: BrandSceneRig,
  layer: HTMLElement,
  setPhase: (phase: BrandAnimationPhase) => void,
  onFinished: () => void,
) {
  const {symbol,materials,groups,lights}=rig
  symbol.rotation.set(.045,-.72,0)
  for(const material of materials){material.envMapIntensity=0;material.transparent=true;material.opacity=material.name.includes('isotype')?1:0;material.depthWrite=false;material.needsUpdate=true}
  for(const group of [groups.wordmark,groups.import,groups.descriptor])group.position.y=-.12
  lights.key.intensity=lights.fill.intensity=lights.rim.intensity=0
  gsap.set(layer,{autoAlpha:0})
  const timeline=gsap.timeline({onComplete:onFinished})
  setPhase('dark')
  timeline.call(()=>setPhase('reveal'),[],.28)
  timeline.to(layer,{autoAlpha:1,duration:.8,ease:'sine.inOut'},.28)
  timeline.to(materials,{envMapIntensity:1.05,duration:1.55,ease:'sine.inOut'},.28)
  timeline.to(lights.key,{intensity:2.4,duration:1.5},.28)
  timeline.to(lights.fill,{intensity:.85,duration:1.5},.45)
  timeline.to(lights.rim,{intensity:3,duration:1.4},.6)
  timeline.call(()=>setPhase('rotate'),[],1.25)
  timeline.to(symbol.rotation,{x:0,y:-.26,z:0,duration:2.1,ease:'power3.inOut'},1.25)
  timeline.to(symbol.rotation,{y:0,duration:2.15,ease:'sine.inOut'},3.35)
  timeline.call(()=>setPhase('shine'),[],3.35)
  timeline.to(lights.sweep,{intensity:6,duration:.35,ease:'sine.inOut'},3.35)
  timeline.to(lights.sweep.position,{x:4,duration:1.05,ease:'sine.inOut',onUpdate:()=>lights.sweep.lookAt(0,0,0)},3.35)
  timeline.to(lights.sweep,{intensity:0,duration:.4,ease:'sine.inOut'},4.05)
  timeline.call(()=>setPhase('wordmark'),[],4.15)
  for(const [name,start] of [['wordmark',4.15],['import',4.5],['descriptor',4.85]] as const){
    timeline.to(materials.filter(material=>material.name.includes(name)),{opacity:1,duration:.65,ease:'power2.out'},start)
    timeline.to(groups[name].position,{y:0,duration:.65,ease:'power2.out'},start)
  }
  return timeline
}
