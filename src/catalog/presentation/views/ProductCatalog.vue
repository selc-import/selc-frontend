<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useCatalog } from '../../application/useCatalog'
import { advisors, advisorInquiry, importInquiry } from '../../application/whatsapp'
import { useCatalogMotion } from '../composables/useCatalogMotion'
import ProductCard from '../components/ProductCard.vue'
import GenerationFilter from '../components/GenerationFilter.vue'
import CatalogFooter from '../components/CatalogFooter.vue'
import AppButton from '../../../shared/presentation/components/AppButton.vue'
import AppIcon from '../../../shared/presentation/components/AppIcon.vue'
import { motionCssVars } from '../../../shared/motion/tokens'
import '../catalog.css'

const root = ref<HTMLElement>()
const { generation, query, sort, selectedVariant, products, filtered, resetFilters } = useCatalog()
const productIds = computed(() => products.value.map(product => product.id).join(','))
const { refreshLayout } = useCatalogMotion(root, productIds)
const searchInput = ref<HTMLInputElement>()
async function clearSearch() { query.value = ''; await nextTick(); searchInput.value?.focus() }
function beforeLeave(element: Element) { element.setAttribute('inert', ''); element.setAttribute('aria-hidden', 'true') }
function beforeEnter(element: Element) { element.removeAttribute('inert'); element.removeAttribute('aria-hidden') }
</script>

<template>
  <section id="continuar" ref="root" class="catalog" :style="motionCssVars" tabindex="-1" aria-labelledby="catalog-title">
    <div class="catalog-container">
      <div class="catalog-heading">
        <div><p class="catalog-eyebrow">Elige tu próximo iPhone</p><h2 id="catalog-title">Un Pro para ti.</h2><p class="catalog-introduction">Explora los modelos, conoce sus detalles<br class="desktop-break" /> y encuentra el que va contigo.</p></div>
        <div class="catalog-buying-note"><span>Tu iPhone, más cerca.</span><p>Separa con <strong>S/ 20.</strong></p><a href="#como-comprar" class="text-link">Conoce cómo comprar <AppIcon name="arrow-up-right" size="sm" /></a></div>
      </div>

      <section id="explorar" class="catalog-exploration" tabindex="-1" aria-label="Explorar iPhones">
        <div class="catalog-controls">
          <GenerationFilter v-model="generation" />
          <div class="catalog-search" role="search"><label for="catalog-search-input" class="sr-only">Buscar modelo, capacidad o chip</label><AppIcon name="search" /><input id="catalog-search-input" ref="searchInput" v-model="query" type="search" placeholder="Busca tu iPhone" aria-controls="catalog-products" /><AppButton v-if="query" variant="icon" class="search-clear" leading-icon="close" aria-label="Limpiar búsqueda" @click="clearSearch" /></div>
        </div>
        <div class="catalog-results">
          <p role="status" aria-live="polite" aria-atomic="true">{{ products.length }} {{ products.length === 1 ? 'modelo' : 'modelos' }}{{ generation === 'all' ? '' : ` · iPhone ${generation}` }}</p>
          <AppButton v-if="filtered" class="reset-filters" variant="ghost" trailing-icon="close" @click="resetFilters">Limpiar filtros</AppButton>
          <label class="catalog-sort"><span>Ordenar por</span><select v-model="sort" aria-label="Ordenar productos" aria-controls="catalog-products"><option value="newest">Más recientes</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select><AppIcon name="chevron-down" class="catalog-sort-chevron" size="sm" /></label>
        </div>
        <TransitionGroup id="catalog-products" tag="div" name="products" class="product-grid" @before-enter="beforeEnter" @before-leave="beforeLeave" @after-leave="refreshLayout"><div v-for="(product, index) in products" :key="product.id" class="product-grid-item"><ProductCard :product="product" :variant="selectedVariant(product)" :order="index" /></div></TransitionGroup>
        <div v-if="!products.length" class="catalog-empty"><h3>No encontramos ese iPhone.</h3><p>Prueba con otro modelo o consulta por un pedido desde EE. UU.</p><AppButton variant="secondary" @click="resetFilters">Ver todos los modelos</AppButton><AppButton variant="ghost" :href="importInquiry" target="_blank" rel="noopener noreferrer" trailing-icon="arrow-up-right">Consultar un pedido</AppButton></div>
      </section>

      <section class="catalog-import" aria-labelledby="import-title"><div><p class="catalog-eyebrow">Pedidos especiales · EE. UU.</p><h2 id="import-title">El que buscas.<br /><span>También lo traemos.</span></h2><p>¿Tienes otro modelo en mente? Cotizamos pedidos de iPhone, Samsung, Google Pixel y más desde Estados Unidos.</p><AppButton :href="importInquiry" variant="secondary" leading-icon="whatsapp" target="_blank" rel="noopener noreferrer" aria-label="Cotizar un pedido por WhatsApp (abre una pestaña nueva)">Cotizar mi pedido</AppButton></div><div class="import-aside" aria-hidden="true"><span>iPhone</span><span>Samsung</span><span>Google Pixel</span><span>y más.</span></div></section>

      <section id="como-comprar" class="catalog-purchase" tabindex="-1" aria-labelledby="purchase-title"><div class="purchase-heading"><p class="catalog-eyebrow">De tu elección a tus manos</p><h2 id="purchase-title">Comprar empieza<br />con una conversación.</h2><p>Separa tu equipo con S/ 20 y coordinamos la entrega presencial en Lima, Arequipa o Puno.</p></div><ol class="purchase-steps"><li><span class="step-number">01</span><div><h3>Encuentra tu iPhone</h3><p>Explora el catálogo y revisa los detalles del modelo que te interesa.</p></div></li><li><span class="step-number">02</span><div><h3>Conversa y separa</h3><p>Un asesor confirma el precio, los colores y la disponibilidad. Separa con S/ 20.</p></div></li><li><span class="step-number">03</span><div><h3>Recíbelo en persona</h3><p>Acuerden el lugar de entrega en Lima, Arequipa o Puno.</p></div></li></ol></section>

      <aside class="catalog-included" aria-labelledby="included-title"><div><p class="catalog-eyebrow">Con cada equipo</p><h2 id="included-title">Lo esencial, incluido.</h2><p>Boleta, cable, cubo, case y vidrio mate.</p></div><ul class="documented-benefits"><li><AppIcon name="battery" /> Batería superior al 95%</li><li><AppIcon name="check" /> IMEI legal y verificable</li><li><AppIcon name="check" /> Ninguna pieza desconocida</li><li><AppIcon name="check" /> Boleta de Apple</li></ul></aside>

      <section id="contacto" class="catalog-contact" tabindex="-1" aria-labelledby="contact-title"><div><p class="catalog-eyebrow">Estamos para ayudarte</p><h2 id="contact-title">Hablemos de tu<br />próximo iPhone.</h2><p>Consulta por un modelo o cuéntanos cuál buscas.</p></div><div class="catalog-advisors"><AppButton v-for="advisor in advisors" :key="advisor.number" variant="secondary" :href="advisorInquiry(advisor.number)" leading-icon="whatsapp" trailing-icon="arrow-up-right" target="_blank" rel="noopener noreferrer" :aria-label="`${advisor.name}: WhatsApp +51 ${advisor.display} (abre una pestaña nueva)`"><span><small>{{ advisor.name }} · WhatsApp</small><strong>+51 {{ advisor.display }}</strong></span></AppButton></div></section>
      <CatalogFooter />
    </div>
  </section>
</template>
