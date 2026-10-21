<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Group, Mesh, type WebGLRenderTarget } from 'three'
import { createRibbonGeometry } from './ribbon-geometry'
import { createChromeMaterial, createStudioEnvironment, createStudioLights, type BrandSceneRig } from './studio-environment'
import { useBrandSceneStore } from '../../application/brand-scene.store'

const props = defineProps<{ reducedMotion: boolean; active: boolean }>()
const emit = defineEmits<{ ready: [rig: BrandSceneRig]; failed: [] }>()
const store = useBrandSceneStore()
const { renderer, scene, invalidate } = useTresContext()
const { onBeforeRender, onAfterRender } = useLoop()
const geometry = createRibbonGeometry()
const material = createChromeMaterial()
const symbol = new Group()
symbol.name = 'SELC symbol - traced approximation'
symbol.add(new Mesh(geometry, material))
const lights = createStudioLights()
const rig: BrandSceneRig = { symbol, material, lights }
let environment: WebGLRenderTarget | undefined
const previousEnvironment = scene.value.environment
let ready = false
let elapsed = 0

const before = onBeforeRender(({ delta }) => {
  if (!ready || props.reducedMotion || !props.active || !store.introComplete) return
  elapsed += Math.min(delta, 0.05)
  // A slow, bounded turn always returns to the readable frontal silhouette.
  symbol.rotation.y = -0.08 + Math.sin(elapsed * 0.24) * 0.3
  symbol.rotation.x = 0.035 + Math.sin(elapsed * 0.32) * 0.025
})
const after = onAfterRender(() => {
  if (ready || !environment) return
  ready = true
  emit('ready', rig)
})

watch(() => props.reducedMotion, () => { elapsed = 0; invalidate() })
watch(() => store.phase, () => invalidate(), { flush: 'post' })
onMounted(() => {
  try {
    renderer.value.setClearAlpha(0)
    environment = createStudioEnvironment(renderer.value)
    scene.value.environment = environment.texture
    invalidate()
  } catch {
    emit('failed')
  }
})
onBeforeUnmount(() => {
  before.off()
  after.off()
  if (scene.value.environment === environment?.texture) scene.value.environment = previousEnvironment
  environment?.dispose()
  geometry.dispose()
  material.dispose()
  lights.sweep.dispose()
})
</script>

<template>
  <primitive :object="lights.group" />
  <primitive :object="symbol" />
</template>
