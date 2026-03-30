#!/bin/bash
# SmarterMCP - Script de Instalación para VPS
# EcoCupon.cl - Smarter SPA
#
# Uso: bash install-vps.sh [SUPABASE_URL] [SUPABASE_KEY]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  SmarterMCP - Instalación en VPS          ║${NC}"
echo -e "${GREEN}║  EcoCupon.cl - Smarter SPA                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Configuración por defecto
DEFAULT_SUPABASE_URL="https://uyxvzztnsvfcqmgkrnol.supabase.co"
INSTALL_DIR="/root/smarteros-runtime/mcp-servers/smartermcp"

# Parámetros opcionales
SUPABASE_URL=${1:-$DEFAULT_SUPABASE_URL}
SUPABASE_KEY=${2:-""}

# Si no se proporcionó la key, solicitarla
if [ -z "$SUPABASE_KEY" ]; then
    echo -e "${YELLOW}⚠️  Se requiere SUPABASE_KEY${NC}"
    echo "Obténla en: https://app.supabase.com/project/uyxvzztnsvfcqmgkrnol/settings/api"
    echo ""
    read -p "Ingresa SUPABASE_KEY: " -s SUPABASE_KEY
    echo ""
fi

# Verificar Node.js
echo -e "${YELLOW}[1/5] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    echo "Instalando Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ Node.js $NODE_VERSION, npm $NPM_VERSION${NC}"

# Crear directorio de instalación
echo -e "${YELLOW}[2/5] Creando directorio de instalación...${NC}"
mkdir -p "$INSTALL_DIR"
echo -e "${GREEN}✓ Directorio: $INSTALL_DIR${NC}"

# Copiar archivos del proyecto local al VPS
echo -e "${YELLOW}[3/5] Copiando archivos...${NC}"
cd "$INSTALL_DIR"

# Crear package.json
cat > package.json << 'EOF'
{
  "name": "smarteros-mcp",
  "version": "1.0.0",
  "description": "SmarterOS MCP Server para Ecocupon.cl",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js"
  },
  "keywords": ["mcp", "smarteros", "ecocupon", "supabase"],
  "author": "Smarter SPA",
  "license": "MIT",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@supabase/supabase-js": "^2.49.0"
  }
}
EOF

# Crear .env
cat > .env << EOF
# SmarterOS MCP Server - Variables de Entorno
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${SUPABASE_KEY}
EOF

echo -e "${GREEN}✓ Archivos creados${NC}"

# Descargar index.js desde GitHub (o copiar localmente)
echo -e "${YELLOW}[4/5] Descargando código del servidor...${NC}"

# NOTA: En producción, esto debería venir de un repo Git
# Por ahora, creamos el archivo inline
cat > index.js << 'INDEXEOF'
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://uyxvzztnsvfcqmgkrnol.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_KEY) {
  console.error("ERROR: SUPABASE_KEY no configurada");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const server = new McpServer({
  name: "smarteros-mcp",
  version: "1.0.0",
  description: "MCP Server para Ecocupon.cl"
});

// Tool: validar_qr
server.tool("validar_qr", "Valida un código QR de usuario", 
  { qr_code: { type: "string", description: "El código QR a validar" } },
  async ({ qr_code }) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, points")
      .eq("qr_code", qr_code)
      .single();
    
    if (error || !data) {
      return { content: [{ type: "text", text: JSON.stringify({ valid: false, message: "QR no encontrado" }) }] };
    }
    
    return { content: [{ type: "text", text: JSON.stringify({ valid: true, user: data }) }] };
  }
);

// Tool: consultar_saldo
server.tool("consultar_saldo", "Consulta el saldo de puntos",
  { user_identifier: { type: "string" }, identifier_type: { type: "string", enum: ["id", "email"] } },
  async ({ user_identifier, identifier_type }) => {
    const query = identifier_type === "id"
      ? supabase.from("users").select("id, email, full_name, points").eq("id", user_identifier)
      : supabase.from("users").select("id, email, full_name, points").eq("email", user_identifier);
    
    const { data, error } = await query.single();
    if (error || !data) {
      return { content: [{ type: "text", text: JSON.stringify({ success: false, message: "Usuario no encontrado" }) }] };
    }
    
    return { content: [{ type: "text", text: JSON.stringify({ success: true, saldo: data.points }) }] };
  }
);

// Tool: registrar_reciclaje
server.tool("registrar_reciclaje", "Registra reciclaje y suma puntos",
  { user_id: { type: "string" }, material_type: { type: "string" }, weight_kg: { type: "number" } },
  async ({ user_id, material_type, weight_kg }) => {
    const points = Math.round(weight_kg * 50);
    await supabase.from("users").update({ points: supabase.raw(`points + ${points}`) }).eq("id", user_id);
    
    return { content: [{ type: "text", text: JSON.stringify({ success: true, points }) }] };
  }
);

// Tool: analizar_placa
server.tool("analizar_placa", "Valida placa patente chilena",
  { plate_text: { type: "string" }, source: { type: "string", enum: ["manual", "ocr"] } },
  async ({ plate_text, source }) => {
    const normalized = plate_text.toUpperCase().trim();
    const patterns = [
      { regex: /^([A-Z]{4})(\d{2})$/, format: "ABCD-12" },
      { regex: /^([A-Z]{3})(\d{2})$/, format: "ABC-12" },
      { regex: /^([A-Z]{2})-?(\d{2})-?(\d{2})$/, format: "AA-12-34" }
    ];
    
    for (const p of patterns) {
      const match = normalized.match(p.regex);
      if (match) {
        return { content: [{ type: "text", text: JSON.stringify({ success: true, plate: normalized, format: p.format }) }] };
      }
    }
    
    return { content: [{ type: "text", text: JSON.stringify({ success: false, message: "Placa inválida" }) }] };
  }
);

// Tool: registrar_por_placa
server.tool("registrar_por_placa", "Registra reciclaje por placa",
  { plate: { type: "string" }, material_type: { type: "string" }, points: { type: "number" } },
  async ({ plate, material_type, points }) => {
    const { data } = await supabase.from("recycling_events")
      .insert({ plate: plate.toUpperCase(), material_type, points: points || 100, status: "completed" })
      .select().single();
    
    return { content: [{ type: "text", text: JSON.stringify({ success: true, event: data }) }] };
  }
);

// Tool: registrar_basura
server.tool("registrar_basura", "Registra basura/residuos",
  { user_id: { type: "string" }, material_type: { type: "string" }, weight_kg: { type: "number" } },
  async ({ user_id, material_type, weight_kg }) => {
    const points = Math.round(weight_kg * 50);
    const { data } = await supabase.from("recycling_events")
      .insert({ user_id, material_type, weight_kg, points, status: "completed" })
      .select().single();
    
    await supabase.from("users").update({ points: supabase.raw(`points + ${points}`) }).eq("id", user_id);
    
    return { content: [{ type: "text", text: JSON.stringify({ success: true, points }) }] };
  }
);

// Tool: emitir_cupon
server.tool("emitir_cupon", "Emite cupón de descuento",
  { user_id: { type: "string" }, coupon_type: { type: "string" }, value: { type: "number" } },
  async ({ user_id, coupon_type, value }) => {
    const code = `ECO-${Date.now().toString(36).toUpperCase()}`;
    const { data } = await supabase.from("coupons")
      .insert({ user_id, code, type: coupon_type, value, status: "active" })
      .select().single();
    
    return { content: [{ type: "text", text: JSON.stringify({ success: true, coupon: data }) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("SmarterOS MCP Server corriendo");
}

main().catch(console.error);
INDEXEOF

echo -e "${GREEN}✓ Servidor creado${NC}"

# Instalar dependencias
echo -e "${YELLOW}[5/5] Instalando dependencias...${NC}"
npm install
echo -e "${GREEN}✓ Dependencias instaladas${NC}"

# Crear servicio systemd
echo ""
echo -e "${YELLOW}Creando servicio systemd...${NC}"
cat > /etc/systemd/system/smartermcp.service << EOF
[Unit]
Description=SmarterOS MCP Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
Environment=PATH=/usr/bin:/usr/local/bin
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=/usr/bin/node ${INSTALL_DIR}/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Habilitar y iniciar servicio
systemctl daemon-reload
systemctl enable smartermcp
systemctl start smartermcp

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Instalación completada                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "Directorio: ${YELLOW}${INSTALL_DIR}${NC}"
echo -e "Estado: ${GREEN}● Activo${NC}"
echo -e "Logs: ${YELLOW}journalctl -u smartermcp -f${NC}"
echo ""
echo -e "${YELLOW}Próximos pasos:${NC}"
echo "1. Configurar Antigravity para conectar al MCP"
echo "2. Agregar en mcp.json del cliente:"
echo ""
echo '   {'
echo '     "mcpServers": {'
echo '       "smarteros": {'
echo '         "command": "node",'
echo '         "args": ["/root/smarteros-runtime/mcp-servers/smartermcp/index.js"]'
echo '       }'
echo '     }'
echo '   }'
echo ""
