# SmarterOS MCP Server para Ecocupon.cl

MCP Server implementando el protocolo **Model Context Protocol** para integrar Ecocupon con clientes MCP como Antigravity, Qwen Code, u otros.

## 🚀 Características

Herramientas disponibles:

| Herramienta | Descripción | Caso de Uso |
|-------------|-------------|-------------|
| `validar_qr` | Valida un código QR de usuario | Login QR en EcoCanasta/EcoCupon |
| `consultar_saldo` | Consulta el saldo de puntos | Ver puntos acumulados |
| `registrar_reciclaje` | Registra reciclaje genérico | Cualquier evento de reciclaje |
| `registrar_basura` | Registra basura/residuos con foto | **Flujo 1: Basura por foto** |
| `registrar_por_placa` | Registra reciclaje por placa | **Flujo 2: Autos/motos por patente** |
| `analizar_placa` | Valida formato de placa patente | OCR o ingreso manual de patente |
| `emitir_cupon` | Emite cupón de descuento | Recompensa por reciclaje |
| `listar_cupones_activos` | Lista cupones activos | Ver cupones disponibles |

## 📋 Dos Flujos Principales

### Flujo 1: Basura/Residuos (Foto)

```
Usuario → Captura foto → registrar_basura() → Puntos
```

```json
{
  "tool": "registrar_basura",
  "arguments": {
    "user_id": "uuid-usuario",
    "material_type": "plastico",
    "weight_kg": 2.5,
    "photo_url": "https://storage.../foto.jpg"
  }
}
```

### Flujo 2: Autos/Motos (Placa Patente)

```
Usuario → Foto placa o texto → analizar_placa() → registrar_por_placa() → Puntos
```

```json
{
  "tool": "analizar_placa",
  "arguments": {
    "plate_text": "ABCD12",
    "source": "ocr"
  }
}
```

```json
{
  "tool": "registrar_por_placa",
  "arguments": {
    "plate": "ABCD-12",
    "material_type": "vidrio",
    "points": 100
  }
}
```

## 📦 Instalación

```bash
cd smarteros-mcp
pnpm install
# o
npm install
```

## ⚙️ Configuración

1. Copia el archivo de entorno:
```bash
cp .env.example .env
```

2. Edita `.env` y configura tus credenciales de Supabase:
```env
SUPABASE_URL=https://uyxvzztnsvfcqmgkrnol.supabase.co
SUPABASE_KEY=tu_service_role_key
```

## 🏃 Ejecución

### Modo desarrollo:
```bash
pnpm dev
# o
npm run dev
```

### Modo producción:
```bash
pnpm start
# o
npm start
```

## 🔌 Conexión desde Antigravity u otro cliente MCP

### Opción 1: Vía Stdio (recomendado para local)

En tu `mcp.json` o configuración del cliente:

```json
{
  "mcpServers": {
    "smarteros": {
      "command": "node",
      "args": ["/ruta/a/ecocupon.cl/smarteros-mcp/index.js"],
      "env": {
        "SUPABASE_URL": "https://uyxvzztnsvfcqmgkrnol.supabase.co",
        "SUPABASE_KEY": "tu_key"
      }
    }
  }
}
```

### Opción 2: VPS - Conexión directa

Si estás corriendo en VPS con transporte HTTP (configuración adicional requerida):

```js
import { MCPClient } from "@modelcontextprotocol/sdk/client";

const client = new MCPClient({
  server: "http://tu-vps.ecocupon.cl:3001"
});

const result = await client.callTool("validar_qr", { 
  qr_code: "QR12345" 
});

console.log(result);
```

## 📋 Ejemplos de Uso

### Validar QR
```json
{
  "tool": "validar_qr",
  "arguments": {
    "qr_code": "ECO-USER-12345"
  }
}
```

### Consultar Saldo
```json
{
  "tool": "consultar_saldo",
  "arguments": {
    "user_identifier": "usuario@ejemplo.com",
    "identifier_type": "email"
  }
}
```

### Registrar Reciclaje
```json
{
  "tool": "registrar_reciclaje",
  "arguments": {
    "user_id": "uuid-del-usuario",
    "material_type": "plastico",
    "weight_kg": 2.5
  }
}
```

### Emitir Cupón
```json
{
  "tool": "emitir_cupon",
  "arguments": {
    "user_id": "uuid-del-usuario",
    "coupon_type": "descuento_porcentaje",
    "value": 20,
    "expires_in_days": 30
  }
}
```

## 🗄️ Requisitos de Base de Datos

El servidor espera las siguientes tablas en Supabase:

### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  qr_code TEXT UNIQUE,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `recycling_transactions`
```sql
CREATE TABLE recycling_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  material_type TEXT NOT NULL,
  weight_kg NUMERIC NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `coupons`
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  min_purchase NUMERIC DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Función RPC para actualizar puntos
```sql
CREATE OR REPLACE FUNCTION increment_user_points(user_id UUID, points_to_add INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE users SET points = points + points_to_add WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

## 🔒 Seguridad

- **Sin JWT**: Este MCP está diseñado para correr en tu VPS controlado
- La comunicación es directa entre el cliente y el servidor
- Usa la **Service Role Key** de Supabase solo en entornos seguros
- Para desarrollo, usa la **Anon Key** con RLS activado

## 📄 Licencia

MIT © 2026 Smarter SPA

---

**Hecho con ❤️ en Santiago, Chile 🇨🇱**
