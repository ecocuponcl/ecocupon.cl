/**
 * Domain: Product
 * 
 * Módulo de productos del catálogo
 * 
 * @domain product
 */

// Entidades
export {
  Product,
  ProductId,
  CategoryId,
  Price,
  ImageUrl,
  ProductFactory,
  ProductMapper,
} from './entities/product'

// Repositorios
export {
  IProductRepository,
  ProductFilter,
  PagedResult,
} from './repositories/product-repository'
