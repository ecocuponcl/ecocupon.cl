#!/bin/bash
# =============================================================================
# 🚀 PicoClaw Landing Page Deployment Script
# =============================================================================
# Este script despliega la landing page en el root del PicoClaw Driver
# Ejecutar en el VPS como root
# =============================================================================

set -e

echo "═══════════════════════════════════════════════════════════"
echo "  🤖 PicoClaw Landing Page - Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Directorio del driver
DRIVER_DIR="/root/smarteros-runtime/driver-picoclaw"
PUBLIC_DIR="$DRIVER_DIR/public"

echo "[1/5] Creando directorio public..."
mkdir -p "$PUBLIC_DIR"

echo "[2/5] Copiando landing page..."
# El archivo HTML debe estar en el mismo directorio que este script
cp "$(dirname "$0")/picoclaw-landing-page.html" "$PUBLIC_DIR/index.html"

echo "[3/5] Verificando archivo..."
if [ -f "$PUBLIC_DIR/index.html" ]; then
    echo "✓ Landing page copiada exitosamente"
else
    echo "✗ Error: No se pudo copiar la landing page"
    exit 1
fi

echo "[4/5] Actualizando permisos..."
chmod 644 "$PUBLIC_DIR/index.html"

echo "[5/5] Reiniciando servicio..."
systemctl restart picoclaw-driver

sleep 3

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ Deployment Completado"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📍 URL: https://claw.smarterbot.cl/"
echo ""
echo "🧪 Test endpoints:"
echo "   curl https://claw.smarterbot.cl/"
echo "   curl https://claw.smarterbot.cl/health"
echo ""
echo "📊 Ver estado:"
echo "   systemctl status picoclaw-driver"
echo ""
echo "📝 Ver logs:"
echo "   journalctl -u picoclaw-driver -f"
echo ""
