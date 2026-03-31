# 🧹 Limpieza de MCPs - Ecocupon.cl

## ❌ Error: insforge 503

El error `insforge: Failed to fetch backend version: Health check failed with status 503` viene de una configuración **global** del cliente MCP.

---

## 🔧 Solución 1: Limpiar configuración global

### Opción A: Qwen Code / Claude Desktop

Busca y edita el archivo de configuración global:

```bash
# macOS - Qwen/Claude
nano ~/Library/Application\ Support/Qwen/mcp.json
# o
nano ~/.qwen/mcp.json
# o  
nano ~/Library/Application\ Support/Claude/mcp.json
```

**Elimina** cualquier entrada de `insforge` o `insforge-mcp-server`.

### Opción B: VSCode

Si usas VSCode con MCP:

1. `Cmd + Shift + P` → "MCP: Open Configuration"
2. Elimina `insforge` de la lista
3. Guarda y recarga ventana

---

## ✅ MCPs Operativos para Ecocupon.cl

Después de limpiar, tu configuración debería tener solo:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=uyxvzztnsvfcqmgkrnol"
    },
    "smarteros": {
      "command": "node",
      "args": ["./smarteros-mcp/index.js"],
      "env": {
        "SUPABASE_URL": "https://uyxvzztnsvfcqmgkrnol.supabase.co",
        "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    }
  }
}
```

---

## 🧪 Verificar

Después de limpiar:

1. **Reinicia el cliente** (Qwen/Claude/VSCode)
2. **Verifica** que no haya errores 503
3. **Prueba** una tool de SmarterMCP:
   ```
   /llamar analizar_placa con plate_text="ABCD12"
   ```

---

## 📋 MCPs Disponibles

| MCP | Estado | Función |
|-----|--------|---------|
| `supabase` | ✅ Remoto | Database, Storage, Auth |
| `smarteros` | ✅ Local | QR, Placas, Reciclaje, Cupones |
| `insforge` | ❌ 503 | **Eliminar de config global** |
| `github-mcp-server` | ⚠️ Opcional | GitHub (si se usa) |

---

## 🚀 Quick Fix

```bash
# 1. Buscar config global
find ~ -name "mcp.json" 2>/dev/null | grep -v ecocupon

# 2. Editar y eliminar insforge
# 3. Reiniciar cliente
# 4. ¡Listo!
```
