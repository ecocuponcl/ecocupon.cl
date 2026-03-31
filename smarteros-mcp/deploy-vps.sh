#!/bin/bash
# Script de instalación rápida de SmarterMCP en VPS
# Copia este archivo al VPS y ejecuta: bash deploy-smartermcp-vps.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 SmarterMCP VPS Deploy${NC}"

INSTALL_DIR="/root/smarteros-mcp"
SUPABASE_URL="https://uyxvzztnsvfcqmgkrnol.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eHZ6enRuc3ZmY3FtZ2tybm9sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTEzMDQ1MywiZXhwIjoyMDg2NzA2NDUzfQ.iITIEcGC-HnhYsgPrEDwboLcHpdh6JkGsYvI4aW1_Sk"

# Crear directorio
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Crear package.json
cat > package.json << 'EOF'
{
  "name": "smarteros-mcp",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@supabase/supabase-js": "^2.49.0",
    "dotenv": "^17.3.1",
    "zod": "^4.3.6"
  }
}
EOF

# Crear .env
cat > .env << EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${SUPABASE_KEY}
EOF

# Crear index.js (versión completa con Zod)
curl -sL https://raw.githubusercontent.com/ecocuponcl/ecocupon.cl/main/smarteros-mcp/index.js -o index.js

# Instalar dependencias
echo -e "${YELLOW}Instalando dependencias...${NC}"
npm install --production

# Crear servicio systemd
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

[Install]
WantedBy=multi-user.target
EOF

# Habilitar servicio
systemctl daemon-reload
systemctl enable smartermcp
systemctl start smartermcp

echo -e "${GREEN}✅ SmarterMCP instalado y corriendo${NC}"
echo "Logs: journalctl -u smartermcp -f"
