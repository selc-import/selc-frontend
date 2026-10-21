<script setup lang="ts">
import { photoCredits } from '../../application/catalog.queries'
import AppIcon from '../../../shared/presentation/components/AppIcon.vue'
</script>

<template>
  <footer class="catalog-footer" aria-label="Condiciones comerciales">
    <div class="catalog-footer-top"><span>SELC IMPORT</span><RouterLink :to="{ name: 'storefront', hash: '#inicio' }">Volver al inicio <AppIcon name="arrow-up" size="sm" /></RouterLink></div>
    <div class="commercial-conditions" id="condiciones">
      <h2>Una compra con información clara.</h2>
      <p>Los precios publicados corresponden al catálogo de octubre de 2026, están sujetos a cambio y deben confirmarse con un asesor. Válidos hasta agotar stock. Consulta los colores y la disponibilidad antes de separar tu equipo.</p>
      <p>Las fotografías son referenciales. iPhone es una marca registrada de Apple Inc. SELC Import es un vendedor independiente, sin afiliación con Apple.</p>
    </div>
    <details class="photo-credits"><summary>Créditos de las fotografías <AppIcon name="chevron-down" size="sm" /></summary><p>Imágenes extraídas sin modificar del catálogo proporcionado. Fuentes y licencias indicadas en el documento:</p><ul><li v-for="credit in photoCredits" :key="credit.model"><a :href="credit.url" target="_blank" rel="noopener noreferrer">{{ credit.model }} — {{ credit.author }} ({{ credit.license }})<span class="sr-only">, abre una pestaña nueva</span></a></li></ul><p>iPhone 14 Pro: fotografía incluida en el catálogo proporcionado.</p></details>
  </footer>
</template>
