# 🔧 claw.smarterbot.cl - Configuration Status

**Updated:** 2026-03-30
**Tunnel ID:** `f8413b6e-87a3-479d-9030-4b706007ee58`
**Status:** Configured ✅ | DNS Propagation ⏳

---

## 📋 Current Configuration

### Cloudflare Tunnel Ingress

```yaml
Hostname                    → Local Service              Status
─────────────────────────────────────────────────────────────────
os.smarterbot.cl            → localhost:80              ⏳ Pending
api.smarterbot.cl           → localhost:3003            ⏳ Pending
api.smarterbot.store        → localhost:3003            ⏳ Pending
nullclaw.smarterbot.cl      → localhost:3000            ⏳ Pending
claw.smarterbot.cl          → localhost:18789           ⏳ Pending (OpenClaw Gateway)
jiuwen.smarterbot.cl        → localhost:5173            ✅ Ready (JiuwenClaw Web UI)
tienda.smarterbot.cl        → localhost:80              ⏳ Pending
odoo.smarterbot.store       → localhost:80              ⏳ Pending
```

---

## 🤖 JiuwenClaw Deployment Status

### Current Active Services (Mac Local)

| Service | Port | Status | URL |
|---------|------|--------|-----|
| **JiuwenClaw Web** | 5173 | ✅ Running | http://localhost:5173 |
| **JiuwenClaw App** | 19000 | ✅ Running | http://localhost:19000 |
| **Browser MCP** | 8940 | ✅ Running | http://localhost:8940/mcp |

### Public URLs (Post-DNS Propagation)

| Subdomain | Purpose | Status |
|-----------|---------|--------|
| `jiuwen.smarterbot.cl` | JiuwenClaw Web UI | ⏳ DNS Propagating |
| `claw.smarterbot.cl` | OpenClaw Gateway (Future) | ⏳ Configured |

---

## 🏗️ Architecture: EcoCupón + JiuwenClaw Integration

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET                                  │
│         (Telegram, Web, Mobile Apps)                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE EDGE                                 │
│    (DDoS Protection, SSL, WAF, Cache)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│           CLOUDFLARE TUNNEL (Encrypted)                      │
│   Tunnel ID: f8413b6e-87a3-479d-9030-4b706007ee58           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│              LOCAL MAC (SmarterOS)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ JiuwenClaw Web UI (localhost:5173)                 │    │
│  │ → Web interface for claw control                   │    │
│  │ → Accessible via: jiuwen.smarterbot.cl             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ JiuwenClaw App Server (localhost:19000)            │    │
│  │ → Agent intelligence & decision making             │    │
│  │ → MCP tools integration                            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ OpenClaw Gateway (localhost:18789) [FUTURE]        │    │
│  │ → Serial/WS control for robotics hardware          │    │
│  │ → Accessible via: claw.smarterbot.cl               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ SmarterOS MCP (localhost:3000)                     │    │
│  │ → NullClaw MCP Server                              │    │
│  │ → Tenant orchestration                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────────┐
│         VPS (Production - Huawei Cloud)                      │
├─────────────────────────────────────────────────────────────┤
│  • n8n Workflows (EcoCupón automation)                      │
│  • Supabase Database (Multi-tenant)                         │
│  • SmarterOS MCP Bridge                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Files

### Cloudflare Tunnel Config

**Location:** `/Users/mac/.cloudflared/config.yml`

```yaml
tunnel: f8413b6e-87a3-479d-9030-4b706007ee58
credentials-file: /Users/mac/.cloudflared/f8413b6e-87a3-479d-9030-4b706007ee58.json
origincert: /Users/mac/.cloudflared/cert.pem

ingress:
  - hostname: os.smarterbot.cl
    service: http://localhost:80
  - hostname: api.smarterbot.cl
    service: http://localhost:3003
  - hostname: api.smarterbot.store
    service: http://localhost:3003
  - hostname: nullclaw.smarterbot.cl
    service: http://localhost:3000
  - hostname: claw.smarterbot.cl
    service: http://localhost:18789
  - hostname: jiuwen.smarterbot.cl
    service: http://localhost:5173
  - hostname: tienda.smarterbot.cl
    service: http://localhost:80
  - hostname: odoo.smarterbot.store
    service: http://localhost:80
  - service: http_status:404
```

---

## 🚀 Deployment Commands

### Start JiuwenClaw Services

```bash
cd /Users/mac/dev/2026/jiuwenclaw

# Activate virtual environment
source .venv/bin/activate

# Start web service
jiuwenclaw-web --host 127.0.0.1 --port 5173 &

# Start app server
jiuwenclaw-app &
```

### Restart Cloudflare Tunnel

```bash
# Kill existing tunnel
pkill -9 cloudflared

# Start with new config
cloudflared tunnel run --config /Users/mac/.cloudflared/config.yml &
```

### Verify Services

```bash
# Check JiuwenClaw Web
curl http://localhost:5173

# Check JiuwenClaw App
curl http://localhost:19000/health

# Check Cloudflare Tunnel
pgrep -fa cloudflared

# Test public URL (after DNS propagation)
curl -I https://jiuwen.smarterbot.cl
```

---

## 📊 DNS Propagation Status

### Expected DNS Records (Cloudflare Dashboard)

| Type | Name | Content | Status |
|------|------|---------|--------|
| CNAME | jiuwen | jiuwen.smarterbot.cl.cdn.cloudflare.net | ⏳ Pending |
| CNAME | claw | claw.smarterbot.cl.cdn.cloudflare.net | ⏳ Pending |
| CNAME | nullclaw | nullclaw.smarterbot.cl.cdn.cloudflare.net | ⏳ Pending |

### Check DNS Propagation

```bash
# macOS
nslookup jiuwen.smarterbot.cl
nslookup claw.smarterbot.cl

# Or use dig
dig jiuwen.smarterbot.cl
dig claw.smarterbot.cl

# Expected: Should resolve to Cloudflare IPs
```

---

## 🧪 Testing Workflow

### 1. Local Testing

```bash
# Test JiuwenClaw Web UI
open http://localhost:5173

# Test API health
curl http://localhost:19000/health
```

### 2. Public URL Testing (After DNS)

```bash
# Test JiuwenClaw Web UI
open https://jiuwen.smarterbot.cl

# Test API via tunnel
curl https://jiuwen.smarterbot.cl/api/health
```

### 3. EcoCupón Integration Test

```bash
# From Telegram (@elcerokmbot)
/scan_vehicle

# Expected flow:
# 1. Telegram → n8n (VPS)
# 2. n8n → SmarterOS MCP
# 3. MCP → JiuwenClaw (Mac)
# 4. JiuwenClaw → Serial Control (Hardware)
```

---

## 🔍 Troubleshooting

### Problem: DNS not resolving

```bash
# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Wait 60 seconds and retry
```

### Problem: Tunnel disconnected

```bash
# Check process
ps aux | grep cloudflared

# Check logs
journalctl -u cloudflared -f

# Restart tunnel
pkill -9 cloudflared
sleep 2
cloudflared tunnel run --config /Users/mac/.cloudflared/config.yml &
```

### Problem: JiuwenClaw not responding

```bash
# Check if services are running
ps aux | grep jiuwenclaw

# Check ports
lsof -i :5173
lsof -i :19000

# Restart services
cd /Users/mac/dev/2026/jiuwenclaw
source .venv/bin/activate
jiuwenclaw-start
```

---

## 📊 Tenant Integration Map

| Tenant | Domain | Local Port | Cloudflare Status |
|--------|--------|------------|-------------------|
| **EcoCupón** | ecocupon.cl | N/A (VPS) | ✅ Production |
| **JiuwenClaw** | jiuwen.smarterbot.cl | 5173 | ⏳ DNS Propagating |
| **OpenClaw Gateway** | claw.smarterbot.cl | 18789 | ⏳ Configured |
| **NullClaw MCP** | nullclaw.smarterbot.cl | 3000 | ⏳ Pending |
| **SmarterOS API** | api.smarterbot.cl | 3003 | ⏳ Pending |

---

## ✅ Next Steps

### Immediate (5-10 min)

1. **Wait for DNS propagation** (30-60 seconds typical)
2. **Test public URLs:**
   ```bash
   curl -I https://jiuwen.smarterbot.cl
   curl -I https://claw.smarterbot.cl
   ```

### Short Term (1 hour)

1. **Start OpenClaw Gateway** on port 18789 (if hardware control needed)
2. **Configure n8n workflow** for EcoCupón → JiuwenClaw integration
3. **Test end-to-end flow** from Telegram to hardware

### Medium Term (1 day)

1. **Setup monitoring** for all tunnels
2. **Configure SSL/TLS** settings in Cloudflare
3. **Add rate limiting** and WAF rules
4. **Deploy OpenClaw Gateway** for serial control

---

## 📞 Support & References

- **Cloudflare Dashboard:** https://one.dash.cloudflare.com/
- **Tunnel ID:** `f8413b6e-87a3-479d-9030-4b706007ee58`
- **Config File:** `/Users/mac/.cloudflared/config.yml`
- **JiuwenClaw Docs:** `/Users/mac/dev/2026/jiuwenclaw/docs/`
- **Local Testing:** http://localhost:5173

---

**Last Updated:** 2026-03-30 05:15 UTC
**Status:** Configuration Complete | DNS Propagating ⏳
