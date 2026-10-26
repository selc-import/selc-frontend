<script setup lang="ts">
import type { PromoEntity } from '../../domain/model/promo.entity'
import { promoInquiry } from '../../application/whatsapp'
import { formatPrice } from '../../domain/product'
import AppButton from '../../../shared/presentation/components/AppButton.vue'

defineProps<{ promo: PromoEntity; spotlight?: boolean }>()
</script>

<template>
  <article class="promo-card" :class="{ 'promo-card--featured': promo.id === 'promo-emprendedora', 'promo-card--discount': promo.hasDiscount, 'promo-card--spotlight': spotlight }" :data-promo="promo.id" :aria-labelledby="`${promo.id}-name`">
    <span class="promo-badge" :class="{ 'promo-badge--discount': promo.hasDiscount }">{{ promo.hasDiscount ? `${promo.discountPercentage}% menos` : promo.id === 'promo-emprendedora' ? 'Promo destacada' : 'Combo de accesorios' }}</span>
    <h4 :id="`${promo.id}-name`">{{ promo.name }}</h4>
    <p class="promo-description">{{ promo.description }}</p>
    <p class="promo-items">{{ promo.itemsSummary }}</p>
    <div class="promo-pricing">
      <p v-if="promo.regularPriceSoles !== undefined" class="promo-regular-price"><span>Precio común</span><del>{{ formatPrice(promo.regularPriceSoles) }}</del></p>
      <div class="promo-offer-price"><span v-if="promo.hasDiscount" class="promo-price-label">Precio de oferta</span><div class="promo-current-price"><strong class="promo-price">{{ formatPrice(promo.priceSoles) }}</strong><span v-if="promo.hasDiscount" class="promo-fire" aria-hidden="true">🔥</span></div></div>
      <p v-if="promo.hasDiscount" class="promo-savings">Ahorras <strong>{{ formatPrice(promo.savingsSoles) }}</strong> en este pack</p>
    </div>
    <AppButton class="promo-consult" :href="promoInquiry(promo)" :variant="promo.hasDiscount || promo.id === 'promo-emprendedora' ? 'primary' : 'secondary'" leading-icon="whatsapp" target="_blank" rel="noopener noreferrer" :aria-label="`Consultar ${promo.name} a ${formatPrice(promo.priceSoles)} por WhatsApp (abre una pestaña nueva)`">Consultar por WhatsApp</AppButton>
  </article>
</template>
