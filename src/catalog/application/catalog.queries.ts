import { catalogProducts } from '../infrastructure/selc-catalog'

export const findCatalogProduct = (id: unknown) => typeof id === 'string' ? catalogProducts.find(product => product.id === id) : undefined
export { photoCredits } from '../infrastructure/selc-catalog'
