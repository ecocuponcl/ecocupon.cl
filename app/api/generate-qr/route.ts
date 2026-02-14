import { NextRequest, NextResponse } from "next/server"

const NOCODE_API_URL = "https://v1.nocodeapi.com/ecocupon/qrCode/CMcuxKjFowzJykHM/dataurl"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.id || !body.material || !body.location || !body.contact) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    const sanitized = {
      id: String(body.id).slice(0, 50),
      material: String(body.material).slice(0, 30),
      location: String(body.location).slice(0, 100),
      contact: String(body.contact).slice(0, 50),
      created: String(body.created || new Date().toISOString()),
      notes: body.notes ? String(body.notes).slice(0, 200) : undefined,
    }

    const response = await fetch(NOCODE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: "Error al generar el QR" },
        { status: 502 }
      )
    }

    const result = await response.json()

    if (result.url) {
      return NextResponse.json({ url: result.url })
    }

    return NextResponse.json(
      { error: "No se recibio el QR" },
      { status: 502 }
    )
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
