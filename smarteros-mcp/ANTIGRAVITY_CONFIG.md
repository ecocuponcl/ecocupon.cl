# Configuración SmarterMCP para Antigravity

## Copia esto en tu mcp.json de Antigravity

```json
{
  "mcpServers": {
    "smarteros": {
      "command": "node",
      "args": ["/Users/mac/dev/2026/ecocupon.cl/smarteros-mcp/index.js"],
      "env": {
        "SUPABASE_URL": "https://uyxvzztnsvfcqmgkrnol.supabase.co",
        "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eHZ6enRuc3ZmY3FtZ2tybm9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEzMDQ1MywiZXhwIjoyMDg2NzA2NDUzfQ.iITIEcGC-HnhYsgPrEDwboLcHpdh6JkGsYvI4aW1_Sk"
      }
    }
  }
}
```

## Tools Disponibles

### 1. validar_qr
```
/llamar validar_qr con qr_code="ECO-USER-12345"
```

### 2. consultar_saldo
```
/llamar consultar_saldo con user_identifier="usuario@ejemplo.com", identifier_type="email"
```

### 3. registrar_basura (Flujo 1: Basura por foto)
```
/llamar registrar_basura con user_id="uuid", material_type="plastico", weight_kg=2.5
```

### 4. analizar_placa (Flujo 2: Autos/Motos)
```
/llamar analizar_placa con plate_text="ABCD12", source="manual"
```

### 5. registrar_por_placa (Flujo 2: Autos/Motos)
```
/llamar registrar_por_placa con plate="ABCD-12", material_type="vidrio", points=100
```

### 6. emitir_cupon
```
/llamar emitir_cupon con user_id="uuid", coupon_type="descuento_porcentaje", value=20
```

### 7. listar_cupones_activos
```
/llamar listar_cupones_activos con user_id="uuid"
```

### 8. registrar_reciclaje
```
/llamar registrar_reciclaje con user_id="uuid", material_type="papel", weight_kg=1.5
```

## Flujo Completo Ejemplo

### Usuario recicla basura:
1. Usuario: "Quiero reciclar 2kg de plástico"
2. Antigravity: `registrar_basura(user_id="xxx", material_type="plastico", weight_kg=2)`
3. SmarterMCP: Registra en Supabase, suma 100 puntos
4. Antigravity: "¡Registrado! Ganaste 100 puntos"

### Usuario recicla con auto:
1. Usuario: "Tengo una placa ABCD12 con 5kg de vidrio"
2. Antigravity: `analizar_placa(plate_text="ABCD12")` → valida formato
3. Antigravity: `registrar_por_placa(plate="ABCD-12", material_type="vidrio", points=100)`
4. SmarterMCP: Registra evento con placa
5. Antigravity: "¡Auto ABCD-12 registrado! 100 puntos"
