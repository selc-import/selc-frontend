<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandMark from '../../brand/presentation/components/BrandMark.vue'
import AppButton from '../../shared/presentation/components/AppButton.vue'
import { advisorInquiry, advisors } from '../../catalog/application/whatsapp'
import { useCatalog } from '../../catalog/application/useCatalog'
import '../storefront.css'

const route = useRoute()
const { generation, selectCategory } = useCatalog()
const root = ref<HTMLElement>()
const active = ref('continuar')
const links = [
  { id: 'continuar', hash: 'explorar', label: 'iPhones' },
  { id: 'accesorios', hash: 'accesorios', label: 'Accesorios' },
  { id: 'como-comprar', hash: 'como-comprar', label: 'Cómo comprar' },
  { id: 'contacto', hash: 'contacto', label: 'Contacto' },
]
let frame: number | undefined
function updateActive() {
  frame = undefined
  if (route.name !== 'storefront') { active.value = 'continuar'; return }
  if (scrollY + innerHeight >= document.documentElement.scrollHeight - 4) { active.value = 'contacto'; return }
  const threshold = (root.value?.getBoundingClientRect().bottom ?? 80) + 100
  active.value = links.filter(link => {
    const element = document.getElementById(link.id)
    return element && element.getBoundingClientRect().top <= threshold
  }).at(-1)?.id ?? 'continuar'
}
function onScroll() { if (frame === undefined) frame = requestAnimationFrame(updateActive) }
function selectSection(id: string) {
  if (id === 'continuar') selectCategory('all')
  if (id === 'accesorios') selectCategory('Accesorios')
}
watch([() => route.fullPath, generation], updateActive, { flush: 'post' })
onMounted(() => { updateActive(); window.addEventListener('scroll', onScroll, { passive: true }) })
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  if (frame !== undefined) cancelAnimationFrame(frame)
})
</script>

<template>
  <nav ref="root" class="storefront-nav" aria-label="Navegación principal">
    <RouterLink class="header-brand" :to="{ name: 'storefront', hash: '#inicio' }" aria-label="SELC IMPORT, volver al inicio"><BrandMark compact /></RouterLink>
    <div class="storefront-nav-links">
      <RouterLink v-for="link in links" :key="link.id" :to="{ name: 'storefront', hash: `#${link.hash}` }" :aria-current="active === link.id ? 'location' : undefined" @click="selectSection(link.id)">{{ link.label }}</RouterLink>
    </div>
    <AppButton class="storefront-contact" variant="secondary" leading-icon="whatsapp" :href="advisorInquiry(advisors[0].number)" target="_blank" rel="noopener noreferrer" aria-label="Consultar por WhatsApp (abre una pestaña nueva)">WhatsApp</AppButton>
  </nav>
</template>
