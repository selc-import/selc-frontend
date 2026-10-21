<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useLoop, useTresContext } from '@tresjs/core'
import { Group, Mesh, MeshPhysicalMaterial, type WebGLRenderTarget } from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createStudioEnvironment, createStudioLights, type BrandSceneRig } from './studio-environment'
import { useBrandSceneStore } from '../../application/brand-scene.store'

const props = defineProps<{ reducedMotion: boolean; active: boolean }>()
const emit = defineEmits<{ ready: [rig: BrandSceneRig]; failed: [] }>()
const store = useBrandSceneStore()
const { renderer, scene, invalidate } = useTresContext()
const { onBeforeRender, onAfterRender } = useLoop()
const model = shallowRef<Group>()
const lights = createStudioLights()
const previousEnvironment = scene.value.environment
let environment: WebGLRenderTarget | undefined
let rig: BrandSceneRig | undefined
let ready = false
let disposed = false
let elapsed = 0

function disposeModel(root: Group) {
  const materials = new Set<MeshPhysicalMaterial>()
  root.traverse(object => {
    if (!(object instanceof Mesh)) return
    object.geometry.dispose()
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material as MeshPhysicalMaterial)
  })
  materials.forEach(material => material.dispose())
}

const before = onBeforeRender(({ delta }) => {
  if (!ready || !rig || !store.introComplete || props.reducedMotion || !props.active) return
  elapsed += Math.min(delta, 0.05)
  // Every part remains geometry; the complete composition turns together.
  rig.symbol.rotation.y = Math.sin(elapsed * 0.18) * 0.22 * (1-Math.exp(-elapsed*.7))
  rig.symbol.rotation.x = Math.sin(elapsed * 0.23) * 0.018
})
const after = onAfterRender(() => {
  if (ready || !rig || !model.value || !environment) return
  ready = true
  emit('ready', rig)
})
watch(() => store.phase, () => invalidate(), { flush: 'post' })
watch(() => props.reducedMotion, () => { elapsed = 0; invalidate() })

onMounted(async () => {
  try {
    renderer.value.setClearAlpha(0)
    environment = createStudioEnvironment(renderer.value)
    scene.value.environment = environment.texture
    const loaded = await new GLTFLoader().loadAsync('/assets/brand/selc-imagotype.glb')
    if (disposed) { disposeModel(loaded.scene); return }
    model.value = loaded.scene
    const root = loaded.scene.getObjectByName('SELC_Imagotype_3D') as Group | undefined
    const group = (name: string) => {
      const result = root?.getObjectByName(name)
      if (!result) throw new Error(`Missing model group: ${name}`)
      return result
    }
    if (!root) throw new Error('Missing full imagotype model')
    const materials = new Set<MeshPhysicalMaterial>()
    root.traverse(object => {
      if (!(object instanceof Mesh)) return
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        const physical = material as MeshPhysicalMaterial
        physical.envMapIntensity = 0
        materials.add(physical)
      }
    })
    rig = {symbol:root,groups:{isotype:group('isotype'),wordmark:group('wordmark'),import:group('import'),descriptor:group('descriptor')},materials:[...materials],lights}
    invalidate()
  } catch {
    if (!disposed) emit('failed')
  }
})
onBeforeUnmount(() => {
  disposed = true
  before.off()
  after.off()
  if (scene.value.environment === environment?.texture) scene.value.environment = previousEnvironment
  environment?.dispose()
  if (model.value) disposeModel(model.value)
  lights.sweep.dispose()
})
</script>

<template>
  <primitive :object="lights.group" />
  <primitive v-if="model" :object="model" />
</template>
