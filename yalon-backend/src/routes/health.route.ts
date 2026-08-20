import { Router } from 'express';

export const healthRouter = Router();

const healthResponse = () => ({
  success: true,
  status: 'ok',
  service: 'yalon-backend',
  timestamp: new Date().toISOString(),
});

// Support both GET / (Render's default uptime check) and GET /health
healthRouter.get('/', (_req, res) => {
  res.status(200).json(healthResponse());
});

healthRouter.get('/health', (_req, res) => {
  res.status(200).json(healthResponse());
});
