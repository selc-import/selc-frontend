import type { PromoData } from '../domain/model/promo.entity'

export const promoMockData: readonly PromoData[] = [
  // Ofertas publicadas por SELC IMPORT. Conservar emojis, orden y ambos precios.
  {
    id: 'pack-infiel',
    name: '😏 PACK INFIEL',
    description: 'Uno para ella y otro para "la otra"',
    items: [
      { productName: 'AirPods 4ta Generación', quantity: 2 },
      { productName: 'Cubo', quantity: 2 },
      { productName: 'Cable C a C o C a Lightning', quantity: 2 },
    ],
    regularPriceSoles: 469.60,
    priceSoles: 249.99,
  },
  {
    id: 'pack-doble-vida',
    name: '🕵️ PACK DOBLE VIDA',
    description: 'Dos de todo, cero preguntas',
    items: [
      { productName: 'Case MagSafe', quantity: 2 },
      { productName: 'Cubo', quantity: 2 },
      { productName: 'Cable C a C o C a Lightning', quantity: 2 },
    ],
    regularPriceSoles: 139.78,
    priceSoles: 109.90,
  },
  {
    id: 'pack-crush',
    name: '💘 PACK CRUSH',
    description: 'Para impresionar',
    items: [
      { productName: 'AirPods Pro 2da Generación', quantity: 1 },
      { productName: 'Case MagSafe', quantity: 1 },
      { productName: 'Cable C a C o C a Lightning', quantity: 1 },
    ],
    regularPriceSoles: 164.79,
    priceSoles: 124.99,
  },
  {
    id: 'pack-salvavidas',
    name: '🪫 PACK SALVAVIDAS',
    description: 'Cuando el cel se muere a media calle',
    items: [
      { productName: 'Cubo', quantity: 1 },
      { productName: 'Cable C a C o C a Lightning', quantity: 1 },
      { productName: 'Case MagSafe', quantity: 1 },
    ],
    regularPriceSoles: 69.89,
    priceSoles: 54.90,
  },
  {
    id: 'pack-universitario',
    name: '🎓 PACK UNIVERSITARIO',
    description: 'Cubo + cable + vidrio Matte',
    items: [
      { productName: 'Cubo', quantity: 1 },
      { productName: 'Cable C a C o C a Lightning', quantity: 1 },
      { productName: 'Vidrio Matte Ceramic', quantity: 1 },
    ],
    regularPriceSoles: 64.80,
    priceSoles: 52.90,
  },
  {
    id: 'pack-cumple',
    name: '🎂 PACK CUMPLE',
    description: 'El regalo que nunca falla',
    items: [
      { productName: 'AirPods 4ta Generación', quantity: 1 },
      { productName: 'Cable C a C o C a Lightning', quantity: 1 },
    ],
    regularPriceSoles: 199.80,
    priceSoles: 119.99,
  },
  {
    id: 'pack-mayorista',
    name: '🏭 PACK MAYORISTA',
    description: 'Para revendedores grandes',
    items: [
      { productName: 'Cubo', quantity: 10 },
      { productName: 'Cable C a C o C a Lightning', quantity: 10 },
    ],
    regularPriceSoles: 549,
    priceSoles: 320,
  },
  {
    id: 'revendedor-airpods',
    name: '💰REVENDEDOR AIRPODS',
    description: '3 AirPods 4ta + 3 cubos + 3 cables',
    items: [
      { productName: 'AirPods 4ta Generación', quantity: 3 },
      { productName: 'Cubo', quantity: 3 },
      { productName: 'Cable C a C o C a Lightning', quantity: 3 },
    ],
    regularPriceSoles: 704.40,
    priceSoles: 369.99,
  },
  {
    id: 'solo-cables-12',
    name: '💰SOLO CABLES 12',
    description: 'C→C o C→Lightning',
    items: [{ productName: 'Cable C a C o C a Lightning', quantity: 12 }],
    regularPriceSoles: 238.80,
    priceSoles: 179.90,
  },
  {
    id: 'solo-cubos-12',
    name: '💰SOLO CUBOS 12',
    description: '12 cubos',
    items: [{ productName: 'Cubo', quantity: 12 }],
    regularPriceSoles: 420,
    priceSoles: 189.90,
  },
  {
    id: 'pack-8',
    name: '💰PACK 8',
    description: '4 cubos + 4 cables',
    items: [
      { productName: 'Cubo', quantity: 4 },
      { productName: 'Cable C a C o C a Lightning', quantity: 4 },
    ],
    regularPriceSoles: 219.60,
    priceSoles: 159.90,
  },
  {
    id: 'solo-cables-6',
    name: '⚡SOLO CABLES 6',
    description: 'C→C o C→Lightning',
    items: [{ productName: 'Cable C a C o C a Lightning', quantity: 6 }],
    regularPriceSoles: 119.40,
    priceSoles: 94.90,
  },
  {
    id: 'solo-cubos-6',
    name: '⚡ SOLO CUBOS 6',
    description: '6 cubos',
    items: [{ productName: 'Cubo', quantity: 6 }],
    regularPriceSoles: 210,
    priceSoles: 99.90,
  },
  // Promos anteriores, sin precio común publicado: permanecen después de las nuevas ofertas.
  {
    id: 'combo-esencial',
    name: 'Combo Esencial',
    description: 'Cubo, cable y AirPods 4ta Generación en un solo combo.',
    items: [
      { productName: 'Cubo', quantity: 2 },
      { productName: 'Cable C a C o C a Lightning', quantity: 1 },
      { productName: 'AirPods 4ta Generación', quantity: 1 },
    ],
    priceSoles: 139.99,
  },
  {
    id: 'promo-emprendedora',
    name: 'Promo Emprendedora',
    description: '12 accesorios por tan solo S/ 200',
    items: [
      { productName: 'Cubo', quantity: 6 },
      { productName: 'Cable C a C o C a Lightning', quantity: 6 },
    ],
    priceSoles: 200,
  },
]
