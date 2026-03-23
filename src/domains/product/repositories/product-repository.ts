/**
 * Repositorio: Interfaz para Product Repository
 * 
 * Define el contrato para operaciones de productos
 * Independiente de la infraestructura (Supabase, REST, etc.)
 * 
 * @domain product
 * @boundedContext Catalog
 */

import type { Product, ProductId, CategoryId } from '../entities/product'

/**
 * Criterios de búsqueda para productos
 */
export interface ProductFilter {
  categoryId?: CategoryId
  search?: string
  minPrice?: number
  maxPrice?: number
  limit?: number
  offset?: number
}

/**
 * Resultado paginado
 */
export interface PagedResult<T> {
  readonly data: T[]
  readonly total: number
  readonly limit: number
  readonly offset: number
}

/**
 * Interfaz del repositorio de productos
 */
export interface IProductRepository {
  /**
   * Obtiene todos los productos con filtros opcionales
   */
  findAll(filter?: ProductFilter): Promise<PagedResult<Product>>

  /**
   * Obtiene un producto por ID
   */
  findById(id: ProductId): Promise<Product | null>

  /**
   * Obtiene productos por categoría
   */
  findByCategory(categoryId: CategoryId, limit?: number): Promise<Product[]>

  /**
   * Busca productos por término de búsqueda
   */
  search(term: string, limit?: number): Promise<Product[]>

  /**
   * Crea un nuevo producto
   */
  create(product: Product): Promise<Product>

  /**
   * Actualiza un producto existente
   */
  update(product: Product): Promise<Product>

  /**
   * Elimina un producto por ID
   */
  delete(id: ProductId): Promise<void>

  /**
   * Verifica si un producto existe
   */
  exists(id: ProductId): Promise<boolean>

  /**
   * Cuenta el total de productos
   */
  count(): Promise<number>
}
