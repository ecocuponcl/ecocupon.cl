# 📸 Implementación de Upload de Imágenes con Supabase Storage

## ✅ Implementación Completada

Se ha implementado un sistema completo de upload de imágenes usando **Supabase Storage** integrado con tu proyecto EcoCupon.

---

## 🎯 Características

| Feature | Descripción |
|---------|-------------|
| **Storage** | Supabase Storage (mismo proveedor que tu DB) |
| **Límite** | 10 uploads por día por usuario |
| **Tamaño máx** | 5MB por archivo |
| **Formatos** | PNG, JPG, JPEG, WEBP, GIF |
| **UI/UX** | Moderno con shadow, animaciones, drag & drop |
| **Tailwind** | ❌ No usado en el uploader (CSS-in-JS inline) |
| **CDN** | ✅ Imágenes servidas desde CDN de Supabase |

---

## 📁 Archivos Creados

### 1. Configuración de Base de Datos
- `scripts/setup-supabase-storage.sql` - Script SQL completo para configurar bucket, políticas RLS, triggers y límites

### 2. Hooks
- `hooks/use-image-upload.ts` - Hook para upload con progress, validaciones y manejo de errores

### 3. Componentes UI
- `components/ui/image-uploader.tsx` - Componente con UI moderna (shadow effects, drag & drop, preview)
- `components/admin/product-form-modal.tsx` - Modal para crear/editar productos con upload
- `components/admin/category-form-modal.tsx` - Modal para crear/editar categorías con upload

### 4. Actualizaciones
- `components/admin/products-table.tsx` - Integrado con modal y botón "Añadir Producto"
- `components/admin/categories-table.tsx` - Integrado con modal y botón "Añadir Categoría"
- `next.config.mjs` - Agregados dominios de Supabase para imágenes y CSP

### 5. Documentación
- `docs/SUPABASE-STORAGE-SETUP.md` - Guía completa de configuración

---

## 🚀 Pasos para Activar

### Paso 1: Ejecutar Script SQL en Supabase

1. Abre tu proyecto: https://uyxvzztnsvfcqmgkrnol.supabase.co
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `scripts/setup-supabase-storage.sql`
4. Click en **Run**

### Paso 2: Probar en el Admin

1. Inicia la app: `pnpm dev`
2. Ve a `/admin`
3. Click en **"Añadir Producto"**
4. Arrastra una imagen o haz click para subir
5. Completa los datos y guarda

---

## 🎨 UI/UX del ImageUploader

El componente usa **CSS-in-JS inline** (sin Tailwind) con:

- ✨ **Shadow effects**: Sombras suaves que reaccionan al hover/drag
- 🎯 **Drag & Drop**: Arrastra imágenes directamente
- 📊 **Progress bar**: Animación de progreso durante el upload
- 🖼️ **Preview**: Vista previa de la imagen cargada
- 🔄 **Loading state**: Spinner durante la subida
- ⚠️ **Error handling**: Mensajes de error claros
- 📱 **Responsive**: Funciona en móvil y desktop

---

## 🔧 Uso del Componente

### En un Formulario

```tsx
import { ImageUploader } from "@/components/ui/image-uploader"

function MiFormulario() {
  const [imageUrl, setImageUrl] = useState("")

  return (
    <ImageUploader 
      value={imageUrl} 
      onChange={setImageUrl} 
      folder="products"  // o "categories"
    />
  )
}
```

### Usando el Hook Directamente

```tsx
import { useImageUpload } from "@/hooks/use-image-upload"

function MiComponente() {
  const { uploadImage, uploading, progress, error } = useImageUpload()

  const handleFile = async (file: File) => {
    const result = await uploadImage(file, "products")
    if (result.success) {
      console.log("Imagen URL:", result.url)
    }
  }
}
```

---

## 📊 URLs de Imágenes

Las imágenes se guardan con URLs públicas:

```
https://uyxvzztnsvfcqmgkrnol.supabase.co/storage/v1/object/public/product-images/products/1711234567890-abc123.jpg
```

Esta URL es la que se guarda en el campo `image` de la base de datos.

---

## 🔒 Seguridad Implementada

| Protección | Descripción |
|------------|-------------|
| **Auth** | Solo usuarios autenticados pueden subir |
| **Límite diario** | 10 uploads por día (reset cada 24h) |
| **Tamaño** | Máximo 5MB validado antes del upload |
| **Tipos** | Solo imágenes (PNG, JPG, WEBP, GIF) |
| **RLS** | Políticas de Row Level Security activas |
| **Triggers** | Tracking automático de uploads |

---

## 🧪 Testing Rápido

```bash
# 1. Inicia el servidor de desarrollo
pnpm dev

# 2. Abre http://localhost:3000/admin

# 3. Prueba:
#    - Click en "Añadir Producto"
#    - Sube una imagen (drag o click)
#    - Completa nombre, precio, categoría
#    - Guarda
#    - Verifica que la imagen se muestra en la lista
```

---

## 📝 Notas Importantes

1. **Límite de 10/día**: Se resetea automáticamente cada 24 horas
2. **Imágenes huérfanas**: Al borrar un producto, la imagen NO se borra del storage (considera implementar cleanup manual)
3. **Producción**: El límite puede ajustarse modificando la función `check_upload_limit()` en el SQL

---

## 🆘 Solución de Problemas

### Error: "Límite de uploads diarios alcanzado"
```sql
-- Reset manual (solo desarrollo)
DELETE FROM upload_tracking WHERE user_id = 'tu-user-id';
```

### Error: "Bucket no encontrado"
- Ejecuta el script SQL en Supabase
- O crea el bucket manualmente desde Storage > New Bucket

### Error: "Permisos insuficientes"
- Verifica que las políticas RLS estén aplicadas
- Asegúrate de estar autenticado como admin

---

## 📚 Estructura de Carpetas

```
/Users/mac/dev/2026/ecocanasta.ecocupon.cl/
├── scripts/
│   └── setup-supabase-storage.sql    # ← Ejecutar este primero
├── hooks/
│   └── use-image-upload.ts           # Hook principal
├── components/
│   ├── ui/
│   │   └── image-uploader.tsx        # Componente UI
│   └── admin/
│       ├── product-form-modal.tsx    # Modal productos
│       └── category-form-modal.tsx   # Modal categorías
├── docs/
│   └── SUPABASE-STORAGE-SETUP.md     # Documentación completa
└── next.config.mjs                   # Actualizado con dominios
```

---

## ✨ Resumen

| Antes | Ahora |
|-------|-------|
| Imágenes con placeholder | Imágenes reales subidas por admin |
| URLs manuales | Upload automático con drag & drop |
| Sin validación | Límite 10/día + 5MB máx |
| Tailwind para todo | CSS-in-JS para UI personalizado |

**¡Todo listo para usar! 🎉**
