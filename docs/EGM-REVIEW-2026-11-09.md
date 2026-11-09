# Revisión EGM — Brief de producto EcoCupon.cl

**Fecha:** 2026-11-09
**Documento revisado:** brief de producto EcoCupon.cl (10 secciones)
**Método:** Elephant-Goldfish Model v0.1.1 (Google), protocolo Goldfish Review
**Estándar:** Heilmeier Catechism
**Revisores:** `egm-comprehension`, `egm-design`, `egm-zoom-out`, `inventive_catalyst` — cada uno en contexto fresco, sin historial de conversación

---

## Veredicto

El brief **no pasa el estándar Heilmeier**. Responde cómo máximo 3 de las 8 preguntas. Es un documento de visión y posicionamiento de marca, no una especificación de producto: todo está en futuro o condicional, sin línea base de lo construido, sin costos, sin plazos, sin métricas de éxito del proyecto y sin sección de riesgos.

Los cuatro revisores convergen, de forma independiente, en tres bloqueadores: **arranque en frío de dos lados**, **fraude de canjes** y **brecha entre el brief y lo construido**.

---

## Bloqueadores

### B1 — No hay línea base (los 4 revisores)
El documento no distingue qué está construido, qué está decidido y qué es aspiración. Sin eso el lector nuevo no puede evaluar viabilidad ni alcance de una primera entrega.
**Acción:** añadir sección "Estado actual vs. propuesto".

### B2 — Heilmeier incompleto: sin costo, plazo, métricas ni estado del arte
- **Costo ( §6, §9):** solo hay precios al cliente. Falta costo de construcción y operación mensual.
- **Plazos:** no hay fechas ni fases.
- **Métricas/exámenes (§4, §6):** hay métricas *para el comercio* (visualizaciones, canjes), no criterios de éxito *del proyecto*.
- **Estado del arte:** no se nombra un solo competidor ni práctica actual. Sin esto, "qué hay de nuevo" (§7) no es verificable.
- **Riesgos:** no existe la sección.
**Acción:** cerrar los cinco apartados antes de aprobar cualquier construcción.

### B3 — Arranque en frío de dos lados sin resolver (§2, §3, §4)
El ciclo de §4 asume que ambas partes ya coexisten. No se define quién llega primero, ni umbral de liquidez (comercios activos por comuna, cupones vigentes, canje esperado por zona), ni comercio ancla, ni subsidio de siembra.
**Acción:** fijar 1–2 comunas piloto con meta concreta de oferta antes del lanzamiento público.

### B4 — El QR es un token portador sin ciclo de vida (§3, §4)
Nada impide captura de pantalla y reuso, ni que el propio comercio valide sus cupones para inflar las estadísticas que vende el Plan Pro.

**Verificado en código:** `components/product-coupon.tsx:29` genera el código de forma determinista en el cliente:

```js
const couponCode = `ECO${discount}OFF${product.id.toUpperCase().slice(0, 6)}`
```

Cualquiera que vea un cupón puede derivar los códigos de todos los productos del mismo descuento, sin tocar el servidor. **El 100% de los canjes es falsificable hoy.**

**Acción:** token aleatorio de un solo uso emitido por el servidor, validación online obligatoria con expiración corta, límite por consumidor autenticado, y separación de identidad entre quien emite y quien valida.

### B5 — Contradicción: límites de uso vs. uso sin app (§3A, §3B)
Se prometen "límites de uso" (línea 49) y a la vez uso sin instalar aplicación (línea 42). Sin identidad de consumidor no hay forma de aplicar un límite por persona. Las dos afirmaciones son incompatibles tal como están escritas.
**Acción:** definir el mecanismo de identidad (teléfono verificado o cuenta web ligera).

### B6 — El brief describe un producto que no está construido (§3B, §6, §9)
El brief promete comercios, cupones, campañas, multi-sucursal, roles y motor de fidelización. La base en vivo no tiene ninguna de esas entidades (ver reporte de Supabase adjunto). Además, lo desplegado es un catálogo de productos con comparación de precios (Knasta) y búsqueda por patente — alcance que el brief no declara ni reconcilia, y el prefijo "Eco" (reciclaje) no aparece en el brief.
**Acción:** declarar explícitamente si esto es un pivote o un segundo producto. No mantener dos relatos.

### B7 — El diagnóstico del dolor no está validado (§1, §4, §10)
El brief asume que el problema del comercio es "no vuelven". Para un negocio de 3 personas la restricción activa suele ser caja, ubicación o dependencia de delivery. Si el dolor real es margen, el producto lo empeora: descuentos erosionan margen y atraen comprador-de-oferta con baja recompra.
**Acción:** validar con dos preguntas de compra antes de construir — "¿pagarías $10.000/mes por saber quién te compró dos veces?" vs. "¿pagarías por llenar el martes entre 10 y 13h?".

### B8 — El comprador del Plan Pro es improbable (§3B, §6)
En una tienda de 3 personas el comprador es el dueño, que también atiende el mesón. El Plan Pro vende *trabajo* (campañas, analítica, personalización), no resultado, y nadie en ese local tiene tiempo de administrarlo. "Quitar la marca EcoCupon" no es un dolor que hayan sentido.
**Acción:** evaluar cobro por resultado (comisión por canje validado o pack prepagado) en lugar de suscripción.

### B9 — Sustitución del consumidor no resuelta (§3A, §7)
El consumidor ya tiene beneficios de tarjeta bancaria, programas de supermercado y agregadores de ofertas. Un marketplace nuevo compite con oferta casi idéntica y sin marca. No exigir app baja fricción, pero no resuelve por qué alguien abriría una cuponera nueva.
**Acción:** al inicio, no captar consumidores. La distribución inicial es el tráfico propio del comercio (QR en el mesón, WhatsApp a clientes existentes).

---

## Hallazgos mayores

| # | Alcance | Hallazgo |
|---|---|---|
| M1 | §7 (línea 128) | **NFC no es load-bearing.** Exige tags físicos por local, logística y capex no modelado. Solo hay Web NFC en Chrome/Android; iOS y escritorio no lo soportan. El código ya tiene captura por cámara en `app/scan/page.tsx`. Además §6 habla de "QR y NFC" cuando §3 solo menciona escanear QR. Retirar hasta que un piloto lo pida y lo pague. |
| M2 | §5 | **Review gating por proximidad.** Vincular la solicitud de reseña al flujo de canje expone al comercio a suspensión del perfil en Google y a la plataforma como responsable, aunque las salvaguardas declaradas (líneas 82-84) sean correctas. Desacoplar ambos flujos. |
| M3 | §3, §6 | **Diferencia Gratis/Pro sin definir.** "Identificación de marca EcoCupon" vs. "sin identificación visual... cuando corresponda" no define qué es ni cuándo aplica. "Validación básica" frente a la validación no listada en Pro deja la frontera del plan sin especificar. |
| M4 | §6 | **Plan Gratis como validador QR ilimitado.** Ofrece cupones y validación sin límite de canjes, puede usarse indefinidamente gratis. Fijar el número de canjes gratuitos que hace rentable a un comercio pago y publicar la tasa de conversión mínima necesaria. |
| M5 | §1, §8, líneas 3/140 | **Inconsistencia de marca:** "EcoCupon" en el cuerpo, "EcoCupón" en el acento del encabezado. Unificar. |
| M6 | §2, §6 | **Marketplace abierto vs. cadenas.** Al entrar una cadena, su presupuesto vuelve invisible al almacén de barrio — que es a quien se monetiza. Considerar un vertical único con densidad en una comuna antes de abrir categorías. |
| M7 | §3A, §5 | **Canal de la invitación a reseñar indefinido.** "Podrá recibir una invitación voluntaria" sin canal (correo, SMS, web) ni disparador concreto. §3A descarta exigir app, así que el canal queda sin definir y no es implementable. |
| M8 | §4 | **Superficie de responsabilidad.** No se define quién responde cuando el comercio rechaza el descuento en caja. Se vende confianza al consumidor sin imponer obligaciones al comercio ni mecanismo de disputa. |

---

## Hallazgos menores

- **§7 "cupones inteligentes", §9 "motor de campañas/fidelización", "infraestructura preparada para integraciones futuras":** términos que suenan a capacidad concreta pero no describen mecanismo. "Infraestructura preparada para integraciones futuras" es la definición literal de YAGNI.
- **§4:** se presenta como ciclo de fidelización pero termina en "Medir" sin volver a "Captar". El bucle no cierra.
- **§6 plan anual:** no se indica si reemplaza al Pro o coexiste.
- **§6 precios:** $9.990 CLP/mes se afirma, no se deriva. Falta costo marginal por canje.

---

## YAGNI — qué se puede recortar

El brief enumera 11 capacidades. La cadena mínima para que el producto tenga algún valor es de tres: **el comercio publica un cupón → el consumidor lo encuentra → alguien lo valida una vez.**

Especulativas hoy: motor de campañas y motor de fidelización (no se distinguen entre sí ni del cupón inteligente), multi-sucursal, usuarios y permisos (no hay un solo comercio usuario), e "infraestructura preparada para integraciones futuras".

§9 línea 170 ("la marca debe ser independiente de cualquier sector y permitir que nuevas categorías se incorporen sin rediseñar el concepto") se presenta como restricción pero es una licencia de alcance ilimitado. Una restricción testeable sería: "el modelo de datos no tendrá campos específicos de industria".

No se detectaron optimizaciones prematuras (cachés, colas, particionado): el estándar zoom-out se cumple en ese punto.

---

## Reutilización — lo que ya existe en el código

Lo genuinamente nuevo es la tenencia multi-comercio (no existen tablas `merchants`/`stores`), y eso es una decisión de esquema, no un subsistema completo.

| Capacidad prometida en el brief | Ya existe en |
|---|---|
| Generación de QR | `app/qr/page.tsx` (hoy vía `api.qrserver.com`; migrar a librería local, no crear módulo nuevo) |
| Validación de cupones | `app/scan/page.tsx` — captura por cámara, entrada manual, límite diario, escritura en Supabase |
| Límites de uso y cuota por plan | `hooks/use-plate-detection.ts` — cuota "10 por día, plan free" y registro por usuario |
| Motor de fidelización | `scripts/setup-recycling-module.sql` — tabla `profiles`, libro de puntos, trigger agregador, RLS, verificación de rol admin |
| Cuponera del consumidor | `app/profile/page.tsx` — billetera con historial |
| Analítica y acceso por rol | `app/admin/page.tsx`, `components/admin/dashboard-stats.tsx` |
| Gráficos | `components/ui/chart.tsx` + `recharts` |
| Entidad "cupón" | Debe vivir en `src/domains/{catalog,product,pricing}` y `src/application/services/*` (ver `docs/DDD-ARCHITECTURE.md`), no en un módulo paralelo |
| Validación de códigos | `lib/validators.ts` |

---

## Corrección al reporte de los revisores

Dos revisores afirmaron que la base de datos contiene `product_specs`, `profiles`, `plate_detection_logs`, `recycling_events` y `upload_tracking`. **Es incorrecto.** Verificado por consulta directa a PostgREST: las cinco devuelven `404 PGRST205` (tabla inexistente). La base expone exactamente 3 tablas: `categories` (5 filas), `knasta_prices` (12), `products` (12).

---

## Formas alternativas de menor superficie

Dos propuestas para probar la misma hipótesis con mucho menos alcance:

**A. Concierge, un vertical y una comuna.**
40 comercios, QR en el mesón, WhatsApp, reporte manual mensual. Sin app de consumidor ni marketplace público. Prueba la hipótesis de recompra en semanas.

**B. "Solo la segunda visita".**
La herramienta captura el teléfono del cliente en el local y envía un cupón de retorno a los N días. Sin descubrimiento ni multisectorialidad. Prueba si la recompra se puede fabricar, que es el único supuesto que importa.

---

## Siguiente paso

El brief no se puede aprobar ni construir tal como está. Antes de escribir código, cerrar B1, B2 y B7: línea base, los cinco apartados Heilmeier faltantes, y validación del diagnóstico del dolor con comercios reales.

La cuña más vendible del documento —el dolor de reputación en Google Business Profile, §5— está presentada como accesorio y merece evaluarse como producto principal.

---

# Ronda 2 — revisión del código implementado

**Fecha:** 2026-11-09 (misma jornada, tras la primera implementación)
**Objeto:** el código nuevo del circuito de cupones, no el brief
**Revisores:** `egm-design` (seguridad) y `egm-zoom-out` (simplicidad), en contexto fresco

## Veredicto

El núcleo criptográfico pasó. Los revisores confirmaron explícitamente: `service_role` confinado al servidor (ningún fichero `"use client"` importa el cliente administrativo), CSPRNG con solo `sha256` en reposo, `coupon_issues` sin política de INSERT, y las dos carreras —canje y límites— resueltas correctamente.

Encontraron **siete fallos mayores** que la primera implementación no cubría. Todos corregidos en `20261109000800_security_hardening.sql` y en el código.

## Correcciones aplicadas

| # | Hallazgo | Corrección |
|---|---|---|
| S1 | `redeem_coupon` autorizaba después de mutar: `403` para token ajeno real, `404` para inexistente → oráculo de existencia entre comercios | `SELECT ... FOR UPDATE`, autorizar antes de tocar la fila, devolver cero filas idénticamente en los cuatro casos |
| S2 | `p_store_id` se escribía sin verificar tenencia; `redemptions` es append-only, así que una atribución cruzada sería incorregible | Validación de que la sucursal pertenece al comercio, con `22023` si no |
| S3 | La emisión ignoraba `merchants.status`; el canje ignoraba el estado actual de la promoción | Ambos comprobados; un comercio suspendido deja de poder emitir |
| S4 | La RLS filtra filas, no columnas: `anon` leía `max_redemptions`, `created_at` y `merchant_id` de toda promoción publicada | `revoke select` + grant por columna en `promotions` y `merchants` |
| S5 | `for all` permitía al owner borrar su propia membership — el índice único exige uno, no prohíbe cero | Políticas `insert`/`update`/`delete` separadas; el delete excluye `role = 'owner'` |
| S6 | `for all` permitía borrar promociones, con cascade sobre los cupones emitidos y no canjeados | Sin política de delete; solo insert y update |
| S7 | `product-coupon.tsx` era código muerto: su `promotionId` era opcional y el único call site no lo pasaba, así que la rama de emisión era inalcanzable | Componente eliminado; el revisor detectó además que duplicaba `coupon-claim.tsx` con manejo divergente |
| S8 | El nav no tenía enlace al marketplace ni al panel: **DESCUBRIR era inalcanzable** | Añadidos `/promociones` y "Mi comercio" |

## Pendientes reconocidos y no resueltos

- **Sin límite de tasa en la emisión.** Cualquier sesión puede emitir; N cuentas pueden agotar el tope de una promoción sin canjear nada. Requiere rate limiting, no está implementado.
- **Sin vía de revocación de un cupón ya emitido.** Una promoción se puede pausar, pero los cupones en circulación no se pueden anular.
- **Migraciones no idempotentes ante esquema preexistente distinto.** Todas son `create ... if not exists`: si una tabla ya existiera con otra forma, el `create` no hace nada y los fallos aparecen después, en silencio. No aplica al despliegue actual (las tablas no existían), pero es una trampa a futuro.
- **`resolveExpiry` topa a 30 días** aunque la promoción dure más. Decisión no documentada en el brief.
- **El segundo proyecto `vwjdfyljacoxwabtfoco`** queda sin tocar, como pediste.

## Lo que los revisores dijeron que no hay que tocar

Agregación de contadores en JS (correcto a esta escala, no convertir a RPC ni a vista materializada); los tres contadores del panel son resultado real del circuito, no analítica especulativa; `/api/promotions` no confía en el `merchantId` del cuerpo — el insert va con el cliente del usuario y RLS lo valida.
