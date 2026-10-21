<script setup lang="ts">
import contours from '../assets/imagotype-contours.json'

withDefaults(defineProps<{compact?:boolean}>(),{compact:false})
const compactPath=[...contours.wordmark,...contours.import].map(loop=>loop.map(([x,y],i)=>`${i?'L':'M'}${x},${y}`).join('')+'Z').join('')
</script>

<template>
  <svg v-if="compact" class="official-brand official-brand--compact" viewBox="240 510 800 240" aria-hidden="true" focusable="false">
    <defs><linearGradient id="compact-silver" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f1f3f5" /><stop offset="1" stop-color="#a8afb9" /></linearGradient></defs>
    <path :d="compactPath" fill="url(#compact-silver)" fill-rule="evenodd" />
  </svg>
  <span v-else class="official-brand">
    <!-- Only the accessibility / WebGL failure fallback uses a raster image. -->
    <img src="/assets/brand/selc-original.png" alt="" width="1280" height="949" decoding="async" />
  </span>
</template>
