import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import buildingsRoutes from './routes/buildings.routes.js';
import panelsRoutes from './routes/panels.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import readingsRoutes from './routes/readings.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const app = express();

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

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
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

app.listen(PORT, () => {
    console.log(`
🚀 Dashboard Energy API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:${PORT}
🔧 Environment: ${env.NODE_ENV}
📚 API Base URL: http://localhost:${PORT}/api
❤️  Health Check: http://localhost:${PORT}/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;
