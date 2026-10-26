export type Generation = 14 | 15 | 16 | 17
export type ProductCategory = 'iPhone' | 'Accesorios'
export type CatalogFilter = Generation | ProductCategory | 'all'

export interface ProductVariant {
  id: string
  label: string
  price: number
}

interface ProductInformation {
  id: string
  name: string
  category: ProductCategory
  /**
   * Contenido descriptivo de la caja, incluido con el equipo.
   * No tiene precio propio ni representa productos para comprar por separado.
   */
  includedAccessories?: string[]
}

export interface IPhoneProduct extends ProductInformation {
  category: 'iPhone'
  generation: Generation
  storage: string
  screen: string
  chip: string
  cameras: string
  port: string
  image: string
  /**
   * Image focal position in CSS object-position format (e.g. '50% 30%').
   * Used to frame the product photo; defaults to 'center center' when omitted.
   */
  imageFocus?: string
  imageWidth: number
  imageHeight: number
  variants: readonly ProductVariant[]
}

export interface AccessoryProduct extends ProductInformation {
  category: 'Accesorios'
  eyebrow: string
  description: string
  priceSoles: number
  stockStatus: 'disponible'
  accent: string
  monogram: string
  featured: boolean
}

export type Product = IPhoneProduct | AccessoryProduct
export type CatalogSort = 'newest' | 'price-asc' | 'price-desc'
export const startingPrice = (product: Product) => product.category === 'Accesorios'
  ? product.priceSoles
  : Math.min(...product.variants.map(variant => variant.price))
export const productFilter = (product: Product): CatalogFilter => product.category === 'iPhone' ? product.generation : product.category
export const formatPrice = (price: number) => `S/ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: Number.isInteger(price) ? 0 : 2, maximumFractionDigits: 2 }).format(price)}`
