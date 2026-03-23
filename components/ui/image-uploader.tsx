"use client"

import { useState, useRef, useCallback } from "react"
import { useImageUpload } from "@/hooks/use-image-upload"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  maxSize?: number
}

/**
 * Componente ImageUploader con UI/UX moderno
 * - Shadow y efectos visuales con CSS inline
 * - CDN de imágenes optimizado
 * - Sin dependencias de Tailwind para estilos custom
 * - Drag & drop + click para upload
 * - Preview de imagen
 * - Progress bar animado
 */
export function ImageUploader({
  value,
  onChange,
  folder = "products",
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif",
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string>(value || "")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadImage, uploading, progress, error, resetProgress } = useImageUpload()

  // Manejar selección de archivo
  const handleFileSelect = useCallback(
    async (file: File) => {
      const result = await uploadImage(file, folder)
      if (result.success && result.url) {
        setPreview(result.url)
        onChange(result.url)
        resetProgress()
      }
    },
    [uploadImage, folder, onChange, resetProgress],
  )

  // Manejar input change
  const onFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        await handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  // Manejar drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        await handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  // Eliminar imagen
  const handleRemove = useCallback(() => {
    setPreview("")
    onChange("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    resetProgress()
  }, [onChange, resetProgress])

  // Abrir selector de archivos
  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Estilos CSS-in-JS para UI moderno con shadow
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      position: "relative",
      width: "100%",
      maxWidth: "400px",
    },
    dropzone: {
      position: "relative",
      width: "100%",
      minHeight: "200px",
      borderRadius: "16px",
      border: `2px dashed ${isDragging ? "#3b82f6" : "#e2e8f0"}`,
      backgroundColor: isDragging ? "rgba(59, 130, 246, 0.05)" : "#f8fafc",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      cursor: "pointer",
      overflow: "hidden",
      boxShadow: isDragging
        ? "0 20px 50px rgba(59, 130, 246, 0.2), 0 0 0 4px rgba(59, 130, 246, 0.1)"
        : "0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
    },
    previewContainer: {
      position: "relative",
      width: "100%",
      height: "200px",
      overflow: "hidden",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      transition: "transform 0.3s ease",
    },
    removeButton: {
      position: "absolute",
      top: "8px",
      right: "8px",
      width: "32px",
      height: "32px",
      borderRadius: "50%",
      border: "none",
      backgroundColor: "rgba(239, 68, 68, 0.95)",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s ease",
      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)",
      backdropFilter: "blur(8px)",
    },
    uploadContent: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "200px",
      gap: "12px",
      color: "#64748b",
    },
    uploadIcon: {
      width: "48px",
      height: "48px",
      color: isDragging ? "#3b82f6" : "#94a3b8",
      transition: "color 0.3s ease",
    },
    uploadText: {
      fontSize: "14px",
      fontWeight: "500",
      color: isDragging ? "#3b82f6" : "#475569",
      textAlign: "center",
    },
    uploadSubtext: {
      fontSize: "12px",
      color: "#94a3b8",
      textAlign: "center",
    },
    progressBar: {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "4px",
      backgroundColor: "#e2e8f0",
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      width: `${progress}%`,
      backgroundColor: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
      transition: "width 0.3s ease",
      borderRadius: "2px",
    },
    errorContainer: {
      marginTop: "8px",
      padding: "8px 12px",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "8px",
      color: "#dc2626",
      fontSize: "13px",
    },
    loadingOverlay: {
      position: "absolute",
      inset: "0",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backdropFilter: "blur(4px)",
    },
  }

  return (
    <div style={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={onFileInputChange}
        style={{ display: "none" }}
        disabled={uploading}
      />

      <div
        style={styles.dropzone}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {preview ? (
          <div style={styles.previewContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Preview"
              style={styles.previewImage}
              onLoad={(e) => {
                const target = e.target as HTMLImageElement
                target.style.transform = "scale(1)"
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleRemove()
              }}
              style={styles.removeButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.1)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)"
              }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div style={styles.uploadContent}>
            <Upload style={styles.uploadIcon} />
            <div style={styles.uploadText}>
              {isDragging ? "Suelta la imagen aquí" : "Arrastra una imagen o haz click"}
            </div>
            <div style={styles.uploadSubtext}>PNG, JPG, WEBP, GIF (máx 5MB)</div>
          </div>
        )}

        {uploading && (
          <div style={styles.loadingOverlay}>
            <Loader2 className="animate-spin" size={32} color="#3b82f6" />
          </div>
        )}

        {uploading && progress < 100 && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
        )}
      </div>

      {error && <div style={styles.errorContainer}>{error}</div>}
    </div>
  )
}
