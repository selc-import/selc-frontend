import { computed, reactive, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { startingPrice, type CatalogSort, type Generation, type Product } from '../domain/product'
import { catalogProducts } from '../infrastructure/selc-catalog'

export const useCatalogStore = defineStore('catalog', () => {
  const generation = ref<Generation | 'all'>('all')
  const query = ref('')
  const sort = ref<CatalogSort>('newest')
  const selections = reactive<Record<string, string>>({})
  const selectedVariant = (product: Product) => product.variants.find(variant => variant.id === selections[product.id]) ?? product.variants[0]
  const products = computed(() => {
    const search = query.value.trim().toLocaleLowerCase('es')
    const filtered = catalogProducts.filter(product =>
      (generation.value === 'all' || product.generation === generation.value) &&
      `${product.name} ${product.storage} ${product.chip} ${product.port}`.toLocaleLowerCase('es').includes(search),
    )
    if (sort.value !== 'newest') {
      const direction = sort.value === 'price-asc' ? 1 : -1
      filtered.sort((a, b) => direction * (selectedVariant(a).price - selectedVariant(b).price))
    }
    return filtered
  })
  const lowestPrice = Math.min(...catalogProducts.map(startingPrice))
  const filtered = computed(() => generation.value !== 'all' || query.value.trim() !== '')
  function resetFilters() {
    generation.value = 'all'
    query.value = ''
  }
  return { generation, query, sort, selections, selectedVariant, products, lowestPrice, filtered, resetFilters }
})

/** Keep the presentation API while preserving the buyer's choices between routes. */
export function useCatalog() {
  const store = useCatalogStore()
  return { ...storeToRefs(store), selectedVariant: store.selectedVariant, resetFilters: store.resetFilters }
}
