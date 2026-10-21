<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '../../domain/product'
const props = withDefaults(defineProps<{ product: Product; eager?: boolean }>(), { eager: false })
const failed = ref(false)
watch(() => props.product.id, () => { failed.value = false })
</script>

<template>
  <img v-if="!failed" :src="product.image" :alt="product.name" :style="{ objectPosition: product.imageFocus ?? 'center center' }" :width="product.imageWidth" :height="product.imageHeight" :loading="eager ? 'eager' : 'lazy'" decoding="async" @error="failed = true" />
  <div v-else class="photo-fallback"><strong>{{ product.name }}</strong><span>La fotografía no está disponible. Puedes solicitarla a un asesor.</span></div>
</template>
