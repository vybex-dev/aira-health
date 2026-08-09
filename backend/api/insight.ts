import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePreflight } from '../lib/http.js';
import { verifyRequestAuth } from '../lib/firebaseAdmin.js';
import { runCompletion } from '../lib/ai.js';
import { INSIGHT_SYSTEM_PROMPT } from '../lib/prompts.js';
import type { UserProfile } from '../lib/types.js';

const FALLBACK = {
  headline: 'Keep logging to unlock insights',
  body: 'A few more entries will let Aira spot patterns worth knowing about — trends in sleep, mood, or vitals often take three or four days to show up clearly.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await verifyRequestAuth(req.headers.authorization);

    const body = req.body as { recentLogsSummary?: string; profile?: Partial<UserProfile> | null };

    if (!body?.recentLogsSummary?.trim()) {
      res.status(200).json(FALLBACK);
      return;
    }

    const { text } = await runCompletion({
      systemPrompt: INSIGHT_SYSTEM_PROMPT,
      turns: [
        {
          role: 'user',
          content: `Recent self-logged entries (most recent first):\n${body.recentLogsSummary}`,
        },
      ],
      jsonMode: true,
      temperature: 0.6,
    });

    const parsed = safeParseInsight(text);
    res.status(200).json(parsed ?? FALLBACK);
  } catch (err) {
    console.error('[api/insight] error:', err);
    res.status(200).json(FALLBACK);
  }
}

function safeParseInsight(raw: string): { headline: string; body: string } | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    if (!parsed.headline || !parsed.body) return null;
    return { headline: parsed.headline, body: parsed.body };
  } catch {
    return null;
  }
}
