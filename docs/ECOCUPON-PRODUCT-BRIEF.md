# Brief de producto — EcoCupon.cl

**Versión:** 2 · 2026-11-09
**Estándar:** Heilmeier Catechism
**Cambio respecto de la v1:** responde las preguntas que faltaban. Los valores que nadie ha medido se marcan como **por medir** — no se rellenan con supuestos.

---

## 1. Objetivos

Que un comercio pequeño de Chile consiga que un cliente vuelva una segunda vez, y pueda comprobarlo.

El circuito es: el comercio publica una promoción → un consumidor la encuentra y obtiene un cupón único → el comercio lo valida en el mesón y queda registrado. Nada más.

## 2. Estado del arte

**Por completar antes de aprobar.** El brief v1 no nombraba un solo competidor y con esto no se puede sostener que haya algo nuevo. Lo que se sabe hoy, sin adornos:

- El consumidor chileno ya tiene descuentos por tarjeta bancaria, programas de supermercado y agregadores de ofertas.
- El comercio pequeño ya descuenta a mano, por redes sociales o por WhatsApp.
- La categoría tiene cadáveres conocidos fuera de Chile (cuponeras de descuento profundo). No se ha investigado aún si el patrón aplica en Chile.

**Acción:** nombrar 3 competidores reales del mercado chileno, con su modelo de precio, antes de aprobar. Es trabajo de una tarde y bloquea el resto.

## 3. Enfoque nuevo

Solo uno, y es pequeño: **el cupón no se puede falsificar.** El esquema anterior calculaba el código en el navegador a partir del producto y el descuento, así que cualquiera podía derivar los cupones del resto del catálogo. Ahora el token se genera en el servidor, solo se persiste su hash, y el canje es un `UPDATE` condicional en la base — no una comprobación en el código de la aplicación que alguien pueda olvidar.

Lo demás (marketplace, panel, métricas) no es nuevo. Es la tabla de apuestas de la categoría.

## 4. Impacto

**Quién paga:** todavía no lo sabemos, y es la pregunta abierta más importante del proyecto (ver §5).

**Por qué:** el brief v1 asumía que el comercio compra herramientas de marketing. Un local de tres personas donde el dueño atiende el mesón no tiene tiempo de administrar campañas, y "sacar la marca EcoCupon del cupón" no es un dolor que haya sentido nunca. Si el comprador es el dueño, lo que compra es **resultado**, no trabajo.

**Por medir:** si el dolor es recompra o es caja. La prueba más barata son dos preguntas antes de escribir más código — *"¿pagarías $10.000 al mes por saber quién te compró dos veces?"* frente a *"¿pagarías por llenar el martes entre 10 y 13h?"*. Si gana la segunda, el producto es otro.

## 5. Riesgos

| Riesgo | Por qué importa |
|---|---|
| **Arranque en frío** | El marketplace no sirve sin comercios y los comercios no se quedan sin consumidores. El brief v1 no decía quién llega primero. |
| **Diagnóstico equivocado** | Si el problema del comercio es caja y no recompra, los descuentos erosionan margen y atraen comprador-de-oferta. El producto empeora la situación. |
| **Impuesto operativo en el mesón** | Validar un QR con cola delante es fricción real. Si el cajero deja de escanear, el ciclo se rompe en el paso 4 y la métrica que se vende deja de ser cierta. |
| **Canibalización por cadenas** | Al entrar una cadena, su presupuesto vuelve invisible al almacén de barrio — que es a quien se monetiza. |
| **Reseñas en Google** | Ligar la solicitud de reseña al canje es *review gating* por proximidad. Expone al comercio a suspensión del perfil y a la plataforma como responsable. Los flujos deben ir separados. |
| **Responsabilidad en caja** | No está definido quién responde si el comercio rechaza el descuento. Se vende confianza al consumidor sin obligar a nadie. |

## 6. Costo

**Por medir.** No hay ninguna cifra de costo en el brief v1, y no se va a inventar una.

Lo que sí se sabe:

- Infraestructura: cae dentro del plan gratuito de Supabase y Vercel al volumen actual (3 usuarios, 29 filas).
- Lo caro no es el cómputo, es la **adquisición de comercios**. Un marketplace de dos lados se muere de falta de oferta, no de falta de servidores.
- El plan Gratis tal como estaba redactado (validación QR sin límite de canjes) es un validador gratuito indefinido. Hay que fijar el número de canjes a partir del cual conviene pagar.

## 7. Plazos

**Por definir con el dueño.** Lo que se puede decir: el circuito mínimo son 5 migraciones ya escritas y 3 pantallas. Con acceso a la base, es trabajo de días, no de meses.

## 8. Métricas y exámenes

Lo que hay que medir para saber si esto funciona:

| Examen | Umbral |
|---|---|
| Canjes por semana por comercio, a 30 días | Si no supera cierto mínimo, el modelo no escala |
| Tasa de recompra del mismo consumidor a 30 días | El único número que valida el nombre del producto |
| Conversión Gratis → Pro | Debe cubrir el costo de servir a los gratis |
| Comercios que siguen publicando al mes 2 | La retención importa más que el alta |

Los umbrales concretos los fija el dueño con datos del piloto. Sin piloto no hay umbral honesto.

## 9. Alcance

**Dentro:** PUBLICAR → DESCUBRIR → VALIDAR.

**Fuera, explícitamente:** NFC, motor de campañas, motor de fidelización, multi-sucursal con interfaz, analítica avanzada, integraciones futuras. No se construyen hasta que el circuito mínimo tenga comercios usándolo.

## 10. Lo que el brief v1 tenía bien

- Cumplimiento de reseñas: la invitación voluntaria, sin recompensa y sin condicionar el cupón. El diseño es correcto y no cede nada evitable.
- No exigir instalar una aplicación al consumidor.
- La marca no depende de ningún sector.

## 11. Reencuadre a considerar

El dolor de reputación en Google Business Profile —que un negocio aparezca bien cuando alguien lo busca— es **la cuña más pagable del documento** y estaba presentada como accesorio. Vale la pena evaluarla como producto principal antes de invertir en el marketplace completo.
