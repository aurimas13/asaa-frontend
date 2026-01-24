import { Router } from 'express';
import { supabase } from '../config/supabase.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: error ? 'disconnected' : 'connected',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});
