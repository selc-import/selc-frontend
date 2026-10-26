export interface PromoItem {
  productName: string
  quantity: number
}

export interface PromoData {
  id: string
  name: string
  description: string
  items: readonly PromoItem[]
  priceSoles: number
  /** Precio común suministrado por SELC IMPORT; se omite si no existe una comparación publicada. */
  regularPriceSoles?: number
}

/** Combo con precio propio, independiente de los productos y del contenido de la caja. */
export class PromoEntity {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly items: readonly Readonly<PromoItem>[]
  readonly priceSoles: number
  readonly regularPriceSoles?: number

  constructor(data: PromoData) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.items = Object.freeze(data.items.map(item => Object.freeze({ ...item })))
    this.priceSoles = data.priceSoles
    this.regularPriceSoles = data.regularPriceSoles
    this.validate()
  }

  validate(): void {
    if (!this.id.trim() || !this.name.trim() || !this.description.trim()) {
      throw new Error('La promo debe tener identificador, nombre y descripción.')
    }
    if (!Number.isFinite(this.priceSoles) || this.priceSoles <= 0) {
      throw new Error('El precio de la promo debe ser un número positivo.')
    }
    if (this.regularPriceSoles !== undefined && (
      !Number.isFinite(this.regularPriceSoles) ||
      Math.round(this.regularPriceSoles * 100) <= Math.round(this.priceSoles * 100)
    )) {
      throw new Error('El precio común debe ser finito y mayor que el precio de oferta.')
    }
    if (!this.items.length || this.items.some(item => !item.productName.trim() || !Number.isInteger(item.quantity) || item.quantity <= 0)) {
      throw new Error('La promo debe incluir productos con nombre y cantidades enteras positivas.')
    }
  }

  get hasDiscount(): boolean {
    return this.regularPriceSoles !== undefined
  }

  get savingsSoles(): number {
    if (this.regularPriceSoles === undefined) return 0
    return (Math.round(this.regularPriceSoles * 100) - Math.round(this.priceSoles * 100)) / 100
  }

  /** Porcentaje entero redondeado hacia abajo para no exagerar el descuento publicado. */
  get discountPercentage(): number {
    if (this.regularPriceSoles === undefined) return 0
    return Math.floor(Math.round(this.savingsSoles * 100) * 100 / Math.round(this.regularPriceSoles * 100))
  }

  get itemsSummary(): string {
    // Multiplicadores conservan los nombres comerciales sin inventar plurales de marcas.
    return new Intl.ListFormat('es', { style: 'long', type: 'conjunction' })
      .format(this.items.map(item => `${item.quantity} × ${item.productName}`))
  }
}
