// NoCodeAPI QR Code Generator service
const NOCODE_API_URL = "https://v1.nocodeapi.com/ecocupon/qrCode/CMcuxKjFowzJykHM/dataurl"

export interface QRData {
  id: string
  material: string
  location: string
  contact: string
  created: string
  notes?: string
}

export async function generateQRCode(data: QRData): Promise<string> {
  const myHeaders = new Headers()
  myHeaders.append("Content-Type", "application/json")

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
    body: JSON.stringify(data),
  }

  try {
    const response = await fetch(NOCODE_API_URL, requestOptions)
    const result = await response.json()

    // NoCodeAPI returns the QR code as a data URL
    if (result.url) {
      return result.url
    }
    throw new Error("No QR code URL in response")
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
