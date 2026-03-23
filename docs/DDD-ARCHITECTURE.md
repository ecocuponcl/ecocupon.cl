# 🏗️ Domain-Driven Design (DDD) - EcoCupon

## 📋 Visión General

Este proyecto sigue los principios de **Domain-Driven Design (DDD)** para organizar el código según el **modelo de negocio**, no según la tecnología. Esto permite:

- ✅ **Independencia de frameworks** (Next.js, Ionic, React Native)
- ✅ **Código testable** sin dependencias de infraestructura
- ✅ **Escalabilidad** para agregar nuevas plataformas
- ✅ **Mantenibilidad** con límites claros entre dominios

---

## 🎯 Dominios del Negocio

```
┌─────────────────────────────────────────────────────────┐
│                   DOMINIOS PRINCIPALES                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🛍️  COMERCIO (Product Catalog)                        │
│     ├── Productos                                       │
│     ├── Categorías                                      │
│     └── Especificaciones                                │
│                                                         │
│  💰  PRECIOS (Pricing)                                  │
│     ├── Knasta Prices                                   │
│     ├── Comparación de precios                          │
│     └── Descuentos                                      │
│                                                         │
│  👤  USUARIOS (Auth)                                    │
│     ├── Autenticación                                   │
│     ├── Profiles                                        │
│     └── Roles                                           │
│                                                         │
│  📦  PEDIDOS (Orders) - Futuro                          │
│  💳  PAGOS (Payments) - Futuro                          │
│  📊  ANALYTICS - Futuro                                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Carpetas

```
src/
├── domains/                    # 🎯 Lógica de negocio pura
│   ├── product/                # Dominio: Productos
│   │   ├── entities/           # Entidades de dominio
│   │   │   └── product.ts      # Product, Price, ImageUrl
│   │   ├── value-objects/      # Value Objects
│   │   ├── repositories/       # Interfaces de repositorios
│   │   │   └── product-repository.ts
│   │   └── services/           # Servicios de dominio
│   │
│   ├── catalog/                # Dominio: Categorías
│   │   ├── entities/
│   │   │   └── category.ts
│   │   └── repositories/
│   │       └── category-repository.ts
│   │
│   ├── pricing/                # Dominio: Precios
│   │   ├── entities/
│   │   │   └── knasta-price.ts
│   │   └── services/
│   │       └── price-comparison-service.ts
│   │
│   └── index.ts                # Exports públicos
│
├── infrastructure/             # 🔧 Implementaciones técnicas
│   ├── supabase/               # Repositorios con Supabase
│   │   ├── product-repository.impl.ts
│   │   └── category-repository.impl.ts
│   ├── storage/                # Storage (imágenes, archivos)
│   └── external/               # APIs externas (Knasta, etc.)
│
├── application/                # 📋 Casos de uso
│   ├── commands/               # Operaciones de escritura
│   ├── queries/                # Operaciones de lectura
│   └── handlers/               # Manejadores de comandos/queries
│
├── presentation/               # 🎨 Capa de presentación
│   ├── components/             # Componentes UI
│   ├── hooks/                  # React Hooks
│   └── pages/                  # Páginas (Next.js, Ionic, etc.)
│
└── shared/                     # 🔗 Shared Kernel
    ├── kernel/                 # Tipos y utilidades comunes
    │   └── types.ts
    ├── constants/              # Constantes globales
    └── types/                  # Tipos compartidos
```

---

## 🏛️ Patrones de Diseño

### 1. Entities (Entidades)

Objetos con identidad única que persisten a través del tiempo.

```typescript
// src/domains/product/entities/product.ts
export interface Product {
  readonly id: ProductId
  readonly name: string
  readonly price: Price
  readonly categoryId: CategoryId | null
  // ... más propiedades
}

export class Price {
  constructor(readonly value: number, readonly currency: string = 'CLP') {
    if (value < 0) throw new Error('El precio no puede ser negativo')
    this.value = Math.round(value)
  }

  discountPercent(otherPrice: Price): number {
    return Math.round(((otherPrice.value - this.value) / otherPrice.value) * 100)
  }
}
```

### 2. Value Objects

Objetos definidos por sus atributos, sin identidad propia.

```typescript
// src/domains/product/entities/product.ts
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
}
```

### 3. Repositories (Repositorios)

Interfaces que definen operaciones de persistencia.

```typescript
// src/domains/product/repositories/product-repository.ts
export interface IProductRepository {
  findAll(filter?: ProductFilter): Promise<PagedResult<Product>>
  findById(id: ProductId): Promise<Product | null>
  create(product: Product): Promise<Product>
  update(product: Product): Promise<Product>
  delete(id: ProductId): Promise<void>
}
```

### 4. Infrastructure Implementations

Implementaciones concretas de los repositorios.

```typescript
// src/infrastructure/supabase/product-repository.impl.ts
export class SupabaseProductRepository implements IProductRepository {
  async findAll(filter?: ProductFilter): Promise<PagedResult<Product>> {
    const client = await this.getClient()
    const { data } = await client.from('products').select('*')
    return { data: data.map(ProductMapper.fromDatabase), total: data.length }
  }
}
```

### 5. Mappers

Convierten entre entidades de dominio y modelos de base de datos.

```typescript
// src/domains/product/entities/product.ts
export class ProductMapper {
  static fromDatabase(row: DatabaseProduct): Product {
    return ProductFactory.create({
      id: row.id,
      name: row.name,
      price: row.price,
      // ...
    })
  }

  static toDatabase(product: Product): DatabaseProduct {
    return {
      id: product.id,
      name: product.name,
      price: product.price.value,
      // ...
    }
  }
}
```

---

## 🔄 Flujo de Datos

```
┌──────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                          │
│  (Next.js Pages / Ionic / React Native)                  │
│                                                          │
│  import { Product } from '@/domains'                     │
│  const product = await repository.findById(id)           │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ↓ Usa interfaces de dominio
┌──────────────────────────────────────────────────────────┐
│                     DOMINIO                              │
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │  Entities    │ ←→  │  Services    │                  │
│  │  - Product   │     │  - Pricing   │                  │
│  │  - Category  │     │  - Catalog   │                  │
│  └──────────────┘     └──────────────┘                  │
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │  Value Objs  │ ←→  │  Repositories│ (interfaces)     │
│  │  - Price     │     │  - IProduct  │                  │
│  │  - ImageUrl  │     │  - ICategory │                  │
│  └──────────────┘     └──────────────┘                  │
└────────────────────┬─────────────────────────────────────┘
                     │ Implementa
                     ↓
┌──────────────────────────────────────────────────────────┐
│                  INFRAESTRUCTURA                         │
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │  Supabase    │     │  Storage     │                  │
│  │  Repository  │     │  (Imágenes)  │                  │
│  └──────────────┘     └──────────────┘                  │
│                                                          │
│  ┌──────────────┐     ┌──────────────┐                  │
│  │  External    │     │  Database    │                  │
│  │  APIs        │     │  (PostgreSQL)│                  │
│  └──────────────┘     └──────────────┘                  │
└──────────────────────────────────────────────────────────┘
```

---

## 💻 Ejemplos de Uso

### 1. Obtener Productos (Server Component)

```typescript
// app/product/[id]/page.tsx
import { SupabaseProductRepository } from '@/infrastructure'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const repository = SupabaseProductRepository.forServer()
  const product = await repository.findById(params.id)

  if (!product) {
    return <div>Producto no encontrado</div>
  }

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.price.toString()}</p>
    </div>
  )
}
```

### 2. Crear Producto (Command)

```typescript
// application/commands/create-product.command.ts
import { Product, ProductFactory, IProductRepository } from '@/domains'

export class CreateProductCommand {
  constructor(
    private readonly productRepo: IProductRepository
  ) {}

  async execute(data: {
    name: string
    price: number
    categoryId: string
    imageUrl?: string
  }): Promise<Product> {
    const product = ProductFactory.create({
      id: crypto.randomUUID(),
      name: data.name,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
    })

    return await this.productRepo.create(product)
  }
}
```

### 3. Comparar Precios (Domain Service)

```typescript
// domains/pricing/entities/knasta-price.ts
import { PriceComparisonService } from '@/domains/pricing'

const originalPrice = Price.create(100000)
const knastaPrice = Price.create(85000)

const comparison = PriceComparisonService.calculateSavings(knastaPrice, originalPrice)

console.log(comparison)
// { savings: 15000, discountPercent: 15, isBetter: true }
```

---

## 🎯 Beneficios de Esta Estructura

### 1. Independencia de Plataforma

```typescript
// ✅ Mismo código para Next.js, Ionic, React Native
import { Product, IProductRepository } from '@/domains'

// Next.js
const products = await repository.findAll()

// Ionic
const products = await repository.findAll()

// React Native
const products = await repository.findAll()
```

### 2. Testabilidad

```typescript
// ✅ Tests sin dependencias de Supabase
describe('Price', () => {
  it('should calculate discount correctly', () => {
    const original = Price.create(100000)
    const discounted = Price.create(85000)
    
    expect(discounted.discountPercent(original)).toBe(15)
  })
})
```

### 3. Evolución del Dominio

```typescript
// ✅ Agregar nuevo dominio no afecta los existentes
src/domains/
├── product/        # Existe
├── catalog/        # Existe
├── pricing/        # Existe
└── orders/         # Nuevo (no rompe nada)
```

---

## 📚 Convenciones de Nombres

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Entidades | Sustantivo | `Product`, `Category` |
| Value Objects | Sustantivo | `Price`, `ImageUrl` |
| Repositorios | `I` + Sustantivo + `Repository` | `IProductRepository` |
| Implementaciones | `Supabase` + Repositorio + `.impl` | `supabase/product-repository.impl.ts` |
| Servicios de Dominio | Sustantivo + `Service` | `PriceComparisonService` |
| Commands | Verbo + Sustantivo + `Command` | `CreateProductCommand` |
| Queries | Verbo + Sustantivo + `Query` | `GetProductsByCategoryQuery` |

---

## 🚀 Migración desde Estructura Anterior

### Antes (Acoplado a Next.js)

```typescript
// app/page.tsx
const { data } = await supabase.from('products').select('*')
```

### Después (DDD)

```typescript
// domains/product/services/product-service.ts
const products = await this.productRepo.findAll()
```

### Pasos de Migración

1. ✅ Crear estructura `src/` con dominios
2. ✅ Mover entidades a `domains/*/entities/`
3. ✅ Crear interfaces de repositorio
4. ✅ Implementar en `infrastructure/`
5. ✅ Actualizar imports en la presentación

---

## 🔗 Recursos

- [Domain-Driven Design Quickly](https://www.oreilly.com/library/view/domain-driven-design-quickly/9781934356029/)
- [Implementing Domain-Driven Design](https://dzone.com/articles/implementing-domain-driven-design)
- [Supabase DDD Example](https://github.com/supabase/supabase/tree/master/examples)

---

## 📝 Checklist para Nuevos Dominios

- [ ] Crear carpeta en `domains/nuevo-dominio/`
- [ ] Definir entidades en `entities/`
- [ ] Crear value objects si aplica
- [ ] Definir interfaz de repositorio
- [ ] Implementar en `infrastructure/supabase/`
- [ ] Crear servicios de dominio si aplica
- [ ] Agregar exports en `domains/index.ts`
- [ ] Escribir tests unitarios
- [ ] Documentar en `docs/`

---

**Última actualización:** Marzo 2026  
**Autor:** EcoCupon Dev Team
