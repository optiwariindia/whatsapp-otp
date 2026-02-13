import { Router } from 'express';

export const createHealthRoutes = (state) => {
  const router = Router();

  router.get('/health/live', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/health/ready', (_req, res) => {
    if (!state.whatsappReady) {
      return res.status(503).json({ status: 'not_ready', whatsappReady: false });
    }

    return res.json({
      status: 'ready',
      whatsappReady: true,
      connectedAt: state.connectedAt,
    });
  });

  return router;
};
