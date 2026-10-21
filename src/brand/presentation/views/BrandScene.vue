<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onErrorCaptured, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBrandSceneStore } from '../../application/brand-scene.store'
import { useReducedMotion } from '../../../shared/composables/useReducedMotion'
import BrandMark from '../components/BrandMark.vue'
import { createBrandIntro, settleBrand } from '../components/brand-intro'
import type { BrandSceneRig } from '../components/studio-environment'

const BrandCanvas = defineAsyncComponent(() => import('../components/BrandCanvas.vue'))

const store = useBrandSceneStore()
const reducedMotion = useReducedMotion()
const webglFailed = ref(false)
const canRender = ref(false)
const sceneReady = ref(false)
const introPending = ref(!reducedMotion.value)
const hero = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const name = ref<HTMLElement>()
const importLabel = ref<HTMLElement>()
const descriptor = ref<HTMLElement>()
const inView = ref(true)
const tabVisible = ref(true)
const active = computed(() => inView.value && tabVisible.value)
let rig: BrandSceneRig | undefined
let intro: gsap.core.Timeline | undefined
let scrollContext: gsap.Context | undefined
let observer: IntersectionObserver | undefined
let startupTimer: ReturnType<typeof setTimeout> | undefined

function revealCopy() {
  introPending.value = false
  const elements = [name.value, importLabel.value, descriptor.value].filter((element): element is HTMLElement => !!element)
  gsap.set(elements, { clearProps: 'opacity,visibility,transform' })
}

function failScene(event?: Event) {
  event?.preventDefault()
  if (webglFailed.value) return
  clearTimeout(startupTimer)
  intro?.kill()
  rig = undefined
  webglFailed.value = true
  canRender.value = false
  revealCopy()
  store.finishImmediately()
}

function onSceneReady(sceneRig: BrandSceneRig) {
  if (webglFailed.value) return
  clearTimeout(startupTimer)
  rig = sceneRig
  sceneReady.value = true
  if (reducedMotion.value || !name.value || !importLabel.value || !descriptor.value) {
    settleBrand(rig)
    revealCopy()
    store.finishImmediately()
    return
  }
  intro = createBrandIntro(rig, {
    name: name.value, subtitle: importLabel.value, descriptor: descriptor.value,
  }, store.setPhase)
}

function configureScroll() {
  scrollContext?.revert()
  if (reducedMotion.value || !stage.value || !hero.value) return
  const target = stage.value
  scrollContext = gsap.context(() => {
    gsap.to(target, {
      y: 45, scale: 0.96, ease: 'none',
      scrollTrigger: { trigger: hero.value, start: 'top top', end: 'bottom top', scrub: true },
    })
  }, hero.value)
}

watch(reducedMotion, value => {
  if (value) {
    intro?.kill()
    if (rig) settleBrand(rig)
    revealCopy()
    store.finishImmediately()
  }
  configureScroll()
}, { flush: 'post' })

function updateVisibility() { tabVisible.value = !document.hidden }

// Tres uses a separate renderer root; the startup watchdog also covers failures
// that cannot propagate through Vue's parent error boundary.
onErrorCaptured(() => { failScene(); return false })
onMounted(() => {
  gsap.registerPlugin(ScrollTrigger)
  store.setPhase('dark')
  if (reducedMotion.value) { revealCopy(); store.finishImmediately() }
  hero.value?.addEventListener('webglcontextlost', failScene, true)
  hero.value?.addEventListener('webglcontextcreationerror', failScene, true)
  try {
    const probe = document.createElement('canvas').getContext('webgl2')
    if (!probe) { failScene(); return }
    probe.getExtension('WEBGL_lose_context')?.loseContext()
    canRender.value = true
    startupTimer = setTimeout(() => { if (!sceneReady.value) failScene() }, 8000)
  } catch { failScene(); return }
  configureScroll()
  if ('IntersectionObserver' in window && hero.value) {
    observer = new IntersectionObserver(([entry]) => { inView.value = entry.isIntersecting })
    observer.observe(hero.value)
  }
  updateVisibility()
  document.addEventListener('visibilitychange', updateVisibility)
})
onBeforeUnmount(() => {
  clearTimeout(startupTimer)
  intro?.kill()
  scrollContext?.revert()
  observer?.disconnect()
  hero.value?.removeEventListener('webglcontextlost', failScene, true)
  hero.value?.removeEventListener('webglcontextcreationerror', failScene, true)
  document.removeEventListener('visibilitychange', updateVisibility)
})
</script>

<template>
  <main>
    <section ref="hero" class="hero" :class="{ 'intro-pending': introPending }" :data-phase="store.phase" :data-scene="webglFailed ? 'fallback' : sceneReady ? 'ready' : 'loading'" aria-label="Presentación SELC IMPORT">
      <a class="skip-link" href="#continuar">Saltar presentación</a>
      <div class="backdrop" aria-hidden="true"></div>
      <header class="hero-header">
        <a class="header-brand" href="#inicio" aria-label="SELC IMPORT, inicio">SELC<span>IMPORT</span></a>
        <span class="header-note">TECNOLOGÍA. CON CONFIANZA.</span>
      </header>
      <div id="inicio" ref="stage" class="hero-content">
        <div class="symbol" aria-hidden="true">
          <BrandMark v-if="webglFailed" id="fallback-chrome" variant="symbol" class="fallback" />
          <BrandCanvas
            v-if="canRender && !webglFailed"
            :reduced-motion="reducedMotion"
            :active="active"
            @ready="onSceneReady"
            @failed="failScene"
          />
        </div>
        <div class="brand-copy">
          <h1 ref="name" class="brand-line brand-name">
            <span class="sr-only">SELC</span>
            <BrandMark id="wordmark-chrome" variant="wordmark" />
          </h1>
          <p ref="importLabel" class="brand-line brand-subtitle"><span>IMPORT</span></p>
          <p ref="descriptor" class="brand-line brand-description">CELULARES APPLE <span aria-hidden="true">•</span> ACCESORIOS <span aria-hidden="true">•</span> CONFIANZA</p>
        </div>
      </div>
      <div class="hero-footer">
        <span class="footer-note">EL DETALLE HACE LA DIFERENCIA.</span>
        <a href="#continuar" class="explore"><span>DESCUBRE SELC</span><span class="scroll-line" aria-hidden="true"></span></a>
        <span class="footer-index" aria-hidden="true">01 <span>/</span> SELC IMPORT</span>
      </div>
    </section>
    <section id="continuar" class="continuation">
      <p class="eyebrow">SELC IMPORT</p>
      <h2>Una nueva experiencia está tomando forma.</h2>
      <p>Presentación de marca en desarrollo. El catálogo se incorporará en el Bloque 2.</p>
    </section>
  </main>
</template>
