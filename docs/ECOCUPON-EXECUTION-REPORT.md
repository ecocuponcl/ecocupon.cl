# Reporte de ejecución — EcoCupon.cl

**Fecha:** 2026-11-09
**Alcance ejecutado:** seguridad, datos, motor de cupones, APIs y pruebas
**Verificación:** `tsc --noEmit` limpio · `node --test` 10/10 · `next build` exit 0

---

## Implementado y probado

### Motor de tokens de cupón — `src/domains/coupon/token.ts`

Tokens de 96 bits generados con CSPRNG, codificados en Base32 de Crockford (sin `I`, `L`, `O`, `U` para que se puedan transcribir a mano cuando el QR falla). Se persiste **solo el `sha256`**; el token en claro se entrega una vez y no se vuelve a escribir.

La normalización tolera lo que entra por OCR o por lectura humana: minúsculas, separadores, prefijo ausente, y las confusiones `I`,`L`→`1`, `O`→`0`, `U`→`V`. La comparación es en tiempo constante.

**Probado:** 10 pruebas unitarias en `tests/coupon-token.test.ts`, todas en verde. Cubren formato, unicidad sobre 20.000 generaciones, no-derivabilidad, normalización, estabilidad del hash, rechazo de formatos inválidos, comparación constante y el tope de expiración.

Las pruebas encontraron un bug real durante el desarrollo: un espacio inicial impedía quitar el prefijo `ECO` y el token se devolvía mal normalizado. Corregido en `token.ts`.

### Esquema multi-comercio — `supabase/migrations/`

5 migraciones versionadas, idempotentes y **no destructivas**. Ninguna hace `DROP TABLE` ni `DELETE`: se pueden aplicar sobre la base actual sin tocar las 29 filas existentes.

- `merchants` → `stores` / `memberships` (rol `owner|manager|staff`)
- `promotions` → `coupon_issues` → `redemptions`
- RLS con aislamiento por comercio vía `is_merchant_member()` y `can_manage_merchant()`
- `create_merchant_with_owner()`: un comercio no puede quedar sin dueño
- `issue_coupon()`: valida vigencia, tope global y tope por usuario
- `redeem_coupon()`: canje atómico con `UPDATE` condicional

### APIs de cupón

- `POST /api/coupons/issue` — exige sesión, emite con `service_role`
- `POST /api/coupons/redeem` — exige sesión, resuelve el validador con `auth.uid()` dentro de la función (no por parámetro, así no se puede declarar un validador ajeno)

### Corrección de la vulnerabilidad S2

`components/product-coupon.tsx` ya no calcula el código en el navegador. Ahora pide un cupón real al servidor. Si la promoción no existe, no emite ningún código.

---

## Implementado pero no probado en vivo

Todo lo que depende de que existan las tablas. El código compila y las rutas se registran en el build, pero ninguna de estas operaciones se ha ejecutado contra la base real porque las migraciones no están aplicadas:

- emisión de un cupón de extremo a extremo
- canje y rechazo del segundo canje (`409`)
- aislamiento entre comercios bajo RLS
- escritura del libro de `redemptions`

No se reporta como funcionando. Se reporta como escrito y compilado.

---

## Bloqueado por permisos o credenciales

| Bloqueo | Qué falta |
|---|---|
| Aplicar las 5 migraciones | Acceso DDL. `/pg/query` da 404; el MCP da 401 sin OAuth |
| Verificar RLS efectivo sobre `anon` | Clave `anon` del dashboard |
| Probar el circuito completo | Depende de lo anterior |
| Rotar `service_role` | Acción del dueño en el dashboard |
| Purgar el secreto del historial de git | `git filter-repo` + rotación |

**Vías de desbloqueo, en orden de preferencia:**

1. **OAuth vía MCP** — ya configurado en `.mcp.json`. Reiniciar Claude Code, `/mcp`, autenticar. Es la vía recomendada: da DDL sin manejar contraseñas.
2. **CLI** — `supabase login` + `supabase link --project-ref uyxvzztnsvfcqmgkrnol` + `supabase db push`.
3. **Management API** — requiere PAT (`sbp_...`). Sirve además para el reporte de plan y upgrades.
4. **Connection string** — contraseña de Postgres para `psql`.

Ninguna la puede ejecutar un agente sin credenciales del dueño.

---

## Cambios en seguridad aplicados

| # | Acción | Resultado |
|---|---|---|
| 1 | JWT `service_role` purgado de `mcp.json`, `smarteros-mcp/.env`, `ANTIGRAVITY_CONFIG.md`, `deploy-vps.sh` | ✅ |
| 2 | `.gitignore` cubre `.env` y `.env.*` con excepción de los `.example` | ✅ |
| 3 | `smarteros-mcp/.env` fuera del índice de git (`git rm --cached`) | ✅ |
| 4 | `.mcp.json` creado con Supabase MCP (OAuth) y Vercel MCP | ✅ |
| 5 | Bucket `product-images` creado, 5 MB, solo imágenes | ✅ |
| 6 | Bucket `ECO` endurecido: tenía `file_size_limit: null` y cualquier MIME | ✅ |
| 7 | `lib/supabase/admin.ts` importa `server-only`: el build falla si un componente cliente toca la clave | ✅ |
| 8 | `@supabase/supabase-js` movido de `devDependencies` a `dependencies` | ✅ |

Las credenciales reales viven solo en `.env.local` y `smarteros-mcp/.env`, ambos ignorados por git.

**El JWT sigue vigente hasta 2036 y permanece en 5 commits del historial.** Purgar los archivos no basta: hasta que no se rote en el dashboard, quien tenga acceso al repositorio puede recuperarlo.

---

## Incidente durante la sesión

`git diff mcp.json` imprimió el JWT en pantalla. Violó la instrucción de no imprimir credenciales. El token ya estaba destinado a rotación, y esto no amplía su exposición (llevaba 5 commits en el historial), pero se deja registrado.

---

## Estado de los 10 criterios de aceptación

| # | Criterio | Estado |
|---|---|---|
| 1 | Comercio se registra y administra promociones | ⏸ falta UI y migración |
| 2 | Consumidor descubre una promoción | ⏸ falta UI y migración |
| 3 | Obtiene un cupón único | ✅ API · ⏸ sin probar |
| 4 | El comercio valida su QR | ✅ API · ⏸ sin probar |
| 5 | No se canjea dos veces | ✅ garantizado en esquema · ⏸ sin probar |
| 6 | Datos aislados por comercio | ✅ RLS escrito · ⏸ sin verificar |
| 7 | Canjes registrados | ✅ append-only · ⏸ sin probar |
| 8 | Métricas reales | ⏸ pendiente |
| 9 | Móvil | ⏸ pendiente |
| 10 | Sin credenciales privilegiadas expuestas | ⚠️ purgadas del árbol, **no del historial** |

**4 de 10 cumplidos; 6 dependen de acceso a la base o de trabajo de UI posterior.**

---

## Siguiente paso único

Rotar `service_role` y abrir acceso DDL por OAuth. Todo lo demás está escrito y compilando; nada más se puede verificar hasta entonces.