'use strict';

// ---------------------------------------------------------------------------
// GAD (Generative AI Dashboard) — Express Entry Point
// ---------------------------------------------------------------------------
// This file is a pure bootstrap. No business logic lives here.
// Business logic resides in src/controllers/, src/services/, and src/routes/.
// ---------------------------------------------------------------------------

// 1. Environment — load .env before anything else
require('dotenv').config();

// 2. Validate critical secrets early
if (!process.env.GEMINI_API_KEY) {
  console.error(
    JSON.stringify({
      event: 'config_error',
      message: 'GEMINI_API_KEY is not set in environment variables',
      timestamp: new Date().toISOString(),
    })
  );
  process.exit(1);
}

// 3. Core dependencies
const express = require('express');
const compression = require('compression');

// 4. Firebase — initialize once
require('./src/config/firebase.config');

// 5. AI
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 6. Middleware
const corsMiddleware = require('./src/middleware/cors.middleware');
const { generalLimiter } = require('./src/middleware/rateLimit.middleware');

// 7. Express application
const app = express();

// --- Global middleware ---
app.use(compression());
app.use(corsMiddleware);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// --- Route registrations ---
const healthRoutes = require('./src/routes/health.routes');
const artifactRoutes = require('./src/routes/artifacts.routes');
const authRoutes = require('./src/routes/auth.routes');
const aiRoutes = require('./src/routes/ai.routes');
const adminRoutes = require('./src/routes/admin.routes');

app.use('/health', healthRoutes);
app.use('/api/artifacts', artifactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// 9. 404 handler — always returns JSON, never HTML
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// 10. Global error handler
app.use((err, _req, res, _next) => {
  const statusCode = err.status || err.statusCode || 500;
  console.error(
    JSON.stringify({
      event: 'error',
      message: err.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      timestamp: new Date().toISOString(),
    })
  );
  res.status(statusCode).json({
    status: 'error',
    message: statusCode === 500 ? 'Internal server error' : err.message,
  });
});

// 11. Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    JSON.stringify({
      event: 'server_started',
      port: PORT,
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasMapsKey: !!process.env.GOOGLE_MAPS_API_KEY,
      timestamp: new Date().toISOString(),
    })
  );
});

// 12. Export for testing
module.exports = app;
