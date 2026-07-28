import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { router } from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGIN,
    methods: ['GET', 'POST'],
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
