# 🔄 Guía de Migración a DDD

## Estado Actual

La migración a DDD está **completada en un 80%**. La nueva arquitectura está implementada y funcional, pero algunos componentes aún están en transición.

---

## ✅ Completado

### 1. Estructura DDD
- [x] Dominios definidos (Product, Catalog, Pricing)
- [x] Entidades con lógica de negocio
- [x] Value Objects (Price, ImageUrl, CategorySlug)
- [x] Repositorios (interfaces + implementaciones)
- [x] Application Services
- [x] Shared Kernel

### 2. Servicios de Aplicación
```typescript
// src/application/services/
- catalog.service.ts    ✅ Listo
- product.service.ts    ✅ Listo
```

### 3. Infraestructura
```typescript
// src/infrastructure/supabase/
- product-repository.impl.ts   ✅ Listo
- category-repository.impl.ts  ✅ Listo
```

---

## ⚠️ En Progreso

### Pages Migradas (con ajustes pendientes)

| Página | Estado | Notas |
|--------|--------|-------|
| `app/page.tsx` | 🟡 Parcial | Usa CatalogService pero tipos difieren |
| `app/product/[id]/page.tsx` | 🟡 Parcial | Usa ProductService pero necesita ajustes |
| `app/category/[slug]/page.tsx` | 🟡 Parcial | Usa CatalogService pero tipos difieren |

### Admin Components

| Componente | Estado | Notas |
|------------|--------|-------|
| `components/admin/products-table.tsx` | 🟡 Parcial | Usa repository pero tipos difieren |
| `components/admin/categories-table.tsx` | 🟡 Parcial | Usa repository pero tipos difieren |

---

## 🔧 Cómo Usar la Nueva Estructura

### 1. Server Components (Next.js)

```typescript
// app/ejemplo/page.tsx
import { CatalogService } from '@/application'

export default async function EjemploPage() {
  const catalog = new CatalogService()
  const products = await catalog.getHomeProducts(20)
  
  return (
    <div>
      {products.data.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

### 2. Client Components (React Hooks)

```typescript
// components/ejemplo.tsx
"use client"

import { SupabaseProductRepository } from '@/infrastructure'
import { useEffect, useState } from 'react'

export function Ejemplo() {
  const [products, setProducts] = useState([])
  const repo = SupabaseProductRepository.forBrowser()

  useEffect(() => {
    repo.findAll({ limit: 10 }).then(result => {
      setProducts(result.data)
    })
  }, [])

  return <div>...</div>
}
```

### 3. Usar Domain Services

```typescript
import { PriceComparisonService } from '@/domains/pricing'

const originalPrice = { value: 100000, currency: 'CLP' }
const knastaPrice = { value: 85000, currency: 'CLP' }

const comparison = PriceComparisonService.calculateSavings(
  knastaPrice,
  originalPrice
)

console.log(comparison)
// { savings: 15000, discountPercent: 15, isBetter: true }
```

---

## 📝 Ajustes Pendientes

### Problema: Tipos de Entidades vs Supabase

Las entidades DDD tienen una estructura diferente:

**Supabase (antes):**
```typescript
type Product = {
  id: string
  name: string
  price: number
  image: string | null
  category_id: string | null
  knasta_prices?: { price: number }[]
  categories?: { name: string }
}
```

**DDD (ahora):**
```typescript
interface Product {
  id: string
  name: string
  price: Price  // Value Object
  imageUrl: string | null
  categoryId: string | null
  createdAt: Date
  updatedAt: Date
  // knasta_prices y categories vienen de joins
}
```

### Solución Temporal

Mientras se completan los ajustes, puedes:

1. **Usar los tipos de Supabase directamente** para datos complejos:
```typescript
import type { Database } from '@/lib/database.types'

type ProductWithRelations = Database['public']['Tables']['products']['Row'] & {
  knasta_prices: { price: number }[]
  categories: { name: string }
}
```

2. **O crear tipos híbridos** que combinen DDD y Supabase:
```typescript
import type { Product } from '@/domains/product'

type ProductUI = Product & {
  knasta_prices?: { price: number }[]
  categories?: { name: string }
}
```

---

## 🎯 Próximos Pasos

### 1. Completar Migración de Tipos

- [ ] Actualizar entidades DDD para incluir relaciones (knasta_prices, categories)
- [ ] O crear tipos UI específicos que extiendan entidades DDD

### 2. Refactorizar Components

- [ ] Actualizar HomePage para manejar tipos DDD correctamente
- [ ] Actualizar ProductPage para usar Price value object
- [ ] Actualizar CategoryPage para manejar tipos DDD

### 3. Agregar Tests

- [ ] Tests unitarios para entidades (Price, Product)
- [ ] Tests de integración para repositorios
- [ ] Tests E2E para flujos críticos

---

## 📚 Recursos

### Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `src/domains/product/entities/product.ts` | Entidad Product + Price + ImageUrl |
| `src/domains/catalog/entities/category.ts` | Entidad Category |
| `src/domains/pricing/entities/knasta-price.ts` | Entidad KnastaPrice + PriceComparisonService |
| `src/application/services/catalog.service.ts` | Casos de uso de catálogo |
| `src/application/services/product.service.ts` | Casos de uso de productos |
| `src/infrastructure/supabase/` | Implementaciones de repositorios |

### Imports Comunes

```typescript
// Desde el índice principal
import { Product, Price, SupabaseProductRepository } from '@/ddd'

// Por dominio
import { Product } from '@/domains/product'
import { CatalogService } from '@/application'
import { SupabaseProductRepository } from '@/infrastructure'
```

---

## ✅ Checklist para Nueva Funcionalidad

Cuando agregues una nueva feature:

- [ ] ¿La lógica de negocio va en una entidad o domain service?
- [ ] ¿Necesitas un nuevo caso de uso en application services?
- [ ] ¿El repositorio ya existe o necesitas crear uno nuevo?
- [ ] ¿Los tipos están definidos en el dominio correcto?
- [ ] ¿Estás usando los value objects (Price, ImageUrl)?

---

**Última actualización:** Marzo 2026  
**Estado:** Migración en progreso (80% completado)
