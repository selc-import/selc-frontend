<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onErrorCaptured, onMounted, ref, watch } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useBrandSceneStore } from '../../application/brand-scene.store'
import { useReducedMotion } from '../../../shared/composables/useReducedMotion'
import BrandMark from '../components/BrandMark.vue'
import { createBrandIntro, settleImagotype } from '../components/brand-intro'
import type { BrandSceneRig } from '../components/studio-environment'

const BrandCanvas = defineAsyncComponent(() => import('../components/BrandCanvas.vue'))
const store = useBrandSceneStore()
const reducedMotion = useReducedMotion()
const presentation = ref<'intro'|'model'|'fallback'>(reducedMotion.value ? 'fallback' : 'intro')
const canRender = ref(false)
const sceneReady = ref(false)
const frameAboveViewport = ref(false)
const scrollFaded = ref(false)
const headerVisible = computed(() => frameAboveViewport.value || scrollFaded.value)
const hero = ref<HTMLElement>()
const stage = ref<HTMLElement>()
const frame = ref<HTMLElement>()
const sceneLayer = ref<HTMLElement>()
const inView = ref(true)
const tabVisible = ref(true)
const active = computed(() => inView.value && tabVisible.value)
const sceneState = computed(() => presentation.value === 'fallback' ? 'fallback' : sceneReady.value ? 'ready' : 'loading')
let rig: BrandSceneRig | undefined
let intro: gsap.core.Timeline | undefined
let skipRequested = false
let scrollContext: gsap.Context | undefined
let observer: IntersectionObserver | undefined
let headerObserver: IntersectionObserver | undefined
let startupTimer: ReturnType<typeof setTimeout> | undefined

function settleModel() {
  if (!rig) { skipRequested = true; return }
  clearTimeout(startupTimer)
  intro?.kill()
  intro = undefined
  settleImagotype(rig)
  presentation.value = 'model'
  if (sceneLayer.value) gsap.set(sceneLayer.value,{autoAlpha:1})
  store.finishImmediately()
}

function failScene(event?: Event) {
  event?.preventDefault()
  clearTimeout(startupTimer)
  intro?.kill()
  intro = undefined
  rig = undefined
  presentation.value = 'fallback'
  canRender.value = false
  store.finishImmediately()
}

function onSceneReady(sceneRig: BrandSceneRig) {
  if (presentation.value === 'fallback') return
  clearTimeout(startupTimer)
  rig = sceneRig
  sceneReady.value = true
  if (skipRequested || !sceneLayer.value) { settleModel(); return }
  intro = createBrandIntro(rig,sceneLayer.value,store.setPhase,settleModel)
}

function configureScroll() {
  scrollContext?.revert()
  scrollFaded.value = false
  if (reducedMotion.value || !stage.value || !hero.value) return
  const target = stage.value
  scrollContext = gsap.context(() => {
    gsap.to(target, {
      y:-32,scale:.96,autoAlpha:0,ease:'none',
      scrollTrigger:{trigger:hero.value,start:'top top',end:'bottom 35%',scrub:true,
        onUpdate:self=>{
          scrollFaded.value = self.progress >= .98
          if (self.progress > .01 && presentation.value === 'intro') settleModel()
        },
      },
    })
  },hero.value)
}
watch(reducedMotion,value=>{if(value)failScene();configureScroll()},{flush:'post'})
function updateVisibility() { tabVisible.value = !document.hidden }

onErrorCaptured(()=>{failScene();return false})
onMounted(()=>{
  gsap.registerPlugin(ScrollTrigger)
  store.setPhase('dark')
  configureScroll()
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(([entry])=>{inView.value=entry.isIntersecting})
    if(hero.value)observer.observe(hero.value)
    headerObserver = new IntersectionObserver(([entry])=>{frameAboveViewport.value=!entry.isIntersecting && entry.boundingClientRect.top<0})
    if(frame.value)headerObserver.observe(frame.value)
  }
  updateVisibility()
  document.addEventListener('visibilitychange',updateVisibility)
  if(reducedMotion.value){failScene();return}
  skipRequested = window.scrollY > 24 || location.hash === '#continuar'
  hero.value?.addEventListener('webglcontextlost',failScene,true)
  hero.value?.addEventListener('webglcontextcreationerror',failScene,true)
  try{
    const probe=document.createElement('canvas').getContext('webgl2')
    if(!probe){failScene();return}
    probe.getExtension('WEBGL_lose_context')?.loseContext()
    canRender.value=true
    startupTimer=setTimeout(failScene,10000)
  }catch{failScene()}
})
onBeforeUnmount(()=>{
  clearTimeout(startupTimer)
  intro?.kill()
  scrollContext?.revert()
  observer?.disconnect()
  headerObserver?.disconnect()
  hero.value?.removeEventListener('webglcontextlost',failScene,true)
  hero.value?.removeEventListener('webglcontextcreationerror',failScene,true)
  document.removeEventListener('visibilitychange',updateVisibility)
})
</script>

<template>
  <main>
    <header class="site-header" :class="{ 'site-header--visible':headerVisible }" :inert="!headerVisible" :aria-hidden="!headerVisible">
      <a class="header-brand" href="#inicio" aria-label="SELC IMPORT, volver al inicio"><BrandMark compact /></a>
    </header>
    <section id="inicio" ref="hero" class="hero" :data-phase="store.phase" :data-scene="sceneState" :data-presentation="presentation" aria-label="Presentación tridimensional SELC IMPORT">
      <a class="skip-link" href="#continuar" @click="settleModel">Saltar presentación</a>
      <h1 class="sr-only">SELC IMPORT — CELULARES APPLE • ACCESORIOS • CONFIANZA</h1>
      <div ref="stage" class="hero-content">
        <div ref="frame" class="brand-frame">
          <BrandMark v-if="presentation === 'fallback'" class="brand-fallback" />
          <div v-if="canRender" ref="sceneLayer" class="imagotype-scene" aria-hidden="true">
            <BrandCanvas :reduced-motion="reducedMotion" :active="active" @ready="onSceneReady" @failed="failScene" />
          </div>
        </div>
      </div>
      <a href="#continuar" class="explore" @click="settleModel"><span>EXPLORAR</span><span class="scroll-line" aria-hidden="true"></span></a>
    </section>
    <section id="continuar" class="continuation">
      <p class="eyebrow">SELC IMPORT</p>
      <h2>Una nueva experiencia está tomando forma.</h2>
      <p>Presentación de marca en desarrollo. El catálogo se incorporará en el Bloque 2.</p>
    </section>
  </main>
</template>
