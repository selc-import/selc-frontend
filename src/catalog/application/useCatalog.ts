import { computed, reactive, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { productFilter, startingPrice, type CatalogFilter, type CatalogSort, type IPhoneProduct, type Product } from '../domain/product'
import { catalogProducts } from '../infrastructure/selc-catalog'

export const useCatalogStore = defineStore('catalog', () => {
  const generation = ref<CatalogFilter>('all')
  const query = ref('')
  const sort = ref<CatalogSort>('newest')
  const selections = reactive<Record<string, string>>({})
  const selectedVariant = (product: IPhoneProduct) => product.variants.find(variant => variant.id === selections[product.id]) ?? product.variants[0]
  const categories = computed(() => {
    const available = new Set(catalogProducts.map(productFilter))
    return [
      { value: 'all' as const, label: 'Todos' },
      ...[...available].map(value => ({ value, label: typeof value === 'number' ? `iPhone ${value}` : value })),
    ]
  })
  const selectedPrice = (product: Product) => product.category === 'iPhone' ? selectedVariant(product).price : product.priceSoles
  const products = computed(() => {
    const search = query.value.trim().toLocaleLowerCase('es')
    const filtered = catalogProducts.filter(product =>
      (generation.value === 'all' || productFilter(product) === generation.value) &&
      (product.category === 'iPhone'
        ? `${product.name} ${product.storage} ${product.chip} ${product.port}`
        : `${product.name} ${product.eyebrow} ${product.description}`
      ).toLocaleLowerCase('es').includes(search),
    )
    if (sort.value !== 'newest') {
      const direction = sort.value === 'price-asc' ? 1 : -1
      filtered.sort((a, b) => direction * (selectedPrice(a) - selectedPrice(b)))
    }
    return filtered
  })
  const lowestPrice = Math.min(...catalogProducts.filter(product => product.category === 'iPhone').map(startingPrice))
  const iphoneProducts = computed(() => products.value.filter(product => product.category === 'iPhone'))
  const accessoryProducts = computed(() => products.value.filter(product => product.category === 'Accesorios'))
  const filtered = computed(() => generation.value !== 'all' || query.value.trim() !== '')
  function selectCategory(category: CatalogFilter) {
    generation.value = category
    query.value = ''
  }
  function resetFilters() {
    selectCategory('all')
  }
  return { generation, categories, query, sort, selections, selectedVariant, products, iphoneProducts, accessoryProducts, lowestPrice, filtered, selectCategory, resetFilters }
})

/** Keep the presentation API while preserving the buyer's choices between routes. */
export function useCatalog() {
  const store = useCatalogStore()
  return { ...storeToRefs(store), selectedVariant: store.selectedVariant, selectCategory: store.selectCategory, resetFilters: store.resetFilters }
}
