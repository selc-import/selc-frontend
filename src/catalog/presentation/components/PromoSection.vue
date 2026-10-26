<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { usePromos } from '../../application/usePromos'
import AppButton from '../../../shared/presentation/components/AppButton.vue'
import PromoCard from './PromoCard.vue'

const { sortedPromos, loading, error, loadPromos } = usePromos()
const emit = defineEmits<{ layout: [] }>()
watch([sortedPromos, loading, error], () => emit('layout'), { flush: 'post' })
onMounted(loadPromos)
</script>

<template>
  <section class="catalog-promos" aria-labelledby="promos-title" :aria-busy="loading">
    <div class="promos-heading"><p class="catalog-eyebrow">Ofertas especiales</p><h3 id="promos-title">Tu pack, a mejor precio.</h3><p>Para regalar, para ti o para tu negocio. Encuentra el pack que va contigo.</p></div>
    <p v-if="loading" class="promo-status" role="status">Cargando promos…</p>
    <div v-else-if="error" class="promo-status" role="alert"><p>{{ error }}</p><AppButton variant="secondary" @click="loadPromos">Reintentar</AppButton></div>
    <div v-else class="promo-grid"><PromoCard v-for="(promo, index) in sortedPromos" :key="promo.id" :promo="promo" :spotlight="index === 0" /></div>
  </section>
</template>
