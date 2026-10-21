export type Generation = 14 | 15 | 16 | 17

export interface ProductVariant {
  id: string
  label: string
  price: number
}

export interface Product {
  id: string
  name: string
  generation: Generation
  storage: string
  screen: string
  chip: string
  cameras: string
  port: string
  image: string
  imageWidth: number
  imageHeight: number
  variants: readonly ProductVariant[]
}

export type CatalogSort = 'newest' | 'price-asc' | 'price-desc'
export const startingPrice = (product: Product) => Math.min(...product.variants.map(variant => variant.price))
export const formatPrice = (price: number) => `S/ ${new Intl.NumberFormat('en-US').format(price)}`
