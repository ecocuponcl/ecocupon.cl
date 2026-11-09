import { createHash, randomBytes, timingSafeEqual } from "node:crypto"

// Crockford Base32: sin I, L, O ni U, para que el token sea transcribible a mano
// sin ambigüedad cuando el lector de QR falla.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
const TOKEN_BYTES = 12 // 96 bits de entropía
const PREFIX = "ECO"
const GROUP = 4

export const TOKEN_LENGTH_CHARS = Math.ceil((TOKEN_BYTES * 8) / 5)

function encodeBase32(buf: Buffer): string {
  let bits = 0
  let value = 0
  let out = ""
  for (const byte of buf) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

/**
 * Genera un token nuevo. Usa CSPRNG: el resultado no es derivable de ningún
 * dato del producto ni del comercio, a diferencia del esquema anterior
 * (`ECO{discount}OFF{productId}`), que cualquiera podía calcular.
 */
export function generateCouponToken(): string {
  const random = encodeBase32(randomBytes(TOKEN_BYTES)).slice(0, TOKEN_LENGTH_CHARS)
  const groups = random.match(new RegExp(`.{1,${GROUP}}`, "g")) ?? []
  return `${PREFIX}-${groups.join("-")}`
}

/**
 * Normaliza lo que entra (escaneado, tipeado o pegado) a la forma canónica.
 * Tolerante a separadores y a las confusiones típicas de OCR y de lectura humana.
 */
export function normalizeToken(raw: string): string {
  const body = raw
    .trim()
    .toUpperCase()
    .trimStart()
    .replace(/^ECO[\s\-_]*/, "")
    .replace(/[^0-9A-Z]/g, "")
    .replace(/[IL]/g, "1")
    .replace(/O/g, "0")
    .replace(/U/g, "V")

  if (body.length !== TOKEN_LENGTH_CHARS) return body
  const groups = body.match(new RegExp(`.{1,${GROUP}}`, "g")) ?? []
  return `${PREFIX}-${groups.join("-")}`
}

export function isValidTokenFormat(raw: string): boolean {
  const normalized = normalizeToken(raw)
  const body = normalized.slice(PREFIX.length + 1).replace(/-/g, "")
  if (body.length !== TOKEN_LENGTH_CHARS) return false
  return [...body].every((c) => ALPHABET.includes(c))
}

/**
 * Lo único que se persiste. El token en claro solo existe en la respuesta de
 * emisión y en el dispositivo que lo recibió.
 */
export function hashToken(raw: string): string {
  return createHash("sha256").update(normalizeToken(raw), "utf8").digest("hex")
}

/** Comparación en tiempo constante, para no filtrar información por timing. */
export function tokensMatch(a: string, b: string): boolean {
  const ha = Buffer.from(hashToken(a), "hex")
  const hb = Buffer.from(hashToken(b), "hex")
  return ha.length === hb.length && timingSafeEqual(ha, hb)
}

/** Ventana de validez del cupón emitido, acotada por el fin de la promoción. */
export function resolveExpiry(promotionEndsAt: string | null, maxDays = 30): Date {
  const cap = new Date(Date.now() + maxDays * 24 * 60 * 60 * 1000)
  if (!promotionEndsAt) return cap
  const ends = new Date(promotionEndsAt)
  return ends < cap ? ends : cap
}
