# Plan de implementación — EcoCupon.cl

## P0 — Seguridad · ejecutado

| # | Tarea | Estado |
|---|---|---|
| P0.1 | Purgar el JWT `service_role` de los 4 archivos versionados | ✅ |
| P0.2 | Endurecer `.gitignore` para `.env` y `.env.*` | ✅ |
| P0.3 | Sacar `smarteros-mcp/.env` del índice de git | ✅ |
| P0.4 | Crear `.mcp.json` (Supabase MCP vía OAuth + Vercel MCP) | ✅ |
| P0.5 | Crear bucket `product-images`; poner límite de tamaño y MIME a `ECO` | ✅ |
| P0.6 | Guardia `server-only` en el cliente administrativo | ✅ |
| P0.7 | **Rotar la clave `service_role` en el dashboard** | ⛔ bloqueado: requiere al dueño |
| P0.8 | Verificar RLS efectivo sobre el rol `anon` | ⛔ bloqueado: falta clave `anon` |
| P0.9 | Purgar el secreto del historial de git | ⛔ requiere `git filter-repo` + rotación |

## P1 — Backend y datos · migraciones escritas, no aplicadas

| # | Tarea | Estado |
|---|---|---|
| P1.1 | Comparar esquema real contra esquema esperado | ✅ |
| P1.2 | Migraciones SQL versionadas y no destructivas | ✅ escritas |
| P1.3 | Esquema multi-comercio con aislamiento | ✅ escrito |
| P1.4 | Reconstruir las tablas fantasma y `products.plate` | ✅ escrito |
| P1.5 | Aplicar las migraciones | ⛔ bloqueado: sin acceso DDL |
| P1.6 | Backfill de comercios desde el catálogo actual | ⏸ pendiente, depende de P1.5 |

## P2 — Motor de cupones · ejecutado

| # | Tarea | Estado |
|---|---|---|
| P2.1 | Tokens aleatorios de servidor, hash en reposo | ✅ |
| P2.2 | Emisión validada por vigencia y topes | ✅ |
| P2.3 | Canje atómico, backend exclusivamente | ✅ |
| P2.4 | Inmutabilidad y trazabilidad por trigger | ✅ |
| P2.5 | Reemplazar el generador determinista del cliente | ✅ |
| P2.6 | Pruebas unitarias del módulo de tokens | ✅ 10/10 |

## P3 — MVP · parcial

| # | Tarea | Estado |
|---|---|---|
| P3.1 | API de emisión | ✅ escrita |
| P3.2 | API de canje | ✅ escrita |
| P3.3 | UI de obtención de cupón | ✅ reescrita |
| P3.4 | Panel del comercio (publicar promoción) | ⏸ pendiente |
| P3.5 | Pantalla de validación para el comercio | ⏸ pendiente |
| P3.6 | Prueba de extremo a extremo | ⛔ bloqueado: sin tablas |

## P4 — Experiencia comercial · pendiente

Panel de promociones, historial de canjes, métricas verificables, mobile-first. No se empieza hasta que P1.5 desbloquee el circuito.

---

## Orden de desbloqueo

1. **Rotar `service_role`** (P0.7). Es lo único que cierra el riesgo en curso, y no depende de nada más.
2. **Abrir acceso DDL** por cualquiera de las cuatro vías de `ECOCUPON-TECHNICAL-AUDIT.md` §4. Recomendado: OAuth vía MCP, que ya está configurado en `.mcp.json`.
3. **Aplicar las 5 migraciones.** Verificables una a una contra las 29 filas actuales, que no se tocan.
4. **Semilla mínima:** un comercio, una promoción publicada, una cuenta de staff.
5. **Probar el circuito completo:** emitir → canjear → revalidar (debe dar `409`) → verificar el libro de canjes.

## Criterios de aceptación

Contra los 10 del encargo:

| # | Criterio | Estado |
|---|---|---|
| 1 | Un comercio se registra y administra promociones | ⏸ falta UI y migración |
| 2 | Un consumidor descubre una promoción | ⏸ falta UI y migración |
| 3 | Obtiene un cupón único | ✅ API, ⏸ sin probar en vivo |
| 4 | El comercio valida su QR | ✅ API, ⏸ sin probar en vivo |
| 5 | Un cupón no puede canjearse dos veces | ✅ garantizado en el esquema, ⏸ sin probar en vivo |
| 6 | Los datos están aislados por comercio | ✅ RLS escrito, ⏸ sin verificar en vivo |
| 7 | Los canjes quedan registrados | ✅ append-only, ⏸ sin probar en vivo |
| 8 | Las métricas corresponden a operaciones reales | ⏸ pendiente |
| 9 | Funciona en móvil | ⏸ pendiente |
| 10 | No hay credenciales privilegiadas expuestas | ⚠️ purgadas del árbol, **no del historial** |
