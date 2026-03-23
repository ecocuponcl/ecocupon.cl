/**
 * Domain: Catalog
 * 
 * Módulo de categorías y catálogo
 * 
 * @domain catalog
 */

// Entidades
export {
  Category,
  CategoryId,
  CategorySlug,
  ImageUrl,
  CategoryFactory,
  CategoryMapper,
} from './entities/category'

// Repositorios
export { ICategoryRepository } from './repositories/category-repository'
