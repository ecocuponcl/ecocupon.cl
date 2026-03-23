/**
 * Entidad de Dominio: Categoría
 * 
 * Representa una categoría de productos en el catálogo
 * 
 * @domain catalog
 * @boundedContext Catalog
 */

export type CategoryId = string
export type CategorySlug = string

export interface Category {
  readonly id: CategoryId
  readonly name: string
  readonly slug: CategorySlug
  readonly description: string | null
  readonly imageUrl: ImageUrl | null
  readonly createdAt: Date
}

/**
 * Value Object: CategorySlug
 * Asegura que el slug tenga formato válido
 */
export class CategorySlug {
  constructor(readonly value: string) {
    if (!this.isValidSlug(value)) {
      throw new Error('Slug inválido. Solo se permiten letras minúsculas, números y guiones')
    }
  }

  private isValidSlug(slug: string): boolean {
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  }

  toString(): string {
    return this.value
  }

  static create(value: string): CategorySlug {
    return new CategorySlug(value)
  }

  /**
   * Genera un slug desde un nombre
   */
  static fromName(name: string): CategorySlug {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return new CategorySlug(slug)
  }
}

/**
 * Value Object: ImageUrl para categorías
 */
export class ImageUrl {
  constructor(readonly value: string) {
    if (!this.isValidUrl(value)) {
      throw new Error('URL de imagen inválida')
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

  static create(value: string): ImageUrl {
    return new ImageUrl(value)
  }
}

/**
 * Factory para crear Categorías
 */
export class CategoryFactory {
  static create(params: {
    id: CategoryId
    name: string
    slug: string
    description?: string | null
    imageUrl?: string | null
    createdAt?: Date
  }): Category {
    return {
      id: params.id,
      name: params.name,
      slug: CategorySlug.create(params.slug).value,
      description: params.description ?? null,
      imageUrl: params.imageUrl ? ImageUrl.create(params.imageUrl) : null,
      createdAt: params.createdAt ?? new Date(),
    }
  }
}

/**
 * Mapper para convertir desde/ hacia tipos de Supabase
 */
export class CategoryMapper {
  /**
   * Convierte desde tipo de base de datos a entidad de dominio
   */
  static fromDatabase(row: {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    created_at: string
  }): Category {
    return CategoryFactory.create({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.image,
      createdAt: new Date(row.created_at),
    })
  }

  /**
   * Convierte desde entidad de dominio a tipo de base de datos
   */
  static toDatabase(category: Category): {
    id: string
    name: string
    slug: string
    description: string | null
    image: string | null
    created_at: string
  } {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageUrl?.value ?? null,
      created_at: category.createdAt.toISOString(),
    }
  }
}
