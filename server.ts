/**
 * Dealhunter X - Full-Stack Express Server
 * Serves /api/ideas and /api/health routes, mounting Vite middlewares in dev mode.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleIdeas } from './lib/ideasHandler.ts';
import { handleHealth } from './lib/healthHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Register shared handlers for AI Studio / Express environment
  app.post('/api/ideas', async (req, res) => {
    return handleIdeas(req, res);
  });

  app.get('/api/health', async (req, res) => {
    return handleHealth(req, res);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dealhunter X Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Dealhunter X Server Error]', err);
  process.exit(1);
});
