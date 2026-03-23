/**
 * Domain: Pricing
 * 
 * Módulo de precios y comparaciones
 * 
 * @domain pricing
 */

// Entidades y Value Objects (export type para tipos puros)
export {
  KnastaPrice,
  KnastaPriceId,
  ProductUrl,
  KnastaPriceFactory,
  KnastaPriceMapper,
  PriceComparisonService,
} from './entities/knasta-price'

// Tipos con alias para evitar conflictos
export type {
  KnastaPriceId as PricingKnastaPriceId,
  ProductId as PricingProductId,
  Price as PricingPrice,
} from './entities/knasta-price'
