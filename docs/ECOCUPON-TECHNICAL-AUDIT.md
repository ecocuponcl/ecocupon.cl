# Auditoría técnica — EcoCupon.cl

**Fecha:** 2026-11-09
**Alcance:** repositorio local, Supabase `uyxvzztnsvfcqmgkrnol`, configuración de despliegue
**Método:** inspección directa del código y consultas verificadas contra la API. Nada de lo que sigue se asumió por la existencia de una interfaz.

---

## 1. Estado real de la base de datos

La base **responde y está sana**. No está restaurándose.

| Servicio | Endpoint | Resultado |
|---|---|---|
| PostgREST | `/rest/v1/` | 200, ~1.0 s |
| GoTrue | `/auth/v1/health` | 200 — `v2.197.0` |
| Storage | `/storage/v1/bucket` | 200 |
| Edge | Cloudflare | `cf-ray ... -SCL` (Santiago) |

### Esquema real vs. esquema que el código espera

| Tabla | En la base | La usa el código |
|---|---|---|
| `categories` | ✅ 5 filas | ✅ 7 llamadas |
| `products` | ✅ 12 filas | ✅ 7 llamadas |
| `knasta_prices` | ✅ 12 filas | ✅ 2 llamadas |
| `profiles` | ❌ `PGRST205` | ✅ 3 llamadas |
| `recycling_events` | ❌ `PGRST205` | ✅ 2 llamadas |
| `plate_detection_logs` | ❌ `PGRST205` | ✅ 5 llamadas |
| `product_specs` | ❌ `PGRST205` | — |
| `upload_tracking` | ❌ `PGRST205` | — |
| `coupons`, `merchants`, `promotions` | ❌ nunca existieron | — |

Columna faltante: `products.plate` → `42703`. El script `scripts/add-plate-column.sql` nunca se aplicó.

**Consecuencia:** los módulos de patente, reciclaje y perfil están rotos contra la base real. No hay ninguna entidad de comercio, promoción ni cupón.

### Storage

Antes de esta sesión: un solo bucket `ECO`, público, `file_size_limit: null`, `allowed_mime_types: null` — lectura y escritura de cualquier archivo de cualquier tamaño.

El código sube a `product-images` (`hooks/use-image-upload.ts:99`), bucket que no existía.

### Auth

3 usuarios, todos Google OAuth: `ecocupon.cl@gmail.com` (2026-03-23), `smarterbotcl@gmail.com` (2026-03-29), `zaffuto@gmail.com` (2026-04-18).

### Entorno local

No existía `.env` ni `.env.local`. `lib/supabase/server.ts:20` devuelve `null` y la app cae a datos de fallback.

---

## 2. Hallazgos de seguridad

### S1 — Clave `service_role` comprometida en el repositorio · CRÍTICO

Un JWT con rol `service_role` del proyecto `uyxvzztnsvfcqmgkrnol`, con expiración en 2036, estaba en claro en cuatro archivos versionados:

- `mcp.json`
- `smarteros-mcp/.env`
- `smarteros-mcp/ANTIGRAVITY_CONFIG.md`
- `smarteros-mcp/deploy-vps.sh`

y en 5 commits del historial (`0465f9d`, `1b10e4d`, `2684a39`, `45c2561`, `9531e00`).

Esa clave salta RLS por completo: lectura, escritura y borrado de toda la base, más administración de usuarios de Auth.

**Estado:** purgada del árbol de trabajo; ver `ECOCUPON-EXECUTION-REPORT.md` para lo hecho y lo que falta. **La rotación es obligatoria: mientras el token siga vigente, el historial de git lo conserva.**

### S2 — Cupones forjables por diseño · CRÍTICO

`components/product-coupon.tsx:29` calculaba el código en el navegador:

```js
const couponCode = `ECO${discount}OFF${product.id.toUpperCase().slice(0, 6)}`
```

Determinista y derivable. Cualquiera que viera un cupón podía calcular los del resto del catálogo. El 100% de los canjes era falsificable.

**Estado:** corregido. Ver `ECOCUPON-EXECUTION-REPORT.md`.

### S3 — Sin RLS verificable

No hay forma de leer `pg_policies` sin acceso DDL, y no había clave `anon` para probar el comportamiento real del rol anónimo. Las tablas `products`, `categories` y `knasta_prices` se sirven hoy sin política declarada en el repositorio.

Las migraciones preparadas activan RLS y declaran políticas explícitas para las tres.

### S4 — `.gitignore` no cubría `.env`

Solo ignoraba `.env.local` y las variantes `.env.*.local`. Un `.env` a secas se versionaba sin aviso — que es exactamente cómo terminó S1.

**Estado:** corregido.

---

## 3. Deuda técnica

| # | Hallazgo | Impacto |
|---|---|---|
| D1 | No hay framework de pruebas | Nada verifica el comportamiento del motor de cupones |
| D2 | `@supabase/supabase-js` en `devDependencies` | Se usa en runtime; un build de producción con `--prod` puede omitirlo |
| D3 | 7 scripts SQL sueltos en `scripts/`, sin versionar ni ordenar | No hay forma de saber qué está aplicado. De ahí las tablas fantasma |
| D4 | `setup-supabase.sql` empieza con `DROP TABLE ... CASCADE` | Peligroso si alguien lo corre sobre producción: borra las 29 filas actuales |
| D5 | QR generado vía `api.qrserver.com` (`app/qr/page.tsx`) | Dependencia externa en el camino crítico |
| D6 | Sin `.mcp.json` | El MCP de Supabase no cargaba; el nombre de archivo era incorrecto |

---

## 4. Bloqueo de acceso

No hay acceso administrativo al proyecto de Supabase. `POST /pg/query` devuelve 404 y el MCP remoto devuelve 401 (requiere OAuth). La clave `service_role` da REST, no DDL.

**Vías legítimas para desbloquear, en orden de preferencia:**

1. **Patrón recomendado — OAuth vía MCP:** el `.mcp.json` ya apunta a `https://mcp.supabase.com/mcp?project_ref=uyxvzztnsvfcqmgkrnol`. Reiniciar Claude Code y autenticar con `/mcp`. Da DDL con permisos acotados y auditables, sin manejar contraseñas.
2. **CLI de Supabase:** `supabase login` (interactivo, solo el dueño) + `supabase link --project-ref uyxvzztnsvfcqmgkrnol` + `supabase db push`.
3. **Management API:** requiere un Personal Access Token (`sbp_...`) desde el dashboard. Sirve además para el reporte de plan, compute y add-ons.
4. **Connection string:** la contraseña de Postgres (`Settings → Database`) permite `psql` directo.

Ninguna de las cuatro puede ejecutarla un agente sin credenciales del dueño. Documentado y a la espera.

---

## 5. Qué funciona hoy, verificado

| Capacidad | Estado |
|---|---|
| Catálogo de productos y categorías | ✅ funciona (12 y 5 filas) |
| Comparación de precios Knasta | ✅ funciona (12 filas) |
| Auth Google OAuth | ✅ funciona (3 usuarios) |
| Subida de imágenes | ❌ bucket inexistente (ahora creado) |
| Detección de patente / reciclaje | ❌ tablas inexistentes |
| Perfil de usuario | ❌ tabla inexistente |
| Cupones | ❌ no existía el concepto |
| Comercios / multi-tenencia | ❌ no existía |
