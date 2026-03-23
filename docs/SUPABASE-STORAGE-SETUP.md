# Configuración de Supabase Storage para Imágenes

Este documento describe cómo configurar el almacenamiento de imágenes en Supabase para EcoCupon.

## 📋 Resumen

- **Storage**: Supabase Storage (integrado con tu proyecto actual)
- **Límite**: 10 uploads por día por usuario
- **Tamaño máximo**: 5MB por archivo
- **Formatos soportados**: PNG, JPG, JPEG, WEBP, GIF
- **Bucket**: `product-images` (público para lectura)

## 🚀 Pasos de Configuración

### 1. Ejecutar el Script SQL

1. Ve a tu proyecto en Supabase: https://uyxvzztnsvfcqmgkrnol.supabase.co
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `scripts/setup-supabase-storage.sql`
4. Ejecuta el script

**O desde la CLI:**
```bash
supabase db execute --file scripts/setup-supabase-storage.sql
```

### 2. Crear el Bucket desde la UI (Alternativo)

Si prefieres crear el bucket manualmente:

1. Ve a **Storage** en el dashboard de Supabase
2. Click en **New bucket**
3. Configura:
   - **Name**: `product-images`
   - **Public**: ✅ Sí
   - **File size limit**: `5242880` (5MB)
   - **Allowed MIME types**: 
     - `image/png`
     - `image/jpeg`
     - `image/jpg`
     - `image/webp`
     - `image/gif`

### 3. Configurar Políticas RLS

Después de crear el bucket, configura las políticas:

1. Ve a **Storage** > `product-images` > **Policies**
2. Click en **New policy** para cada una:

#### Política de Upload (INSERT)
```sql
CREATE POLICY "Authenticated users can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

#### Política de Lectura (SELECT)
```sql
CREATE POLICY "Public can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-images');
```

#### Política de Delete (DELETE)
```sql
CREATE POLICY "Authenticated users can delete images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

### 4. Crear Tabla de Tracking

Para el límite de 10 uploads/día:

```sql
-- Tabla de tracking
CREATE TABLE IF NOT EXISTS upload_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL
);

-- Índice para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_upload_tracking_user_date 
ON upload_tracking(user_id, DATE(uploaded_at));

-- Habilitar RLS
ALTER TABLE upload_tracking ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view own uploads"
ON upload_tracking FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own uploads"
ON upload_tracking FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 5. Funciones y Triggers para Límite

```sql
-- Función para verificar límite
CREATE OR REPLACE FUNCTION check_upload_limit()
RETURNS TRIGGER AS $$
DECLARE
  upload_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO upload_count
  FROM upload_tracking
  WHERE user_id = auth.uid()
    AND uploaded_at >= NOW() - INTERVAL '24 hours';
  
  IF upload_count >= 10 THEN
    RAISE EXCEPTION 'Límite de uploads diarios alcanzado (10/día). Intenta mañana.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS enforce_upload_limit ON storage.objects;
CREATE TRIGGER enforce_upload_limit
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'product-images')
  EXECUTE FUNCTION check_upload_limit();

-- Función para registrar upload
CREATE OR REPLACE FUNCTION record_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO upload_tracking (user_id, file_path, file_size)
  VALUES (auth.uid(), NEW.path, NEW.metadata->>'size');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger de registro
DROP TRIGGER IF EXISTS track_upload ON storage.objects;
CREATE TRIGGER track_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'product-images')
  EXECUTE FUNCTION record_upload();
```

## 🎨 Uso en la Aplicación

### Componente ImageUploader

```tsx
import { ImageUploader } from "@/components/ui/image-uploader"

function MyForm() {
  const [imageUrl, setImageUrl] = useState("")

  return (
    <ImageUploader 
      value={imageUrl} 
      onChange={setImageUrl} 
      folder="products"
    />
  )
}
```

### Hook useImageUpload

```tsx
import { useImageUpload } from "@/hooks/use-image-upload"

function MyComponent() {
  const { uploadImage, uploading, progress, error } = useImageUpload()

  const handleUpload = async (file: File) => {
    const result = await uploadImage(file, "products")
    if (result.success) {
      console.log("URL:", result.url)
    }
  }

  return (
    // tu UI
  )
}
```

## 📊 URLs de las Imágenes

Las imágenes se almacenan con URLs públicas:

```
https://uyxvzztnsvfcqmgkrnol.supabase.co/storage/v1/object/public/product-images/products/1234567890-abc123.jpg
```

El componente `ImageUploader` devuelve la URL completa lista para guardar en la base de datos.

## 🔒 Seguridad

- ✅ Solo usuarios autenticados pueden subir imágenes
- ✅ Límite de 10 uploads por día por usuario
- ✅ Máximo 5MB por archivo
- ✅ Validación de tipos de archivo
- ✅ Imágenes públicas (lectura)
- ✅ RLS configurado para protección

## 🧪 Testing

1. Inicia sesión como admin en `/admin`
2. Click en "Añadir Producto"
3. Sube una imagen (drag & drop o click)
4. Completa los datos y guarda
5. Verifica que la imagen se muestra en la lista

## 📝 Notas

- El límite de 10 uploads/día se reinicia cada 24 horas
- Las imágenes no se eliminan automáticamente de Supabase Storage al borrar un producto
- Para producción, considera implementar un cron job para limpiar imágenes huérfanas

## 🆘 Solución de Problemas

### Error: "Límite de uploads diarios alcanzado"
- Espera 24 horas o elimina el tracking manualmente:
```sql
DELETE FROM upload_tracking WHERE user_id = 'tu-user-id';
```

### Error: "Bucket no encontrado"
- Asegúrate de haber ejecutado el script SQL
- Verifica que el bucket existe en Storage

### Error: "Permisos insuficientes"
- Verifica que las políticas RLS estén configuradas
- Asegúrate de estar autenticado

## 📚 Archivos Relacionados

- `scripts/setup-supabase-storage.sql` - Script SQL completo
- `hooks/use-image-upload.ts` - Hook para upload
- `components/ui/image-uploader.tsx` - Componente UI
- `components/admin/product-form-modal.tsx` - Formulario con upload
- `components/admin/category-form-modal.tsx` - Formulario categorías
