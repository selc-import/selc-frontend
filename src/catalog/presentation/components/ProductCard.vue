<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatPrice, type Product, type ProductVariant } from '../../domain/product'
import { productInquiry } from '../../application/whatsapp'
import AppButton from '../../../shared/presentation/components/AppButton.vue'
import AppIcon from '../../../shared/presentation/components/AppIcon.vue'
import ProductPhoto from './ProductPhoto.vue'
import { useProductCardMotion } from '../composables/useCatalogMotion'

const props = defineProps<{ product: Product; variant: ProductVariant; order: number }>()
const root = ref<HTMLElement>()
const inquiry = computed(() => productInquiry(props.product, props.variant))
const detailRoute = computed(() => ({ name: 'product', params: { productId: props.product.id } }))
useProductCardMotion(root, () => props.order)
</script>

<template>
  <div ref="root" class="product-card-reveal">
    <article class="product-card" :data-product="product.id" :aria-labelledby="`${product.id}-name`">
      <RouterLink :to="detailRoute" class="product-discovery">
        <div class="product-photo"><ProductPhoto :product="product" /></div>
        <div class="product-content">
          <h3 :id="`${product.id}-name`">{{ product.name }}</h3>
          <p class="storage-badge">{{ product.storage }}<span v-if="product.variants.length > 1"> · {{ variant.label }}</span></p>
          <div class="product-price-row"><div class="product-price"><strong>{{ formatPrice(variant.price) }}</strong></div><span class="product-detail-link">Ver detalles <AppIcon name="arrow-up-right" size="sm" /></span></div>
        </div>
      </RouterLink>
      <AppButton class="catalog-button product-consult" :href="inquiry" leading-icon="whatsapp" target="_blank" rel="noopener noreferrer" :aria-label="`Consultar ${product.name}, ${product.storage}${product.variants.length > 1 ? ', ' + variant.label : ''}, por WhatsApp (abre una pestaña nueva)`">Consultar</AppButton>
    </article>
  </div>
</template>
