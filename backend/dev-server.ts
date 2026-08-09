import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { VercelRequest, VercelResponse } from '@vercel/node';

import chatHandler from './api/chat.js';
import triageHandler from './api/triage.js';
import insightHandler from './api/insight.js';

const app = express();
app.use(cors());
app.use(express.json());

// Adapts our Vercel-style (req, res) handlers to run under Express for local dev.
function adapt(handler: (req: VercelRequest, res: VercelResponse) => Promise<void>) {
  return (req: express.Request, res: express.Response) =>
    handler(req as unknown as VercelRequest, res as unknown as VercelResponse);
}

app.post('/api/chat', adapt(chatHandler));
app.post('/api/triage', adapt(triageHandler));
app.post('/api/insight', adapt(insightHandler));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    firebaseAdminConfigured: Boolean(
      process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY
    ),
  });
});

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`Aira backend dev server running at http://localhost:${PORT}`);
  console.log(`  GROQ_API_KEY:    ${process.env.GROQ_API_KEY ? 'set' : 'MISSING'}`);
  console.log(`  GEMINI_API_KEY:  ${process.env.GEMINI_API_KEY ? 'set' : 'MISSING'}`);
});
