/**
 * Domain: Catalog
 * 
 * Módulo de categorías y catálogo
 * 
 * @domain catalog
 */

// Entidades y Value Objects
export {
  Category,
  CategoryFactory,
  CategoryMapper,
  CategorySlugVO,
} from './entities/category'

// Types puros
export type {
  Category as CategoryType,
  CategoryId,
  CategorySlug,
} from './entities/category'

// Repositorios (solo tipos)
export type { ICategoryRepository } from './repositories/category-repository'
