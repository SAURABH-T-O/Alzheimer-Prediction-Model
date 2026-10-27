import 'dotenv/config';

import cors from 'cors';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { existsSync } from 'node:fs';

import { predictionRouter } from './routes/predictionRoutes.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const currentDirectory = dirname(fileURLToPath(import.meta.url));
const frontendBuild = resolve(currentDirectory, '../frontend/dist');

app.disable('x-powered-by');
app.use(cors({ origin: frontendOrigin, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.use(express.json({ limit: '32kb' }));

app.get('/api/health', (_request, response) => {
  response.json({
    success: true,
    status: 'healthy',
  });
});

app.use('/api', predictionRouter);

if (existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
}

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'The request body is not valid JSON.' },
    });
  }

  const status = Number(error.status) || 500;
  return response.status(status).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: status < 500 ? error.message : 'An unexpected server error occurred.',
    },
  });
});

app.listen(port, () => {
  console.log(`AlzAI Express API listening on http://127.0.0.1:${port}`);
});
