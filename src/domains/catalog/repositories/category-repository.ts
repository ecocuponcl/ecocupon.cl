/**
 * Repositorio: Interfaz para Category Repository
 * 
 * Define el contrato para operaciones de categorías
 * 
 * @domain catalog
 * @boundedContext Catalog
 */

import type { Category, CategoryId, CategorySlug } from '../entities/category'
import type { PagedResult } from '../../product/repositories/product-repository'

/**
 * Interfaz del repositorio de categorías
 */
export interface ICategoryRepository {
  /**
   * Obtiene todas las categorías
   */
  findAll(): Promise<Category[]>

  /**
   * Obtiene una categoría por ID
   */
  findById(id: CategoryId): Promise<Category | null>

  /**
   * Obtiene una categoría por slug
   */
  findBySlug(slug: CategorySlug): Promise<Category | null>

  /**
   * Crea una nueva categoría
   */
  create(category: Category): Promise<Category>

  /**
   * Actualiza una categoría existente
   */
  update(category: Category): Promise<Category>

  /**
   * Elimina una categoría por ID
   */
  delete(id: CategoryId): Promise<void>

  /**
   * Verifica si una categoría existe
   */
  exists(id: CategoryId): Promise<boolean>

  /**
   * Cuenta el total de categorías
   */
  count(): Promise<number>

  /**
   * Obtiene categorías con productos
   */
  findAllWithProductCount(): Promise<Array<Category & { productCount: number }>>
}
