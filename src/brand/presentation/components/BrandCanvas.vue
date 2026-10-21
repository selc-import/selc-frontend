<script setup lang="ts">
import { onBeforeUnmount, shallowRef } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { ACESFilmicToneMapping, PerspectiveCamera, SRGBColorSpace } from 'three'
import ChromeSymbol from './ChromeSymbol.vue'
import type { BrandSceneRig } from './studio-environment'

defineProps<{ reducedMotion: boolean; active: boolean }>()
const emit = defineEmits<{ ready: [rig: BrandSceneRig]; failed: [] }>()
const canvas = shallowRef<InstanceType<typeof TresCanvas>>()
const camera = shallowRef(new PerspectiveCamera(35, 1, 0.1, 30))
camera.value.position.set(0, 0, 6.1)
// Tres 4's automatic unmount disposes the scene; its exposed dispose also
// releases the renderer, render lists and WebGL context.
onBeforeUnmount(() => canvas.value?.dispose())
</script>

<template>
  <TresCanvas
    ref="canvas"
    clear-color="#050506"
    :alpha="true"
    :antialias="true"
    :dpr="[1, 1.75]"
    :camera="camera"
    :tone-mapping="ACESFilmicToneMapping"
    :tone-mapping-exposure="0.95"
    :output-color-space="SRGBColorSpace"
    :render-mode="reducedMotion || !active ? 'on-demand' : 'always'"
    power-preference="high-performance"
  >
    <ChromeSymbol :reduced-motion="reducedMotion" :active="active" @ready="emit('ready', $event)" @failed="emit('failed')" />
  </TresCanvas>
</template>
