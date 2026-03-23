/**
 * Domain: Product
 * 
 * Módulo de productos del catálogo
 * 
 * @domain product
 */

// Entidades y Value Objects
export {
  Product,
  Price,
  ImageUrl,
  ProductFactory,
  ProductMapper,
} from './entities/product'

// Types puros
export type {
  Product as ProductType,
  ProductId,
  CategoryId,
} from './entities/product'

// Repositorios (solo tipos)
export type {
  IProductRepository,
  ProductFilter,
  PagedResult,
} from './repositories/product-repository'
