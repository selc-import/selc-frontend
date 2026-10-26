<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatPrice, type AccessoryProduct } from '../../domain/product'
import { productInquiry } from '../../application/whatsapp'
import AppButton from '../../../shared/presentation/components/AppButton.vue'
import AppIcon from '../../../shared/presentation/components/AppIcon.vue'
import { useProductCardMotion } from '../composables/useCatalogMotion'

const props = defineProps<{ product: AccessoryProduct; order: number }>()
const root = ref<HTMLElement>()
const inquiry = computed(() => productInquiry(props.product))
useProductCardMotion(root, () => props.order)
</script>

<template>
  <div ref="root" class="product-card-reveal">
    <article class="product-card accessory-card" :data-product="product.id" :style="{ '--product-accent': product.accent }" :aria-labelledby="`${product.id}-name`">
      <div class="accessory-monogram" aria-hidden="true">{{ product.monogram }}</div>
      <div class="product-content">
        <p class="catalog-eyebrow">{{ product.eyebrow }}</p>
        <h3 :id="`${product.id}-name`">{{ product.name }}</h3>
        <p class="accessory-description">{{ product.description }}</p>
        <p class="accessory-stock"><AppIcon name="check" size="sm" /> {{ product.stockStatus }}</p>
        <div class="product-price"><strong>{{ formatPrice(product.priceSoles) }}</strong></div>
      </div>
      <AppButton class="catalog-button product-consult" :href="inquiry" leading-icon="whatsapp" target="_blank" rel="noopener noreferrer" :aria-label="`Consultar ${product.name} por WhatsApp (abre una pestaña nueva)`">Consultar por WhatsApp</AppButton>
    </article>
  </div>
</template>
