import { PromoEntity } from '../domain/model/promo.entity'
import { promoMockData } from './promo.mock-data'

/** Mock temporal hasta contar con backend; simula la latencia de una petición de red. */
export async function getPromos(): Promise<readonly PromoEntity[]> {
  await new Promise<void>(resolve => setTimeout(resolve, 300))
  return promoMockData.map(promo => new PromoEntity(promo))
}
