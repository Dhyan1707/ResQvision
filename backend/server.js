import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { envConfig } from './config/env.js';
import { logger } from './utils/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import blueprintRoutes from './routes/blueprintRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration supporting Electron, React, and Unity origins
const allowedOrigins = envConfig.ALLOWED_ORIGINS
  ? envConfig.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Electron file://, Unity native, mobile, curl) or localhost origins
      if (
        !origin ||
        origin === 'null' ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('file://')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS Policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Gzip Compression
app.use(compression());

// HTTP Request Logging
app.use(morgan(envConfig.NODE_ENV === 'production' ? 'combined' : 'dev'));

// JSON Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoints (both /health and /api/health)
const healthHandler = (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'AI Fire Evacuation Simulator API'
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// Global Rate Limiting: 1000 Requests per 15 Minutes (relaxed for desktop client simulation)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/simulation', simulationRoutes);

// 404 Route Not Found Handler
app.use(notFound);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = envConfig.PORT || 5000;
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    logger.info(`Server running in ${envConfig.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;
