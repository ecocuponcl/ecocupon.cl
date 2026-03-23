-- ============================================
-- SETUP SUPABASE STORAGE PARA ECOCUPOON.CL
-- ============================================
-- Cliente: EcoCupon / Smarter SpA
-- Configuración: Bucket 'product-images' + Límite 10/día
-- ============================================

-- 1. Crear bucket para imágenes de productos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB límite
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Crear tabla para tracking de uploads (Si ya existe, no hace nada)
CREATE TABLE IF NOT EXISTS upload_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL
);

-- 3. ÍNDICE CORREGIDO (Error 42P17 solucionado)
-- Indexamos la columna directamente para que sea eficiente en búsquedas de rango temporal
CREATE INDEX IF NOT EXISTS idx_upload_tracking_user_date 
ON upload_tracking(user_id, uploaded_at);

-- 4. Habilitar RLS
ALTER TABLE upload_tracking ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para la tabla de tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own uploads') THEN
        CREATE POLICY "Users can view own uploads" ON upload_tracking FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own uploads') THEN
        CREATE POLICY "Users can insert own uploads" ON upload_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 6. Políticas RLS para el bucket 'product-images'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload images') THEN
        CREATE POLICY "Authenticated users can upload images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view images') THEN
        CREATE POLICY "Public can view images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete images') THEN
        CREATE POLICY "Authenticated users can delete images" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- 7. Función para verificar límite (10 en 24h)
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
    RAISE EXCEPTION 'Límite de uploads diarios alcanzado (10/día) para EcoCupon. Intenta mañana.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger de validación (Antes de subir)
DROP TRIGGER IF EXISTS enforce_upload_limit ON storage.objects;
CREATE TRIGGER enforce_upload_limit
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'product-images')
  EXECUTE FUNCTION check_upload_limit();

-- 9. Función para registrar el upload (Post-procesamiento)
-- Corregido: Casteo de metadata->>'size' a INTEGER
CREATE OR REPLACE FUNCTION record_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO upload_tracking (user_id, file_path, file_size)
  VALUES (
    auth.uid(), 
    NEW.name, 
    COALESCE((NEW.metadata->>'size')::INTEGER, 0)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Trigger de registro (Después de subir)
DROP TRIGGER IF EXISTS track_upload ON storage.objects;
CREATE TRIGGER track_upload
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  WHEN (NEW.bucket_id = 'product-images')
  EXECUTE FUNCTION record_upload();

-- 11. Helper para obtener URL
CREATE OR REPLACE FUNCTION get_image_url(file_path TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Reemplaza 'tu-proyecto' por tu subdominio real si es necesario, 
  -- o usa la ruta relativa del storage de Supabase
  RETURN '/storage/v1/object/public/product-images/' || file_path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. Verifica en Storage > product-images que las políticas estén activas
-- 3. Prueba subir una imagen desde el admin (/admin)
-- ============================================
