# Arquitectura — EcoCupon.cl

## Principio

El circuito mínimo es **PUBLICAR → DESCUBRIR → VALIDAR**. Todo lo que no sirva a ese circuito no se construye todavía. El resto del brief (campañas, fidelización, multi-sucursal, analítica avanzada) son hipótesis sin validar y quedan fuera.

## Tenencia

La raíz es el comercio. Todo dato cuelga de `merchants` y el aislamiento se aplica en la base, no en el código de aplicación.

```
merchants ──┬── stores          (sucursales)
            ├── memberships ──── auth.users   (rol: owner | manager | staff)
            ├── promotions      (la oferta publicada)
            │     └── coupon_issues  (una emisión = un token único)
            │              └── redemptions  (append-only)
            └── redemptions
```

Reglas estructurales:

- Un comercio **no puede quedar sin dueño**: índice único parcial sobre `memberships(merchant_id) where role='owner'`, y el alta pasa por `create_merchant_with_owner` en una sola transacción.
- El rol vive en `memberships`, **no** en `auth.users`. Un usuario puede ser dueño de un comercio y empleado de otro.
- Toda política RLS se resuelve con `is_merchant_member()` / `can_manage_merchant()`, funciones `SECURITY DEFINER` que evitan la recursión infinita de políticas.

## El token de cupón

Este es el punto donde el sistema anterior era explotable.

**Antes:** el código se calculaba en el navegador a partir de datos públicos del producto. Determinista, forjable, sin estado en el servidor.

**Ahora:**

1. El servidor genera 96 bits con CSPRNG (`crypto.randomBytes`).
2. Se codifica en Base32 de Crockford — sin `I`, `L`, `O` ni `U` — para que sea transcribible si el QR falla.
3. Se persiste **solo el `sha256`** en `coupon_issues.token_hash`.
4. El token en claro se devuelve una sola vez, en la respuesta de emisión, y no se vuelve a escribir.

Un volcado completo de la base no permite canjear nada: no contiene tokens, solo hashes.

## El canje

```
POST /api/coupons/redeem  { token, storeId? }
        ↓
  normaliza el token (tolerante a OCR: I,L→1  O→0  U→V)
        ↓
  sha256 → rpc redeem_coupon(hash, storeId)
        ↓
  UPDATE coupon_issues SET status='redeemed'
   WHERE token_hash = $1 AND status='issued' AND vigente
```

El `UPDATE` condicional es la única defensa que importa: **si dos cajas validan el mismo cupón en el mismo instante, solo una afecta una fila.** La otra recibe cero filas y un `409`. No hay ventana de carrera que explotar, y no depende de que la aplicación recuerde comprobar el estado antes.

Barreras redundantes, a propósito:

| Barrera | Dónde |
|---|---|
| `status = 'issued'` en el `WHERE` | atómico, resuelve la carrera |
| `redemptions.coupon_issue_id` UNIQUE | segunda línea, a nivel de esquema |
| Trigger `redemptions_append_only` | impide `UPDATE` y `DELETE` del libro |
| Trigger `coupon_issues_immutable` | impide reescribir el token o su dueño |

El validador se resuelve con `auth.uid()` **dentro** de la función, no por parámetro: no se puede declarar un validador que no sea uno mismo.

## Fronteras de confianza

| Operación | Cliente | `authenticated` | `service_role` |
|---|---|---|---|
| Ver promociones publicadas | ✅ | ✅ | ✅ |
| Ver promociones de un comercio | — | solo las propias | ✅ |
| Emitir cupón | — | — | ✅ |
| Canjear cupón | — | ✅ (vía RPC) | ✅ |
| Leer `redemptions` | — | solo su comercio | ✅ |
| Escribir en `product-images` | — | solo bajo `<uid>/` | ✅ |

`coupon_issues` **no tiene política de INSERT**. El navegador no puede fabricar un cupón ni con un cliente manipulado. La emisión pasa por `issue_coupon`, que valida vigencia, tope global y tope por usuario antes de insertar.

La clave `service_role` solo se usa en `lib/supabase/admin.ts`, que importa `server-only`: si un componente cliente intenta importarlo, **el build falla** en vez de filtrar la clave al navegador.

## Decisiones descartadas

- **`token_lookup`** (un identificador público corto para soporte): se diseñó y se eliminó. Añadía una columna única que podía colisionar y una vía de enumeración, a cambio de comodidad que nadie pidió.
- **NFC:** fuera. Exige hardware físico por local, capex no modelado, y solo existe Web NFC en Chrome/Android. El QR cubre el caso completo.
- **Motor de campañas y motor de fidelización:** no se distinguen entre sí ni del cupón con vigencia y límites. Es el mismo objeto con otro nombre.
- **Multi-sucursal y roles:** el esquema los soporta (`stores`, `memberships`), pero no se construye interfaz. No hay un solo comercio usuario todavía.

## Deuda asumida

- El QR se genera vía `api.qrserver.com` (`app/qr/page.tsx`). Dependencia externa en el camino crítico; migrar a librería local.
- `profiles` mantiene `plan` y `daily_scans` del módulo de patentes, ajeno al circuito de cupones.
