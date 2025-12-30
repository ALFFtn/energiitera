import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { createWorker } from './worker';

// Routes
import authRoutes from './routes/auth.routes';
import buildingsRoutes from './routes/buildings.routes';
import panelsRoutes from './routes/panels.routes';
import alertsRoutes from './routes/alerts.routes';
import readingsRoutes from './routes/readings.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();
const httpServer = createServer(app);

// Initialize the MQTT Worker
const worker = createWorker();
worker.initializeSocket(httpServer);

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/auth', authRoutes);
app.use('/api', buildingsRoutes);  // Includes /campuses, /zones, /buildings
app.use('/api', panelsRoutes);      // Includes /panels
app.use('/api/alerts', alertsRoutes);
app.use('/api', readingsRoutes);    // Includes /readings, /grid
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = env.PORT;

httpServer.listen(PORT, async () => {
    console.log(`
🚀 Dashboard Energy API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:${PORT}
🔧 Environment: ${env.NODE_ENV}
📚 API Base URL: http://localhost:${PORT}/api
🔌 Socket.io: ws://localhost:${PORT}
❤️  Health Check: http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

    // Start MQTT Worker (will connect to broker if available)
    try {
        await worker.start();
    } catch (error) {
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

export default app;
