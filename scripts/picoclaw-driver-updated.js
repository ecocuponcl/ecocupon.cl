// =============================================================================
// PicoClaw Driver API - Con Landing Page
// =============================================================================
// Copiar este archivo a: /root/smarteros-runtime/driver-picoclaw/src/index.js
// =============================================================================

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 18790;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Estado del driver (simulado)
let driverState = {
    connected: true,
    ready: true,
    current_action: null,
    hardware: {
        position: { x: 0, y: 0, z: 0 },
        gripper_open: true,
        temperature: 25,
        error: null
    }
};

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        driver: driverState,
        timestamp: new Date().toISOString()
    });
});

// API v1 endpoints
app.post('/api/v1/action/grab', (req, res) => {
    const { action_id, command, params, timeout } = req.body;
    
    if (!action_id || !command) {
        return res.status(400).json({
            error: 'BAD_REQUEST',
            message: 'action_id y command son requeridos'
        });
    }
    
    // Simular ejecución de acción
    driverState.current_action = {
        id: action_id,
        command,
        params,
        status: 'executing',
        started_at: new Date().toISOString()
    };
    
    res.json({
        status: 'executing',
        action_id,
        message: 'Acción aceptada - iniciando ejecución'
    });
});

app.get('/api/v1/action/status/:id', (req, res) => {
    const { id } = req.params;
    
    if (driverState.current_action && driverState.current_action.id === id) {
        res.json({
            action_id: id,
            status: driverState.current_action.status,
            action: driverState.current_action
        });
    } else {
        res.status(404).json({
            error: 'NOT_FOUND',
            message: 'Acción no encontrada'
        });
    }
});

app.post('/api/v1/hardware/calibrate', (req, res) => {
    if (!driverState.connected) {
        return res.status(500).json({
            error: 'INTERNAL_ERROR',
            message: 'driverState is not defined'
        });
    }
    
    res.json({
        status: 'calibrating',
        message: 'Iniciando calibración de hardware'
    });
});

// 404 handler para API
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Endpoint no encontrado'
    });
});

// Root endpoint - Sirve la landing page (ya está manejado por express.static)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🤖 PicoClaw Driver API running on port ${PORT}`);
    console.log(`📍 Health: http://localhost:${PORT}/health`);
    console.log(`🏠 Landing: http://localhost:${PORT}/`);
});
