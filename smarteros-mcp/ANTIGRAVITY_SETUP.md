# Integración SmarterMCP + Antigravity para Ecocupon.cl

## 🎯 Configuración para Antigravity

### Opción 1: SmarterMCP Local (Desarrollo)

Si estás desarrollando localmente en tu MacBook:

```json
{
  "mcpServers": {
    "smarteros": {
      "command": "node",
      "args": ["/Users/mac/dev/2026/ecocupon.cl/smarteros-mcp/index.js"],
      "env": {
        "SUPABASE_URL": "https://uyxvzztnsvfcqmgkrnol.supabase.co",
        "SUPABASE_KEY": "tu_service_role_key_aqui"
      }
    }
  }
}
```

### Opción 2: SmarterMCP en VPS (Producción)

Si desplegaste en tu VPS con el script `install-vps.sh`:

```json
{
  "mcpServers": {
    "smarteros": {
      "command": "ssh",
      "args": [
        "root@tu-vps.ecocupon.cl",
        "node /root/smarteros-runtime/mcp-servers/smartermcp/index.js"
      ],
      "env": {
        "SUPABASE_URL": "https://uyxvzztnsvfcqmgkrnol.supabase.co"
      }
    }
  }
}
```

---

## 🔌 Tools Disponibles para Antigravity

### 1. `validar_qr` - Login QR

**Uso en Antigravity:**
```
/llamar validar_qr con qr_code="ECO-USER-12345"
```

**Respuesta:**
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "full_name": "Nombre Usuario",
    "points": 500
  }
}
```

---

### 2. `consultar_saldo` - Ver Puntos

**Uso en Antigravity:**
```
/llamar consultar_saldo con user_identifier="usuario@ejemplo.com", identifier_type="email"
```

**Respuesta:**
```json
{
  "success": true,
  "saldo": {
    "points": 500
  }
}
```

---

### 3. `registrar_basura` - Flujo Basura (Foto)

**Uso en Antigravity:**
```
/llamar registrar_basura con user_id="uuid", material_type="plastico", weight_kg=2.5
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Basura registrada exitosamente",
  "event": {
    "id": "uuid",
    "material_type": "plastico",
    "weight_kg": 2.5,
    "points": 125
  }
}
```

---

### 4. `analizar_placa` - Validar Patente

**Uso en Antigravity:**
```
/llamar analizar_placa con plate_text="ABCD12", source="manual"
```

**Respuesta:**
```json
{
  "success": true,
  "plate": "ABCD-12",
  "format": "ABCD-12",
  "message": "Placa válida"
}
```

---

### 5. `registrar_por_placa` - Flujo Auto/Moto

**Uso en Antigravity:**
```
/llamar registrar_por_placa con plate="ABCD-12", material_type="vidrio", points=100
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Reciclaje registrado por placa",
  "event": {
    "id": "uuid",
    "plate": "ABCD-12",
    "material_type": "vidrio",
    "points": 100
  }
}
```

---

### 6. `emitir_cupon` - Recompensa

**Uso en Antigravity:**
```
/llamar emitir_cupon con user_id="uuid", coupon_type="descuento_porcentaje", value=20
```

**Respuesta:**
```json
{
  "success": true,
  "coupon": {
    "id": "uuid",
    "code": "ECO-ABC123",
    "type": "descuento_porcentaje",
    "value": 20
  }
}
```

---

## 📋 Ejemplo de Flujo Completo en Antigravity

### Escenario: Usuario recicla basura

```
1. Usuario: "Quiero registrar reciclaje de basura"
2. Antigravity: Pide foto y tipo de material
3. Usuario: Sube foto, dice "2kg de plástico"
4. Antigravity: Llama registrar_basura()
5. SmarterMCP: Registra en Supabase, suma 100 puntos
6. Antigravity: Confirma "¡Registrado! Ganaste 100 puntos"
7. Antigravity: Pregunta "¿Quieres un cupón?"
8. Usuario: "Sí"
9. Antigravity: Llama emitir_cupon()
10. SmarterMCP: Crea cupón ECO-XYZ789
11. Antigravity: Muestra cupón al usuario
```

### Escenario: Usuario recicla con auto

```
1. Usuario: "Voy a llevar residuos en mi auto"
2. Antigravity: Pide placa patente
3. Usuario: "ABCD12" (o sube foto de placa)
4. Antigravity: Llama analizar_placa()
5. SmarterMCP: Valida formato, retorna "ABCD-12"
6. Antigravity: Confirma placa
7. Usuario: "Son 5kg de vidrio"
8. Antigravity: Llama registrar_por_placa()
9. SmarterMCP: Registra evento con placa, suma puntos
10. Antigravity: Confirma registro
```

---

## 🔧 Comandos Útiles

### Ver logs del servidor (VPS):
```bash
journalctl -u smartermcp -f
```

### Reiniciar servicio (VPS):
```bash
systemctl restart smartermcp
```

### Probar localmente:
```bash
cd /Users/mac/dev/2026/ecocupon.cl/smarteros-mcp
SUPABASE_KEY=tu_key node index.js
```

---

## 📊 Tabla de Herramientas BOLT/Antigravity

| Skill BOLT | Tool MCP | Parámetros | Retorna |
|------------|----------|------------|---------|
| `validar_qr` | `validar_qr` | `qr_code` | user info |
| `consultar_saldo` | `consultar_saldo` | `user_identifier`, `identifier_type` | puntos |
| `registrar_basura` | `registrar_basura` | `user_id`, `material_type`, `weight_kg` | puntos, event |
| `analizar_placa` | `analizar_placa` | `plate_text`, `source` | plate, format |
| `registrar_por_placa` | `registrar_por_placa` | `plate`, `material_type`, `points` | event |
| `emitir_cupon` | `emitir_cupon` | `user_id`, `coupon_type`, `value` | coupon code |

---

## ✅ Checklist de Integración

- [ ] SmarterMCP instalado (local o VPS)
- [ ] `SUPABASE_KEY` configurada
- [ ] `mcp.json` actualizado en Antigravity
- [ ] Servicio corriendo (`systemctl status smartermcp`)
- [ ] Tools probadas individualmente
- [ ] Flujos completos verificados

---

**Hecho con ❤️ en Santiago, Chile 🇨🇱**
© 2026 Smarter SPA
