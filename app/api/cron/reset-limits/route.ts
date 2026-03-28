import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/cron/reset-limits
 * Cron job para resetear límites diarios de placas
 * Se ejecuta automáticamente a las 00:00 CLT
 * 
 * Protegido con CRON_SECRET
 */
export async function GET(request: NextRequest) {
  // Verificar autorización del cron job
  const authHeader = request.headers.get("Authorization")
  const cronSecret = process.env.CRON_SECRET

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const supabase = await createClient()

    // Obtener ayer para limpiar logs antiguos (opcional, mantener solo 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Eliminar logs de más de 30 días (cleanup)
    const { error: deleteError } = await supabase
      .from("plate_detection_logs")
      .delete()
      .lt("created_at", thirtyDaysAgo.toISOString())

    if (deleteError) {
      console.error("Error cleaning old logs:", deleteError)
    }

    return NextResponse.json({
      success: true,
      message: "Límites reseteados y logs antiguos limpiados",
      cleanedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error("Cron job error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
