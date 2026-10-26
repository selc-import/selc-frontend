<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { findCatalogProduct } from '../../application/catalog.queries'
import { useCatalog } from '../../application/useCatalog'
import { productInquiry, advisorInquiry, advisors } from '../../application/whatsapp'
import { formatPrice } from '../../domain/product'
import { motionCssVars } from '../../../shared/motion/tokens'
import AppButton from '../../../shared/presentation/components/AppButton.vue'
import AppIcon from '../../../shared/presentation/components/AppIcon.vue'
import ProductPhoto from '../components/ProductPhoto.vue'
import CatalogFooter from '../components/CatalogFooter.vue'
import '../catalog.css'

const route = useRoute()
const { selectedVariant, selections } = useCatalog()
const product = computed(() => {
  const found = findCatalogProduct(route.params.productId)
  return found?.category === 'iPhone' ? found : undefined
})
const variant = computed(() => product.value ? selectedVariant(product.value) : undefined)
const inquiry = computed(() => product.value && variant.value ? productInquiry(product.value, variant.value) : '')
const heading = ref<HTMLElement>()
const originalTitle = document.title
function selectVariant(id: string) { if (product.value) selections.value[product.value.id] = id }
watch(() => route.fullPath, async () => {
  await nextTick()
  document.title = `${product.value?.name ?? 'Modelo no encontrado'} | SELC IMPORT`
  heading.value?.focus({ preventScroll: true })
}, { immediate: true, flush: 'post' })
onBeforeUnmount(() => { document.title = originalTitle })
</script>

<template>
  <div class="product-detail-page" :style="motionCssVars">
    <div class="catalog-container">
      <RouterLink class="back-to-catalog" :to="{ name: 'storefront', hash: '#explorar' }"><AppIcon name="arrow-left" /> Volver a los iPhones</RouterLink>
      <template v-if="product && variant">
        <div class="product-detail-layout" :data-product-detail="product.id">
          <div class="detail-photo"><ProductPhoto :product="product" eager /></div>
          <div class="detail-information">
            <p class="catalog-eyebrow">iPhone {{ product.generation }} · Serie Pro</p>
            <h1 ref="heading" tabindex="-1">{{ product.name }}</h1>
            <p class="detail-capacity">{{ product.storage }}</p>
            <div class="detail-price" aria-live="polite"><span>Precio publicado · Octubre 2026</span><strong>{{ formatPrice(variant.price) }}</strong></div>
            <fieldset v-if="product.variants.length > 1" class="variant-picker">
              <legend>Elige tu versión</legend>
              <label v-for="option in product.variants" :key="option.id" :class="{ 'variant-selected': variant.id === option.id }">
                <input type="radio" :name="`${product.id}-variant`" :value="option.id" :checked="variant.id === option.id" @change="selectVariant(option.id)" />
                <span>{{ option.label }}<small>{{ formatPrice(option.price) }}</small></span>
              </label>
            </fieldset>
            <p class="detail-confirmation">Confirma el precio vigente, los colores y la disponibilidad con un asesor.</p>
            <AppButton class="detail-consult" :href="inquiry" leading-icon="whatsapp" target="_blank" rel="noopener noreferrer" :aria-label="`Consultar ${product.name}, ${product.storage}, ${variant.label}, por WhatsApp (abre una pestaña nueva)`">Consultar por WhatsApp</AppButton>
            <p class="detail-reservation">Separa con S/ 20. Entrega presencial en Lima, Arequipa o Puno.</p>
            <section v-if="product.includedAccessories?.length" class="detail-box" aria-labelledby="detail-box-title">
              <h2 id="detail-box-title">Incluye en la caja</h2>
              <ul class="documented-benefits"><li v-for="accessory in product.includedAccessories" :key="accessory"><AppIcon name="check" /> {{ accessory }}</li></ul>
            </section>
            <section class="detail-specifications" aria-labelledby="specifications-title">
              <h2 id="specifications-title">Conoce tu próximo iPhone.</h2>
              <dl><div><dt>Pantalla</dt><dd>{{ product.screen }}</dd></div><div><dt>Chip</dt><dd>{{ product.chip }}</dd></div><div><dt>Cámaras</dt><dd>{{ product.cameras }}</dd></div><div><dt>Puerto</dt><dd>{{ product.port }}</dd></div></dl>
            </section>
          </div>
        </div>
        <section class="detail-included" aria-labelledby="detail-included-title"><div><p class="catalog-eyebrow">Con tu equipo</p><h2 id="detail-included-title">Los detalles también cuentan.</h2><p>Conoce la información de tu iPhone.</p></div><ul class="documented-benefits"><li><AppIcon name="check" /> Batería superior al 95%</li><li><AppIcon name="check" /> IMEI legal y verificable</li><li><AppIcon name="check" /> Ninguna pieza desconocida</li><li><AppIcon name="check" /> Boleta de Apple</li></ul></section>
      </template>
      <section v-else class="catalog-empty detail-not-found"><p class="catalog-eyebrow">Modelo no encontrado</p><h1 ref="heading" tabindex="-1">Este equipo no está en el catálogo.</h1><p>Puedes explorar los modelos publicados o consultar por el que buscas.</p><RouterLink class="text-link" :to="{ name: 'storefront', hash: '#continuar' }">Volver al catálogo <AppIcon name="arrow-up-right" /></RouterLink><AppButton :href="advisorInquiry(advisors[0].number)" leading-icon="whatsapp" target="_blank" rel="noopener noreferrer">Hablar con un asesor</AppButton></section>
      <CatalogFooter />
    </div>
  </div>
</template>
