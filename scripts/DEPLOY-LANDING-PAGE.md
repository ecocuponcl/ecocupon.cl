# 🚀 DEPLOYMENT: Landing Page PicoClaw Driver

**Fecha:** 2026-03-30
**Objetivo:** Agregar landing page en `https://claw.smarterbot.cl/`

---

## 📋 PASOS PARA DEPLOYMENT EN VPS

### Opción 1: Deployment Automático (Recomendado)

```bash
# 1. Conectarse al VPS
ssh root@89.116.23.167

# 2. Ir al directorio del driver
cd /root/smarteros-runtime/driver-picoclaw

# 3. Crear backup del código actual
cp src/index.js src/index.js.backup

# 4. Crear directorio public
mkdir -p public

# 5. Copiar los archivos desde tu Mac (en otra terminal):
#    scp picoclaw-landing-page.html root@89.116.23.167:/root/smarteros-runtime/driver-picoclaw/public/index.html
#    scp picoclaw-driver-updated.js root@89.116.23.167:/root/smarteros-runtime/driver-picoclaw/src/index.js

# 6. Reiniciar el servicio
systemctl restart picoclaw-driver

# 7. Verificar estado
systemctl status picoclaw-driver

# 8. Testear
curl https://claw.smarterbot.cl/
curl https://claw.smarterbot.cl/health
```

---

### Opción 2: Deployment Manual (Paso a Paso)

#### Paso 1: Crear directorio public

```bash
mkdir -p /root/smarteros-runtime/driver-picoclaw/public
```

#### Paso 2: Crear landing page

```bash
cat > /root/smarteros-runtime/driver-picoclaw/public/index.html << 'HTML_EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PicoClaw Driver API - SmarterOS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid #0f3460;
        }
        h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #e94560, #ff6b6b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle { color: #8b8b8b; font-size: 1.1rem; }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: #00d26a;
            color: #000;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9rem;
            margin-top: 15px;
        }
        .card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            border: 1px solid #0f3460;
        }
        .card h2 { font-size: 1.5rem; margin-bottom: 20px; color: #e94560; }
        .endpoint {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
            border-left: 4px solid #e94560;
        }
        .endpoint-method {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 0.85rem;
            font-weight: bold;
            margin-right: 10px;
        }
        .method-get { background: #00d26a; color: #000; }
        .method-post { background: #e94560; color: #fff; }
        .endpoint-path { color: #fff; font-size: 0.95rem; }
        .endpoint-desc { color: #8b8b8b; font-size: 0.85rem; margin-top: 8px; }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .info-item {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        .info-label { color: #8b8b8b; font-size: 0.85rem; margin-bottom: 5px; }
        .info-value { font-size: 1.2rem; font-weight: bold; color: #00d26a; }
        .links {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        .links a {
            display: inline-block;
            padding: 12px 24px;
            background: #e94560;
            color: #fff;
            text-decoration: none;
            border-radius: 8px;
        }
        .links a.secondary { background: #0f3460; }
        footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #0f3460;
            color: #8b8b8b;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 PicoClaw Driver API</h1>
            <p class="subtitle">SmarterOS - Control de Hardware Robótico</p>
            <span id="status-badge" class="status-badge">● OPERATIVO</span>
        </header>

        <div class="card">
            <h2>📊 Estado del Sistema</h2>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Driver</div>
                    <div class="info-value" id="driver-status">--</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Hardware</div>
                    <div class="info-value" id="hardware-status-text">--</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Gripper</div>
                    <div class="info-value" id="gripper-status">--</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Temperatura</div>
                    <div class="info-value" id="temp-status">--</div>
                </div>
            </div>
        </div>

        <div class="card">
            <h2>🔌 Endpoints Disponibles</h2>
            <div class="endpoint">
                <span class="endpoint-method method-get">GET</span>
                <span class="endpoint-path">/health</span>
                <div class="endpoint-desc">Verifica el estado de salud del driver y hardware</div>
            </div>
            <div class="endpoint">
                <span class="endpoint-method method-post">POST</span>
                <span class="endpoint-path">/api/v1/action/grab</span>
                <div class="endpoint-desc">Ejecuta una acción de movimiento o agarre de la garra</div>
            </div>
            <div class="endpoint">
                <span class="endpoint-method method-get">GET</span>
                <span class="endpoint-path">/api/v1/action/status/:id</span>
                <div class="endpoint-desc">Consulta el estado de una acción en ejecución</div>
            </div>
            <div class="endpoint">
                <span class="endpoint-method method-post">POST</span>
                <span class="endpoint-path">/api/v1/hardware/calibrate</span>
                <div class="endpoint-desc">Inicia el proceso de calibración del hardware</div>
            </div>
        </div>

        <div class="card">
            <h2>📚 Documentación</h2>
            <div class="links">
                <a href="/health" target="_blank">Test Health</a>
                <a href="https://github.com/ecocuponcl/ecocupon.cl" target="_blank" class="secondary">GitHub</a>
            </div>
        </div>

        <footer>
            <p>PicoClaw Driver v1.0 • SmarterOS v3.0 • EcoCupón ♻️</p>
        </footer>
    </div>

    <script>
        async function fetchStatus() {
            try {
                const response = await fetch('/health');
                const data = await response.json();
                document.getElementById('driver-status').textContent = data.driver.connected ? '● Conectado' : '○ Desconectado';
                document.getElementById('hardware-status-text').textContent = data.driver.ready ? '● Ready' : '○ Not Ready';
                document.getElementById('gripper-status').textContent = data.driver.hardware.gripper_open ? '○ Abierto' : '● Cerrado';
                document.getElementById('temp-status').textContent = data.driver.hardware.temperature + '°C';
            } catch (error) {
                document.getElementById('status-badge').textContent = '● SIN CONEXIÓN';
            }
        }
        fetchStatus();
        setInterval(fetchStatus, 10000);
    </script>
</body>
</html>
HTML_EOF
```

#### Paso 3: Actualizar el driver

```bash
# Backup primero
cp /root/smarteros-runtime/driver-picoclaw/src/index.js \
   /root/smarteros-runtime/driver-picoclaw/src/index.js.backup

# Crear nuevo index.js (copiar el contenido de picoclaw-driver-updated.js)
```

#### Paso 4: Reiniciar servicio

```bash
systemctl restart picoclaw-driver
systemctl status picoclaw-driver
```

---

## 🧪 VERIFICACIÓN

### Test desde VPS

```bash
# Test root
curl https://claw.smarterbot.cl/

# Test health
curl https://claw.smarterbot.cl/health

# Ver logs
journalctl -u picoclaw-driver -f
```

### Test desde Mac Local

```bash
# Abrir en browser
open https://claw.smarterbot.cl/

# Test endpoints
curl https://claw.smarterbot.cl/health
```

---

## 🔄 ROLLBACK (si algo sale mal)

```bash
# Restaurar backup
cp /root/smarteros-runtime/driver-picoclaw/src/index.js.backup \
   /root/smarteros-runtime/driver-picoclaw/src/index.js

# Reiniciar
systemctl restart picoclaw-driver
```

---

## ✅ CHECKLIST

- [ ] Backup del código actual creado
- [ ] Directorio `public/` creado
- [ ] `index.html` copiado
- [ ] `index.js` actualizado
- [ ] Servicio reiniciado
- [ ] Health endpoint funciona
- [ ] Landing page visible en browser
- [ ] Logs sin errores

---

**Documentación:** [`CLAW-OPERATIONAL-STATUS.md`](https://github.com/ecocuponcl/ecocupon.cl/blob/main/CLAW-OPERATIONAL-STATUS.md)
