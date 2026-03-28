import { NextRequest, NextResponse } from "next/server"
import { validatePlate } from "@/lib/validators/plate.validator"
import { createClient } from "@/lib/supabase/server"

export interface PlateValidationResponse {
  success: boolean
  valid: boolean
  format?: string
  normalized?: string
  error?: string
  remaining?: number
  message: string
}

const DAILY_LIMIT = 10

/**
 * POST /api/plate
 * Valida una placa patente chilena
 * 
 * Body: { plate: string }
 * Response: PlateValidationResponse
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plate } = body

    if (!plate || typeof plate !== 'string') {
      return NextResponse.json<PlateValidationResponse>({
        success: false,
        valid: false,
        message: 'La placa patente es requerida',
        error: 'PLATE_REQUIRED'
      }, { status: 400 })
    }

    // Get user from session
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // Allow validation without auth but don't track limits
      const validation = validatePlate(plate)

      return NextResponse.json<PlateValidationResponse>({
        success: validation.valid,
        valid: validation.valid,
        format: validation.format !== 'unknown' ? validation.format : undefined,
        normalized: validation.valid ? validation.normalized : undefined,
        error: validation.error,
        message: validation.valid 
          ? 'Placa válida' 
          : validation.error || 'Formato inválido'
      })
    }

    // Check daily limit for authenticated users
    const today = new Date().toISOString().split('T')[0]

    const { count, error: countError } = await supabase
      .from('plate_detection_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today)

    if (countError) {
      console.error('Error checking daily limit:', countError)
    }

    const used = count || 0
    if (used >= DAILY_LIMIT) {
      return NextResponse.json<PlateValidationResponse>({
        success: false,
        valid: false,
        message: 'Límite de 10 placas alcanzado por hoy. Intenta mañana.',
        error: 'DAILY_LIMIT_REACHED',
        remaining: 0
      }, { status: 429 })
    }

    // Validate plate format
    const validation = validatePlate(plate)

    if (!validation.valid) {
      return NextResponse.json<PlateValidationResponse>({
        success: false,
        valid: false,
        message: validation.error || 'Formato de placa inválido',
        error: 'INVALID_FORMAT',
        remaining: DAILY_LIMIT - used
      }, { status: 400 })
    }

    // Log the detection
    const { error: logError } = await supabase
      .from('plate_detection_logs')
      .insert({
        user_id: user.id,
        detected_plate: validation.normalized,
        original_input: plate,
        confidence: 100,
        status: 'success',
        api_response: { format: validation.format }
      })

    if (logError) {
      console.error('Error logging detection:', logError)
    }

    return NextResponse.json<PlateValidationResponse>({
      success: true,
      valid: true,
      format: validation.format,
      normalized: validation.normalized,
      message: 'Placa validada correctamente',
      remaining: DAILY_LIMIT - used - 1
    })

  } catch (error) {
    console.error('Plate validation API error:', error)
    return NextResponse.json<PlateValidationResponse>({
      success: false,
      valid: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    }, { status: 500 })
  }
}
