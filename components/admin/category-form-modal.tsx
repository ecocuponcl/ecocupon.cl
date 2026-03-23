"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUploader } from "@/components/ui/image-uploader"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/database.types"

type Category = Database["public"]["Tables"]["categories"]["Row"]

interface CategoryFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category | null
  onSuccess?: () => void
}

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
  onSuccess,
}: CategoryFormModalProps) {
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const { toast } = useToast()
  const supabase = createClient()

  const isEditing = !!category

  // Cargar datos de la categoría
  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name)
        setSlug(category.slug)
        setDescription(category.description || "")
        setImageUrl(category.image || "")
      } else {
        resetForm()
      }
    }
  }, [open, category])

  // Generar slug automático desde el nombre
  useEffect(() => {
    if (!category && name) {
      const generatedSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
      setSlug(generatedSlug)
    }
  }, [name, category])

  function resetForm() {
    setName("")
    setSlug("")
    setDescription("")
    setImageUrl("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Validaciones
      if (!name.trim()) {
        throw new Error("El nombre es requerido")
      }
      if (!slug.trim()) {
        throw new Error("El slug es requerido")
      }

      const categoryData = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || null,
        image: imageUrl || null,
      }

      let error

      if (isEditing && category) {
        // Actualizar categoría
        const { error: updateError } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", category.id)
        error = updateError
      } else {
        // Crear categoría
        const { error: insertError } = await supabase.from("categories").insert([categoryData])
        error = insertError
      }

      if (error) throw error

      toast({
        title: isEditing ? "Categoría actualizada" : "Categoría creada",
        description: isEditing
          ? "La categoría se actualizó correctamente"
          : "La categoría se creó correctamente",
      })

      resetForm()
      onSuccess?.()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: error?.message || "No se pudo guardar la categoría",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica la información de la categoría"
              : "Completa los datos para crear una nueva categoría"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Imagen de la categoría */}
            <div className="space-y-2">
              <Label>Imagen de la categoría</Label>
              <ImageUploader value={imageUrl} onChange={setImageUrl} folder="categories" />
              {imageUrl && (
                <p className="text-xs text-muted-foreground break-all">URL: {imageUrl}</p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Tecnología"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="ej: tecnologia"
                required
              />
              <p className="text-xs text-muted-foreground">
                Identificador único en minúsculas, sin espacios ni caracteres especiales
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la categoría..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? isEditing
                  ? "Actualizando..."
                  : "Creando..."
                : isEditing
                ? "Actualizar"
                : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
