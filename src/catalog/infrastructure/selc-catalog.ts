import type { Product } from '../domain/product'

// Source: SELC-Import-Catalogo-iPhone.pdf, October 2026, pages 1–5.
// Preserve the supplied specifications and prices; availability is confirmed by an advisor.
export const catalogProducts: readonly Product[] = [
  {
    id: 'iphone-17-pro-max', name: 'iPhone 17 Pro Max', generation: 17, storage: '256 GB',
    screen: '6.9″ ProMotion', chip: 'A19 Pro', cameras: 'Triple 48 MP · zoom 4x', port: 'USB-C',
    image: '/assets/catalog/iphone-17-pro-max.jpeg', imageWidth: 900, imageHeight: 1350,
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '256 GB', price: 4450 }],
  },
  {
    id: 'iphone-17-pro', name: 'iPhone 17 Pro', generation: 17, storage: '256 GB',
    screen: '6.3″ ProMotion', chip: 'A19 Pro', cameras: 'Triple 48 MP · zoom 4x', port: 'USB-C',
    image: '/assets/catalog/iphone-17-pro.jpeg', imageWidth: 1200, imageHeight: 900,
    imageFocus: '60% 50%', // Shift the portrait crop toward the camera module on the right.
    variants: [{ id: 'standard', label: '256 GB', price: 3750 }],
  },
  {
    id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', generation: 16, storage: '256 GB',
    screen: '6.9″ ProMotion', chip: 'A18 Pro', cameras: '48 MP · zoom 5x', port: 'USB-C',
    image: '/assets/catalog/iphone-16-pro-max.jpeg', imageWidth: 1200, imageHeight: 900,
    imageFocus: '55% 50%', // Center the handset, which sits slightly right of the source midpoint.
    variants: [{ id: 'standard', label: '256 GB', price: 3499 }],
  },
  {
    id: 'iphone-16-pro', name: 'iPhone 16 Pro', generation: 16, storage: '128 GB',
    screen: '6.3″ ProMotion', chip: 'A18 Pro', cameras: '48 MP · zoom 5x', port: 'USB-C',
    image: '/assets/catalog/iphone-16-pro.jpeg', imageWidth: 900, imageHeight: 1171,
    // Source is already a close-up; a full-device view requires a replacement photo, not a focus shift.
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '128 GB', price: 2750 }],
  },
  {
    id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', generation: 15, storage: '256 GB',
    screen: '6.7″ ProMotion', chip: 'A17 Pro', cameras: '48 MP · zoom 5x', port: 'USB-C',
    image: '/assets/catalog/iphone-15-pro-max.jpeg', imageWidth: 900, imageHeight: 1199,
    // Manual crop candidate: excess black background makes the devices small; object-position cannot zoom.
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '256 GB', price: 2750 }],
  },
  {
    id: 'iphone-15-pro', name: 'iPhone 15 Pro', generation: 15, storage: '256 GB',
    screen: '6.1″ ProMotion', chip: 'A17 Pro', cameras: '48 MP · zoom 3x', port: 'USB-C',
    image: '/assets/catalog/iphone-15-pro.jpeg', imageWidth: 900, imageHeight: 1199,
    // Manual crop candidate: excess black background makes the devices small; object-position cannot zoom.
    imageFocus: 'center center',
    variants: [{ id: 'standard', label: '256 GB', price: 2420 }],
  },
  {
    id: 'iphone-14-pro', name: 'iPhone 14 Pro', generation: 14, storage: '256 GB',
    screen: '6.1″ ProMotion', chip: 'A16 Bionic', cameras: '48 MP · zoom 3x', port: 'Lightning',
    image: '/assets/catalog/iphone-14-pro.jpeg', imageWidth: 630, imageHeight: 840,
    imageFocus: 'center center',
    variants: [
      { id: 'esim', label: 'eSIM', price: 2200 },
      { id: 'physical-sim', label: 'Chip físico', price: 2250 },
    ],
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
