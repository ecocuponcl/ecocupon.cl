/**
 * EcoCupon DDD - Índice Principal
 * 
 * Punto de entrada único para todos los módulos DDD
 * 
 * Uso:
 * ```typescript
 * import { Product, SupabaseProductRepository } from '@/ddd'
 * ```
 */

// Domains
export * from './domains/index'

// Infrastructure
export * from './infrastructure/index'

// Shared Kernel
export * from './shared/index'

// Re-export PagedResult only from product domain (avoid conflict)
export type { PagedResult } from './domains/product/repositories/product-repository'
