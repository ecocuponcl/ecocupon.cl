#!/bin/bash
# =============================================================================
# 🤖 JIUWENCLAW + ECOCUPÓN - TEST AUTOMATION SCRIPT
# =============================================================================
# Este script valida el puente VPS ↔ Mac ↔ Hardware
# Ejecutar desde el VPS para testear la conexión pública
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# CONFIGURACIÓN
# =============================================================================
CLAW_URL="https://claw.smarterbot.cl"
JIUWEN_URL="https://jiuwen.smarterbot.cl"
NULLCLAW_URL="https://nullclaw.smarterbot.cl"
WEBSOCKET_PATH="/ws"

# =============================================================================
# FUNCIONES
# =============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

# =============================================================================
# TEST 1: DNS RESOLUTION
# =============================================================================

test_dns_resolution() {
    print_header "📍 TEST 1: DNS Resolution"
    
    local failed=0
    
    for domain in claw.smarterbot.cl jiuwen.smarterbot.cl nullclaw.smarterbot.cl; do
        log_info "Resolviendo $domain..."
        
        if nslookup "$domain" > /dev/null 2>&1; then
            ip=$(nslookup "$domain" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
            log_success "$domain → $ip"
        else
            log_error "$domain no resuelve"
            failed=1
        fi
    done
    
    return $failed
}

# =============================================================================
# TEST 2: HTTPS CONNECTIVITY
# =============================================================================

test_https_connectivity() {
    print_header "🔒 TEST 2: HTTPS Connectivity"
    
    local failed=0
    
    # Test Claw Gateway
    log_info "Testing $CLAW_URL..."
    claw_status=$(curl -s -o /dev/null -w "%{http_code}" -k "$CLAW_URL" 2>/dev/null || echo "000")
    if [ "$claw_status" != "000" ]; then
        log_success "$CLAW_URL → HTTP $claw_status"
    else
        log_error "$CLAW_URL → No responde"
        failed=1
    fi
    
    # Test Jiuwen Web UI
    log_info "Testing $JIUWEN_URL..."
    jiuwen_status=$(curl -s -o /dev/null -w "%{http_code}" -k "$JIUWEN_URL" 2>/dev/null || echo "000")
    if [ "$jiuwen_status" != "000" ]; then
        log_success "$JIUWEN_URL → HTTP $jiuwen_status"
    else
        log_error "$JIUWEN_URL → No responde"
        failed=1
    fi
    
    # Test NullClaw MCP
    log_info "Testing $NULLCLAW_URL..."
    nullclaw_status=$(curl -s -o /dev/null -w "%{http_code}" -k "$NULLCLAW_URL" 2>/dev/null || echo "000")
    if [ "$nullclaw_status" != "000" ]; then
        log_success "$NULLCLAW_URL → HTTP $nullclaw_status"
    else
        log_warning "$NULLCLAW_URL → No responde (puede estar inactivo)"
    fi
    
    return $failed
}

# =============================================================================
# TEST 3: WEBSOCKET CONNECTION
# =============================================================================

test_websocket_connection() {
    print_header "🔌 TEST 3: WebSocket Connection"
    
    if ! command -v wscat &> /dev/null; then
        log_warning "wscat no instalado. Instalando..."
        npm install -g wscat 2>/dev/null || {
            log_error "No se pudo instalar wscat"
            return 1
        }
    fi
    
    log_info "Conectando a $CLAW_URL$WEBSOCKET_PATH..."
    
    # Intento de conexión WebSocket (timeout 5s)
    if timeout 5 wscat -c "$CLAW_URL$WEBSOCKET_PATH" -n 2>/dev/null; then
        log_success "WebSocket conectado exitosamente"
        return 0
    else
        log_error "No se pudo conectar al WebSocket"
        return 1
    fi
}

# =============================================================================
# TEST 4: LOCAL SERVICES (MAC)
# =============================================================================

test_local_services() {
    print_header "💻 TEST 4: Local Services (Mac)"
    
    # Check JiuwenClaw Gateway
    log_info "Checking Gateway (port 18789)..."
    if lsof -i :18789 > /dev/null 2>&1; then
        log_success "JiuwenClaw Gateway: RUNNING (18789)"
    else
        log_error "JiuwenClaw Gateway: NOT RUNNING"
    fi
    
    # Check JiuwenClaw Web
    log_info "Checking Web UI (port 5173)..."
    if lsof -i :5173 > /dev/null 2>&1; then
        log_success "JiuwenClaw Web UI: RUNNING (5173)"
    else
        log_error "JiuwenClaw Web UI: NOT RUNNING"
    fi
    
    # Check JiuwenClaw App
    log_info "Checking App Server (port 19000)..."
    if lsof -i :19000 > /dev/null 2>&1; then
        log_success "JiuwenClaw App Server: RUNNING (19000)"
    else
        log_error "JiuwenClaw App Server: NOT RUNNING"
    fi
    
    # Check Cloudflared
    log_info "Checking Cloudflared Tunnel..."
    if pgrep -fa cloudflared > /dev/null 2>&1; then
        log_success "Cloudflared: RUNNING"
    else
        log_error "Cloudflared: NOT RUNNING"
    fi
}

# =============================================================================
# TEST 5: ECOCUPÓN WORKFLOW SIMULATION
# =============================================================================

test_ecocupon_workflow() {
    print_header "♻️ TEST 5: EcoCupón Workflow Simulation"
    
    log_info "Simulando trigger de EcoCupón..."
    
    # Simular payload de n8n → MCP → Claw
    payload='{
        "action": "calibration_mode",
        "target": "home_position",
        "timestamp": "'$(date -Iseconds)'",
        "source": "ecocupon_workflow_test"
    }'
    
    log_info "Payload: $payload"
    
    # Intentar enviar al Gateway (si está disponible)
    if command -v websocat &> /dev/null; then
        log_info "Enviando comando vía WebSocket..."
        echo "$payload" | timeout 3 websocat "$CLAW_URL$WEBSOCKET_PATH" 2>/dev/null && \
            log_success "Comando enviado exitosamente" || \
            log_error "No se pudo enviar el comando"
    else
        log_warning "websocat no disponible. Skip envío de comando."
    fi
}

# =============================================================================
# TEST 6: GITHUB REPO SYNC
# =============================================================================

test_github_sync() {
    print_header "📦 TEST 6: GitHub Repository Sync"
    
    # Check ecocupon.cl
    log_info "Checking ecocupon.cl..."
    eco_commit=$(curl -s https://api.github.com/repos/ecocuponcl/ecocupon.cl/commits/main 2>/dev/null | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$eco_commit" ]; then
        log_success "ecocupon.cl → $eco_commit"
    else
        log_error "No se pudo obtener info de ecocupon.cl"
    fi
    
    # Check demo.ecocupon.cl
    log_info "Checking demo.ecocupon.cl..."
    demo_commit=$(curl -s https://api.github.com/repos/ecocuponcl/demo.ecocupon.cl/commits/main 2>/dev/null | grep -o '"sha":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$demo_commit" ]; then
        log_success "demo.ecocupon.cl → $demo_commit"
    else
        log_error "No se pudo obtener info de demo.ecocupon.cl"
    fi
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    print_header "🚀 JIUWENCLAW + ECOCUPÓN - AUTOMATED TEST SUITE"
    
    echo "Fecha: $(date)"
    echo "Host: $(hostname)"
    echo ""
    
    local total_failed=0
    
    # Ejecutar tests
    test_dns_resolution || ((total_failed++))
    test_https_connectivity || ((total_failed++))
    # test_websocket_connection || ((total_failed++))  # Opcional, requiere wscat
    test_local_services || ((total_failed++))
    test_ecocupon_workflow || true  # No fallar si no hay websocat
    test_github_sync || ((total_failed++))
    
    # Resumen final
    print_header "📊 RESUMEN"
    
    if [ $total_failed -eq 0 ]; then
        log_success "✅ TODOS LOS TESTS PASARON"
        echo ""
        echo "El puente VPS ↔ Mac ↔ Hardware está OPERATIVO"
        echo ""
        echo "Próximos pasos:"
        echo "  1. Conectar hardware robótico (serial/USB)"
        echo "  2. Configurar workflow en n8n"
        echo "  3. Testear con /scan_vehicle desde Telegram"
        return 0
    else
        log_error "❌ $total_failed TEST(S) FALLARON"
        echo ""
        echo "Acciones requeridas:"
        echo "  1. Verificar DNS en Cloudflare Dashboard"
        echo "  2. Asegurar que cloudflared esté corriendo en Mac"
        echo "  3. Configurar hostnames: claw, jiuwen, nullclaw"
        return 1
    fi
}

# =============================================================================
# RUN
# =============================================================================

main "$@"
