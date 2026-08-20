import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export const app = express();

// Build the origin allowlist from the env var.
// ALLOWED_ORIGIN can be a single origin, a comma-separated list of origins,
// or '*' for development. Examples:
//   ALLOWED_ORIGIN=https://yalon.netlify.app
//   ALLOWED_ORIGIN=https://yalon.netlify.app,https://admin.yalon.com
const rawOrigins = env.ALLOWED_ORIGIN.split(',').map((o: string) => o.trim());
const allowedOrigins: string[] | '*' =
  rawOrigins.length === 1 && rawOrigins[0] === '*' ? '*' : rawOrigins;

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));

// --- Routes ---
app.use(router);

// --- 404 fallback ---
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Not found.' });
});

// --- Centralized error handler (must be last) ---
app.use(errorHandler);
