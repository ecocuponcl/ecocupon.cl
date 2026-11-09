import { strict as assert } from "node:assert"
import { test } from "node:test"
import {
  generateCouponToken,
  hashToken,
  isValidTokenFormat,
  normalizeToken,
  resolveExpiry,
  tokensMatch,
  TOKEN_LENGTH_CHARS,
} from "../src/domains/coupon/token.ts"

test("el token tiene el formato esperado", () => {
  const t = generateCouponToken()
  assert.match(t, /^ECO(-[0-9A-HJKMNP-TV-Z]{4})+$/)
  assert.ok(isValidTokenFormat(t), `formato inválido: ${t}`)
})

test("el token no se repite", () => {
  const seen = new Set<string>()
  for (let i = 0; i < 20_000; i++) seen.add(generateCouponToken())
  assert.equal(seen.size, 20_000)
})

test("el token no es derivable del producto ni del descuento", () => {
  // El esquema anterior era `ECO{discount}OFF{productId}`: determinista y forjable.
  const tokens = new Set(Array.from({ length: 50 }, () => generateCouponToken()))
  for (const t of tokens) {
    assert.doesNotMatch(t, /OFF/)
    assert.doesNotMatch(t, /^\d/)
  }
})

test("normaliza separadores, minúsculas y prefijo ausente", () => {
  const t = generateCouponToken()
  const body = t.slice(4)
  assert.equal(normalizeToken(t), t)
  assert.equal(normalizeToken(t.toLowerCase()), t)
  assert.equal(normalizeToken(body), t)
  assert.equal(normalizeToken(t.replace(/-/g, " ")), t)
  assert.equal(normalizeToken(`  ${t}  `), t)
})

test("normaliza las confusiones típicas de OCR y de lectura humana", () => {
  const t = normalizeToken("ECO-1111-1111-1111-1111")
  // I, L -> 1  |  O -> 0  |  U -> V
  assert.equal(normalizeToken("ECO-1111-1111-1111-1111".replace(/1/g, "I")), t)
  assert.equal(normalizeToken("ECO-1111-1111-1111-1111".replace(/1/g, "l")), t)
  assert.equal(normalizeToken("ECO-0000-0000-0000-0000".replace(/0/g, "O")), normalizeToken("ECO-0000-0000-0000-0000"))
})

test("el hash es estable y no depende del formato de entrada", () => {
  const t = generateCouponToken()
  assert.equal(hashToken(t), hashToken(t.toLowerCase()))
  assert.equal(hashToken(t), hashToken(t.replace(/-/g, "")))
  assert.match(hashToken(t), /^[0-9a-f]{64}$/)
})

test("el hash no expone el token", () => {
  const t = generateCouponToken()
  const h = hashToken(t)
  assert.ok(!h.includes(t.slice(4).replace(/-/g, "")))
})

test("rechaza formatos inválidos", () => {
  assert.equal(isValidTokenFormat(""), false)
  assert.equal(isValidTokenFormat("ECO"), false)
  assert.equal(isValidTokenFormat("ECO-123"), false)
  assert.equal(isValidTokenFormat("ECO-" + "Z".repeat(TOKEN_LENGTH_CHARS + 1)), false)
  // contiene caracteres fuera del alfabeto Crockford
  assert.equal(isValidTokenFormat("ECO-!!!!-!!!!-!!!!-!!!!-!!!!"), false)
})

test("tokensMatch compara correctamente", () => {
  const a = generateCouponToken()
  const b = generateCouponToken()
  assert.equal(tokensMatch(a, a), true)
  assert.equal(tokensMatch(a, a.toLowerCase()), true)
  assert.equal(tokensMatch(a, b), false)
  assert.equal(tokensMatch(a, a.slice(0, -1)), false)
})

test("resolveExpiry nunca excede el tope de días", () => {
  const far = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
  const capped = resolveExpiry(far, 30)
  const maxMs = 30 * 24 * 3600 * 1000 + 1000
  assert.ok(capped.getTime() - Date.now() <= maxMs)

  const soon = new Date(Date.now() + 3600 * 1000).toISOString()
  assert.equal(resolveExpiry(soon).toISOString(), soon)

  assert.ok(resolveExpiry(null).getTime() > Date.now())
})
