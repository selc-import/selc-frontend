import type { Product } from '../domain/product'

// iPhones: SELC-Import-Catalogo-iPhone.pdf, October 2026, pages 1–5.
// Included accessories and standalone accessory prices/stock: supplied by SELC IMPORT.
// Preserve the supplied specifications and prices; iPhone availability is confirmed by an advisor.
export const catalogProducts: readonly Product[] = [
  {
    id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', category: 'iPhone', generation: 17, storage: '256 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.9″ ProMotion', chip: 'A19 Pro', cameras: 'Triple 48 MP · zoom 4x', port: 'USB-C',
    image: '/assets/catalog/iphone-17-pro-max.jpeg', imageWidth: 900, imageHeight: 1350,
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '256 GB', price: 4450 }],
  },
  {
    id: 'iphone-17-pro', name: 'iPhone 17 Pro', category: 'iPhone', generation: 17, storage: '256 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.3″ ProMotion', chip: 'A19 Pro', cameras: 'Triple 48 MP · zoom 4x', port: 'USB-C',
    image: '/assets/catalog/iphone-17-pro.jpeg', imageWidth: 1200, imageHeight: 900,
    imageFocus: '60% 50%', // Shift the portrait crop toward the camera module on the right.
    variants: [{ id: 'standard', label: '256 GB', price: 3750 }],
  },
  {
    id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', category: 'iPhone', generation: 16, storage: '256 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.9″ ProMotion', chip: 'A18 Pro', cameras: '48 MP · zoom 5x', port: 'USB-C',
    image: '/assets/catalog/iphone-16-pro-max.jpeg', imageWidth: 1200, imageHeight: 900,
    imageFocus: '55% 50%', // Center the handset, which sits slightly right of the source midpoint.
    variants: [{ id: 'standard', label: '256 GB', price: 3499 }],
  },
  {
    id: 'iphone-16-pro', name: 'iPhone 16 Pro', category: 'iPhone', generation: 16, storage: '128 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.3″ ProMotion', chip: 'A18 Pro', cameras: '48 MP · zoom 5x', port: 'USB-C',
    image: '/assets/catalog/iphone-16-pro.jpeg', imageWidth: 900, imageHeight: 1171,
    // Source is already a close-up; a full-device view requires a replacement photo, not a focus shift.
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '128 GB', price: 2750 }],
  },
  {
    id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', category: 'iPhone', generation: 15, storage: '256 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.7″ ProMotion', chip: 'A17 Pro', cameras: '48 MP · zoom 5x', port: 'USB-C',
    image: '/assets/catalog/iphone-15-pro-max.jpeg', imageWidth: 900, imageHeight: 1199,
    // Manual crop candidate: excess black background makes the devices small; object-position cannot zoom.
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '256 GB', price: 2750 }],
  },
  {
    id: 'iphone-15-pro', name: 'iPhone 15 Pro', category: 'iPhone', generation: 15, storage: '256 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.1″ ProMotion', chip: 'A17 Pro', cameras: '48 MP · zoom 3x', port: 'USB-C',
    image: '/assets/catalog/iphone-15-pro.jpeg', imageWidth: 900, imageHeight: 1199,
    // Manual crop candidate: excess black background makes the devices small; object-position cannot zoom.
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '256 GB', price: 2420 }],
  },
  {
    id: 'iphone-14-pro', name: 'iPhone 14 Pro', category: 'iPhone', generation: 14, storage: '256 GB',
    includedAccessories: ['Cubo', 'Cable', 'Case', 'Mica'],
    screen: '6.1″ ProMotion', chip: 'A16 Bionic', cameras: '48 MP · zoom 3x', port: 'Lightning',
    image: '/assets/catalog/iphone-14-pro.jpeg', imageWidth: 630, imageHeight: 840,
    imageFocus: 'center center',
    variants: [
      { id: 'esim', label: 'eSIM', price: 2200 },
      { id: 'physical-sim', label: 'Chip físico', price: 2250 },
    ],
  },
  {
    id: 'case-magsafe', name: 'Case MagSafe (carga inalámbrica)', category: 'Accesorios',
    eyebrow: 'Protección', description: 'Case MagSafe para acompañar tu iPhone.',
    priceSoles: 14.99, stockStatus: 'disponible', accent: '#d6c29d', monogram: 'MG', featured: false,
  },
  {
    id: 'cubo-de-carga', name: 'Cubo de carga', category: 'Accesorios',
    eyebrow: 'Carga', description: 'Cubo de carga para tu equipo.',
    priceSoles: 35, stockStatus: 'disponible', accent: '#c4b496', monogram: 'USB', featured: false,
  },
  {
    id: 'cable-c-a-c-o-lightning', name: 'Cable C a C o C a Lightning', category: 'Accesorios',
    eyebrow: 'Carga', description: 'Consulta por tu cable C a C o C a Lightning.',
    priceSoles: 19.90, stockStatus: 'disponible', accent: '#bca16a', monogram: 'C', featured: false,
  },
  {
    id: 'vidrio-mate-ceramic-shield', name: 'Vidrio Mate Ceramic Shield', category: 'Accesorios',
    eyebrow: 'Protección', description: 'Vidrio mate Ceramic Shield para tu iPhone.',
    priceSoles: 9.90, stockStatus: 'disponible', accent: '#d6c29d', monogram: 'CS', featured: false,
  },
  {
    id: 'airpods-4ta-generacion', name: 'AirPods 4ta Generación', category: 'Accesorios',
    eyebrow: 'Audio', description: 'AirPods de 4ta generación.',
    priceSoles: 179.90, stockStatus: 'disponible', accent: '#dbc69e', monogram: 'A4', featured: true,
  },
  {
    id: 'airpods-pro-2da-generacion', name: 'AirPods Pro 2da Generación', category: 'Accesorios',
    eyebrow: 'Audio', description: 'AirPods Pro de 2da generación.',
    priceSoles: 129.90, stockStatus: 'disponible', accent: '#bca16a', monogram: 'AP2', featured: false,
  },
]

export const photoCredits = [
  { model: 'iPhone 17 Pro Max', author: 'Ahmad Ali Karim', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Cosmic_Orange_iPhone_17_Pro_Max.jpg' },
  { model: 'iPhone 17 Pro', author: 'Olgierd Rudak', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:IPhone_17_Pro_(2025-12-28).jpg' },
  { model: 'iPhone 16 Pro Max', author: 'Padgriffin', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:IPhone_16_Pro_Max_Desert_Titanium_Rear.png' },
  { model: 'iPhone 16 Pro', author: 'メイド理世', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:IPhone_16_Pro_(54251926676).jpg' },
  { model: 'iPhone 15 Pro Max', author: 'Ka Kit Pang', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:IPhone_15_pro_max.png' },
  { model: 'iPhone 15 Pro', author: 'Ka Kit Pang', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:IPhone_15_pro.png' },
] as const
