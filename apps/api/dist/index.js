"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const worker_1 = require("./worker");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const buildings_routes_1 = __importDefault(require("./routes/buildings.routes"));
const panels_routes_1 = __importDefault(require("./routes/panels.routes"));
const alerts_routes_1 = __importDefault(require("./routes/alerts.routes"));
const readings_routes_1 = __importDefault(require("./routes/readings.routes"));
const analytics_routes_1 = __importDefault(require("./routes/analytics.routes"));
const weather_routes_1 = __importDefault(require("./routes/weather.routes"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Initialize the MQTT Worker
const worker = (0, worker_1.createWorker)();
worker.initializeSocket(httpServer);
// CORS
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// Security middleware - configured for API (cross-origin) use
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Not needed for JSON API
}));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check with worker status
app.get('/health', (_req, res) => {
    const workerStatus = worker.getStatus();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        worker: workerStatus,
    });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api', buildings_routes_1.default); // Includes /campuses, /zones, /buildings
app.use('/api', panels_routes_1.default); // Includes /panels
app.use('/api/alerts', alerts_routes_1.default);
app.use('/api', readings_routes_1.default); // Includes /readings, /grid
app.use('/api/analytics', analytics_routes_1.default);
app.use('/api/weather', weather_routes_1.default);
// Error handling
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = env_1.env.PORT;
httpServer.listen(PORT, '0.0.0.0', async () => {
    // Get local IP for network access
    const { networkInterfaces } = await import('os');
    const nets = networkInterfaces();
    let localIP = 'localhost';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
            if (net.family === 'IPv4' && !net.internal) {
                localIP = net.address;
                break;
            }
        }
    }
    console.log(`
🚀 Dashboard Energy API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Local:   http://localhost:${PORT}
📡 Network: http://${localIP}:${PORT}
🔧 Environment: ${env_1.env.NODE_ENV}
📚 API Base URL: http://${localIP}:${PORT}/api
🔌 Socket.io: ws://${localIP}:${PORT}
❤️  Health Check: http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
    // Start MQTT Worker (will connect to broker if available)
    try {
        await worker.start();
    }
    catch (error) {
        console.log('⚠️ MQTT broker not available - worker running in standalone mode');
        console.log('   To enable real-time features, start a MQTT broker on localhost:1883');
    }
});
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    worker.stop();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    worker.stop();
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
exports.default = app;
//# sourceMappingURL=index.js.map