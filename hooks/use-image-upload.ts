"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
}

export interface UploadProgress {
  progress: number
  uploading: boolean
  error: string | null
}

/**
 * Hook para upload de imágenes a Supabase Storage
 * - Límite: 10 uploads por día
 * - Máximo 5MB por archivo
 * - Formatos: PNG, JPG, JPEG, WEBP, GIF
 */
export function useImageUpload() {
  const [progress, setProgress] = useState<UploadProgress>({
    progress: 0,
    uploading: false,
    error: null,
  })
  const { toast } = useToast()
  const supabase = createClient()

  const uploadImage = useCallback(
    async (file: File, folder: string = "products"): Promise<UploadResult> => {
      // Validaciones iniciales
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!validTypes.includes(file.type)) {
        const error = "Formato no válido. Usa PNG, JPG, JPEG, WEBP o GIF"
        setProgress({ progress: 0, uploading: false, error })
        toast({
          title: "Error de formato",
          description: error,
          variant: "destructive",
        })
        return { success: false, error }
      }

      if (file.size > maxSize) {
        const error = "El archivo supera los 5MB"
        setProgress({ progress: 0, uploading: false, error })
        toast({
          title: "Archivo muy grande",
          description: error,
          variant: "destructive",
        })
        return { success: false, error }
      }

      setProgress({ progress: 0, uploading: true, error: null })

      try {
        // Generar nombre único para el archivo
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 8)
        const extension = file.name.split(".").pop()
        const fileName = `${folder}/${timestamp}-${randomStr}.${extension}`

        // Upload a Supabase Storage
        const { data, error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          })

        if (error) {
          // Manejar error de límite de uploads
          if (error.message.includes("Límite de uploads diarios")) {
            setProgress({ progress: 0, uploading: false, error: error.message })
            toast({
              title: "Límite alcanzado",
              description: "Has alcanzado el límite de 10 uploads por día. Intenta mañana.",
              variant: "destructive",
            })
            return { success: false, error: error.message }
          }

          throw error
        }

        // Obtener URL pública
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(fileName)

        setProgress({ progress: 100, uploading: false, error: null })

        toast({
          title: "Imagen subida",
          description: "La imagen se guardó correctamente",
        })

        return {
          success: true,
          url: publicUrl,
          path: data.path,
        }
      } catch (error: any) {
        const errorMessage = error?.message || "Error al subir la imagen"
        setProgress({ progress: 0, uploading: false, error: errorMessage })
        toast({
          title: "Error en upload",
          description: errorMessage,
          variant: "destructive",
        })
        return { success: false, error: errorMessage }
      }
    },
    [supabase.storage, toast],
  )

  const resetProgress = useCallback(() => {
    setProgress({ progress: 0, uploading: false, error: null })
  }, [])

  return {
    uploadImage,
    resetProgress,
    ...progress,
  }
}
