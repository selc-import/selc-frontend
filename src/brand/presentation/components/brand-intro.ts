import gsap from 'gsap'
import type { BrandAnimationPhase } from '../../domain/model/brand-animation-phase.model'
import type { BrandSceneRig } from './studio-environment'

export type BrandCopy = { name: HTMLElement; subtitle: HTMLElement; descriptor: HTMLElement }

export function settleBrand(rig: BrandSceneRig) {
  rig.symbol.rotation.set(0.035, -0.08, -0.025)
  rig.material.envMapIntensity = 1.05
  rig.lights.key.intensity = 2.4
  rig.lights.fill.intensity = 0.85
  rig.lights.rim.intensity = 3
  rig.lights.sweep.intensity = 0
}

/** One clock owns all six phases, including the DOM wordmark. */
export function createBrandIntro(
  rig: BrandSceneRig,
  copy: BrandCopy,
  setPhase: (phase: BrandAnimationPhase) => void,
) {
  const { symbol, material, lights } = rig
  symbol.rotation.set(0.1, -1.12, -0.06)
  material.envMapIntensity = 0
  lights.key.intensity = lights.fill.intensity = lights.rim.intensity = 0
  gsap.set([copy.name, copy.subtitle, copy.descriptor], { autoAlpha: 0, y: 18 })
  const timeline = gsap.timeline({ onComplete: () => setPhase('idle') })
  setPhase('dark')
  timeline.call(() => setPhase('reveal'), [], 0.28)
  timeline.to(material, { envMapIntensity: 1.05, duration: 1.55, ease: 'sine.inOut' }, 0.28)
  timeline.to(lights.key, { intensity: 2.4, duration: 1.5 }, 0.28)
  timeline.to(lights.fill, { intensity: 0.85, duration: 1.5 }, 0.45)
  timeline.to(lights.rim, { intensity: 3, duration: 1.4 }, 0.6)
  timeline.call(() => setPhase('rotate'), [], 1.25)
  timeline.to(symbol.rotation, {
    x: 0.035, y: -0.08, z: -0.025, duration: 2.1, ease: 'power3.inOut',
  }, 1.25)
  timeline.call(() => setPhase('shine'), [], 3.35)
  timeline.to(lights.sweep, { intensity: 6, duration: 0.35, ease: 'sine.inOut' }, 3.35)
  timeline.to(lights.sweep.position, {
    x: 4, duration: 1.05, ease: 'sine.inOut',
    onUpdate: () => lights.sweep.lookAt(0, 0, 0),
  }, 3.35)
  timeline.to(lights.sweep, { intensity: 0, duration: 0.4, ease: 'sine.inOut' }, 4.05)
  timeline.call(() => setPhase('wordmark'), [], 4.15)
  timeline.to(copy.name, { autoAlpha: 1, y: 0, duration: 0.75, ease: 'power2.out' }, 4.15)
  timeline.to(copy.subtitle, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 4.5)
  timeline.to(copy.descriptor, { autoAlpha: 1, y: 0, duration: 0.65, ease: 'power2.out' }, 4.85)
  return timeline
}
