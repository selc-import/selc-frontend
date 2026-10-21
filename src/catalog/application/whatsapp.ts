import { formatPrice, type Product, type ProductVariant } from '../domain/product'

export const advisors = [
  { name: 'Asesor 1', number: '51977591210', display: '977 591 210' },
  { name: 'Asesor 2', number: '51949092211', display: '949 092 211' },
] as const

export function whatsappLink(message: string, number: string = advisors[0].number) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function productInquiry(product: Product, variant: ProductVariant) {
  const version = product.variants.length > 1 ? ` (${variant.label})` : ''
  return whatsappLink(`Hola SELC Import, me interesa el ${product.name} de ${product.storage}${version} a ${formatPrice(variant.price)}. ¿Qué colores tienen disponibles? Quiero separarlo con S/ 20.`)
}

export const importInquiry = whatsappLink('Hola SELC Import, quiero cotizar un pedido desde EE. UU. El modelo que busco es: ')
export const advisorInquiry = (number: string) => whatsappLink('Hola SELC Import, quiero información de sus iPhone y coordinar una entrega presencial.', number)
