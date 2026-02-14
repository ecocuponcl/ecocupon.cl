export interface QRData {
  id: string
  material: string
  location: string
  contact: string
  created: string
  notes?: string
}

export async function generateQRCode(data: QRData): Promise<string> {
  try {
    const response = await fetch("/api/generate-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al generar QR")
    }

    const result = await response.json()

    if (result.url) {
      return result.url
    }
    throw new Error("No se recibio el QR")
  } catch (error) {
    console.error("Error generating QR code:", error)
    throw error
  }
}

export function downloadQRImage(dataUrl: string, filename: string) {
  const downloadLink = document.createElement("a")
  downloadLink.href = dataUrl
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}
