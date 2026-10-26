import { computed, ref, shallowRef } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import type { PromoEntity } from '../domain/model/promo.entity'
import { getPromos } from '../infrastructure/promo.service'

export const usePromosStore = defineStore('promos', () => {
  const promos = shallowRef<readonly PromoEntity[]>([])
  const sortedPromos = computed(() => [...promos.value].sort((a, b) => a.priceSoles - b.priceSoles))
  const loading = ref(false)
  const error = ref('')
  let request: Promise<void> | undefined

  function loadPromos(): Promise<void> {
    if (request) return request
    loading.value = true
    error.value = ''
    request = (async () => {
      try {
        promos.value = await getPromos()
      } catch {
        error.value = 'No pudimos cargar las promos. Inténtalo de nuevo.'
      } finally {
        loading.value = false
        if (error.value) request = undefined
      }
    })()
    return request
  }

  return { promos, sortedPromos, loading, error, loadPromos }
})

export function usePromos() {
  const store = usePromosStore()
  return { ...storeToRefs(store), loadPromos: store.loadPromos }
}
