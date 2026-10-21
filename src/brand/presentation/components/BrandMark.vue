<script setup lang="ts">
import { symbolPath, symbolViewBox } from './symbol-outline'

defineProps<{ variant: 'symbol' | 'wordmark'; id: string }>()
</script>

<template>
  <svg :viewBox="variant === 'symbol' ? symbolViewBox : '0 0 620 104'" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient :id="id" x1="0" y1="0" x2="0.25" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stop-color="#fafbfc" />
        <stop offset="0.36" stop-color="#cbd0d8" />
        <stop offset="0.5" stop-color="#8e959e" />
        <stop offset="0.67" stop-color="#e3e7ed" />
        <stop offset="1" stop-color="#b4bbc5" />
      </linearGradient>
    </defs>
    <path v-if="variant === 'symbol'" :d="symbolPath" :fill="`url(#${id})`" />
    <!-- Wide letterforms echo the supplied logotype without a font request. -->
    <g v-else :fill="`url(#${id})`">
      <path d="M132 2H38C15 2 2 15 2 34S15 64 38 64H100C110 64 114 68 114 73S110 80 100 80H5V102H101C124 102 138 90 138 72S125 42 102 42H40C29 42 25 39 25 33S29 25 40 25H132Z" />
      <path d="M170 2H301V25H194V41H284V63H194V79H301V102H170Z" />
      <path d="M342 2H367V79H460V102H342Z" />
      <path d="M618 2H546C511 2 491 20 491 52S511 102 546 102H618V79H547C527 79 516 71 516 52S527 25 547 25H618Z" />
    </g>
  </svg>
</template>
