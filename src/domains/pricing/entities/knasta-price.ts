/**
 * Entidad de Dominio: KnastaPrice
 * 
 * Representa el precio de comparación de Knasta para un producto
 * 
 * @domain pricing
 * @boundedContext Pricing
 */

export type KnastaPriceId = number
export type ProductId = string

export interface KnastaPrice {
  readonly id: KnastaPriceId
  readonly productId: ProductId
  readonly price: Price
  readonly url: ProductUrl | null
  readonly lastUpdated: Date
}

/**
 * Value Object: Price para Knasta
 */
export class Price {
  constructor(readonly value: number, readonly currency: string = 'CLP') {
    if (value < 0) {
      throw new Error('El precio no puede ser negativo')
    }
    this.value = Math.round(value)
  }

  /**
   * Calcula el ahorro respecto al precio original
   */
  savings(originalPrice: Price): number {
    return originalPrice.value - this.value
  }

  /**
   * Calcula el porcentaje de descuento
   */
  discountPercent(originalPrice: Price): number {
    if (originalPrice.value === 0) return 0
    return Math.round(((originalPrice.value - this.value) / originalPrice.value) * 100)
  }

  /**
   * Verifica si es menor que otro precio
   */
  isLessThan(other: Price): boolean {
    return this.value < other.value
  }

  toString(): string {
    return `$${this.value.toLocaleString('es-CL')}`
  }

  static create(value: number, currency?: string): Price {
    return new Price(value, currency)
  }
}

/**
 * Value Object: ProductUrl
 */
export class ProductUrl {
  constructor(readonly value: string) {
    if (!this.isValidUrl(value)) {
      throw new Error('URL inválida')
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  toString(): string {
    return this.value
  }

  static create(value: string): ProductUrl {
    return new ProductUrl(value)
  }
}

/**
 * Factory para crear KnastaPrice
 */
export class KnastaPriceFactory {
  static create(params: {
    id?: KnastaPriceId
    productId: ProductId
    price: number
    url?: string | null
    lastUpdated?: Date
  }): KnastaPrice {
    return {
      id: params.id ?? 0,
      productId: params.productId,
      price: Price.create(params.price),
      url: params.url ? ProductUrl.create(params.url) : null,
      lastUpdated: params.lastUpdated ?? new Date(),
    }
  }
}

/**
 * Mapper para convertir desde/ hacia tipos de Supabase
 */
export class KnastaPriceMapper {
  /**
   * Convierte desde tipo de base de datos a entidad de dominio
   */
  static fromDatabase(row: {
    id: number
    product_id: string
    price: number
    url: string | null
    last_updated: string
  }): KnastaPrice {
    return KnastaPriceFactory.create({
      id: row.id,
      productId: row.product_id,
      price: row.price,
      url: row.url,
      lastUpdated: new Date(row.last_updated),
    })
  }

  /**
   * Convierte desde entidad de dominio a tipo de base de datos
   */
  static toDatabase(knastaPrice: KnastaPrice): {
    id?: number
    product_id: string
    price: number
    url: string | null
    last_updated: string
  } {
    return {
      id: knastaPrice.id,
      product_id: knastaPrice.productId,
      price: knastaPrice.price.value,
      url: knastaPrice.url?.value ?? null,
      last_updated: knastaPrice.lastUpdated.toISOString(),
    }
  }
}

/**
 * Servicio de Dominio: Comparación de Precios
 */
export class PriceComparisonService {
  /**
   * Determina si el precio de Knasta es mejor que el precio original
   */
  static isBetterDeal(knastaPrice: Price, originalPrice: Price): boolean {
    return knastaPrice.isLessThan(originalPrice)
  }

  /**
   * Calcula el ahorro y descuento entre dos precios
   */
  static calculateSavings(knastaPrice: Price, originalPrice: Price): {
    savings: number
    discountPercent: number
    isBetter: boolean
  } {
    const savings = knastaPrice.savings(originalPrice)
    const discountPercent = knastaPrice.discountPercent(originalPrice)
    const isBetter = this.isBetterDeal(knastaPrice, originalPrice)

    return { savings, discountPercent, isBetter }
  }
}
