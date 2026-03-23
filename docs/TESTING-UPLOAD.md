# 🧪 Testing de Upload de Imágenes

## ✅ Checklist de Verificación

### 1. Bucket Creado
- [x] Bucket `product-images` existe en Supabase Storage
- [x] Bucket es público
- [x] Límite de 5MB configurado

### 2. Políticas RLS
- [x] Insert para autenticados
- [x] Select público
- [x] Delete para autenticados

### 3. Triggers y Funciones
- [x] `check_upload_limit()` - Verifica 10/día
- [x] `record_upload()` - Registra uploads
- [x] `upload_tracking` tabla creada

### 4. Frontend
- [x] `hooks/use-image-upload.ts` - Hook funcional
- [x] `components/ui/image-uploader.tsx` - UI con drag&drop
- [x] `components/admin/product-form-modal.tsx` - Modal integrado
- [x] `components/admin/category-form-modal.tsx` - Modal integrado
- [x] `next.config.mjs` - Dominios de Supabase agregados

---

## 🔍 Pruebas Manuales

### Test 1: Upload Básico
```
1. Ve a http://localhost:3000/admin
2. Click en "Añadir Producto"
3. Arrastra una imagen PNG/JPG (< 5MB)
4. Verifica que:
   - [ ] La imagen se muestra en preview
   - [ ] Progress bar llega a 100%
   - [ ] Toast de éxito aparece
   - [ ] URL se muestra debajo del uploader
```

### Test 2: Validación de Formato
```
1. Intenta subir un archivo .txt o .pdf
2. Verifica que:
   - [ ] Error: "Formato no válido. Usa PNG, JPG, JPEG, WEBP o GIF"
   - [ ] Upload no se ejecuta
```

### Test 3: Validación de Tamaño
```
1. Intenta subir una imagen > 5MB
2. Verifica que:
   - [ ] Error: "El archivo supera los 5MB"
   - [ ] Upload no se ejecuta
```

### Test 4: Límite de 10/día
```
1. Sube 10 imágenes seguidas
2. En el intento 11, verifica que:
   - [ ] Error: "Límite de uploads diarios alcanzado (10/día) para EcoCupon"
   - [ ] Toast de error aparece
```

### Test 5: Guardado en Producto
```
1. Sube una imagen en el formulario
2. Completa nombre, precio, categoría
3. Guarda el producto
4. Verifica que:
   - [ ] Producto se guarda en DB
   - [ ] Campo `image` tiene la URL de Supabase
   - [ ] La imagen se muestra en la tabla de productos
```

### Test 6: URL Pública
```
1. Copia la URL de una imagen subida
2. Ábrela en una nueva pestaña
3. Verifica que:
   - [ ] La imagen carga sin autenticación
   - [ ] URL formato: https://uyxvzztnsvfcqmgkrnol.supabase.co/storage/v1/object/public/product-images/...
```

---

## 🐛 Debugging

### Ver uploads del usuario
```sql
SELECT * FROM upload_tracking 
WHERE user_id = auth.uid() 
ORDER BY uploaded_at DESC;
```

### Verificar conteo de uploads hoy
```sql
SELECT COUNT(*) as uploads_hoy
FROM upload_tracking
WHERE user_id = auth.uid()
  AND uploaded_at >= NOW() - INTERVAL '24 hours';
```

### Reset manual del límite (solo dev)
```sql
DELETE FROM upload_tracking 
WHERE user_id = 'TU-USER-ID-AQUI';
```

### Verificar políticas del bucket
```sql
SELECT * FROM storage.policies 
WHERE bucket_id = 'product-images';
```

### Verificar bucket existe
```sql
SELECT * FROM storage.buckets 
WHERE id = 'product-images';
```

---

## 📊 URLs de Test

| Endpoint | Descripción |
|----------|-------------|
| `/admin` | Panel de administración |
| `/admin` > Añadir Producto | Formulario con upload |
| `/admin` > Añadir Categoría | Formulario con upload |

---

## ✅ Criterios de Aceptación

- [ ] Upload de imágenes funciona en productos
- [ ] Upload de imágenes funciona en categorías
- [ ] Drag & drop funciona
- [ ] Preview de imagen se muestra
- [ ] Progress bar animado
- [ ] Validación de formatos (PNG, JPG, WEBP, GIF)
- [ ] Validación de tamaño (5MB máx)
- [ ] Límite de 10/día funciona
- [ ] URLs públicas accesibles
- [ ] Imágenes se guardan en DB
- [ ] Error handling adecuado
- [ ] Toast notifications funcionan

---

## 🎯 Estado Actual

**Bucket**: ✅ Creado exitosamente  
**SQL**: ✅ Ejecutado sin errores  
**Frontend**: ✅ Componentes integrados  
**Testing**: ⏳ Pendiente de pruebas manuales

**Próximo paso**: Inicia el servidor y prueba en `/admin`

```bash
pnpm dev
# Abre http://localhost:3000/admin
```
