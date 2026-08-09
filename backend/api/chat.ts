import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePreflight } from '../lib/http.js';
import { verifyRequestAuth } from '../lib/firebaseAdmin.js';
import { runCompletion } from '../lib/ai.js';
import { buildSystemPrompt, URGENCY_INSTRUCTION } from '../lib/prompts.js';
import { extractUrgency } from '../lib/urgency.js';
import type { ChatTurn, UserProfile } from '../lib/types.js';

const MAX_TURNS = 20;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Auth is verified (and would gate persistence in a fuller implementation);
    // the chat endpoint itself is stateless and doesn't require it to respond.
    await verifyRequestAuth(req.headers.authorization);

    const body = req.body as { messages?: ChatTurn[]; profile?: Partial<UserProfile> | null };
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    if (messages.length === 0) {
      res.status(400).json({ error: 'messages must be a non-empty array' });
      return;
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const trimmedTurns = messages.slice(-MAX_TURNS);

    const systemPrompt = buildSystemPrompt(body.profile) + '\n\n' + URGENCY_INSTRUCTION;

    const { text, provider } = await runCompletion({
      systemPrompt,
      turns: trimmedTurns,
      temperature: 0.5,
    });

    const { text: reply, urgency } = extractUrgency(text, lastUserMessage);

    res.status(200).json({ reply, urgency, provider });
  } catch (err) {
    console.error('[api/chat] error:', err);
    res.status(502).json({
      error: 'AI_UNAVAILABLE',
      message: 'Both AI providers are currently unavailable. Please try again shortly.',
    });
  }
}
