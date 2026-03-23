/**
 * Domains - Índice Principal
 * 
 * Exporta todos los dominios del sistema
 * 
 * Uso:
 * ```typescript
 * import { Product, IProductRepository } from '@/domains'
 * ```
 */

// Product Domain (core exports)
export {
  Product,
  Price,
  ImageUrl,
  ProductFactory,
  ProductMapper,
} from './product/index'

export type {
  ProductId,
  CategoryId,
  IProductRepository,
  ProductFilter,
  PagedResult,
} from './product/index'

// Catalog Domain
export {
  Category,
  CategoryFactory,
  CategoryMapper,
  CategorySlugVO,
} from './catalog/index'

export type {
  CategoryId as CatalogCategoryId,
  CategorySlug,
  ICategoryRepository,
} from './catalog/index'

// Pricing Domain (con aliases para evitar conflictos)
export {
  KnastaPrice,
  KnastaPriceId,
  ProductUrl,
  KnastaPriceFactory,
  KnastaPriceMapper,
  PriceComparisonService,
} from './pricing/index'

export type {
  PricingProductId,
  PricingPrice,
  PricingKnastaPriceId,
} from './pricing/index'
