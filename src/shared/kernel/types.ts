/**
 * Shared Kernel - Tipos Comunes
 * 
 * Tipos y utilidades compartidos entre todos los dominios
 * 
 * @shared kernel
 */

/**
 * Resultado de una operación que puede fallar
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Crea un resultado exitoso
 */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data }
}

/**
 * Crea un resultado fallido
 */
export function failure<E>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Función asíncrona que nunca falla (siempre retorna Result)
 */
export type AsyncOperation<T, E = Error> = () => Promise<Result<T, E>>

/**
 * Opciones de paginación
 */
export interface PaginationOptions {
  page: number
  limit: number
}

/**
 * Tipo para IDs genéricos
 */
export type ID = string

/**
 * Tipo para timestamps
 */
export type Timestamp = Date

/**
 * Moneda soportada
 */
export type Currency = 'CLP' | 'USD' | 'ARS'

/**
 * Formatea un número como moneda CLP
 */
export function formatCLP(amount: number): string {
  return `$${amount.toLocaleString('es-CL')}`
}

/**
 * Trunca un string a una longitud máxima
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}

/**
 * Sanitiza un string para usar en URLs
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
