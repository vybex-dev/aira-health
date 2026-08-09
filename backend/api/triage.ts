import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePreflight } from '../lib/http.js';
import { verifyRequestAuth } from '../lib/firebaseAdmin.js';
import { runCompletion } from '../lib/ai.js';
import { buildSystemPrompt, TRIAGE_SYSTEM_SUFFIX } from '../lib/prompts.js';
import type { TriageResult, UserProfile } from '../lib/types.js';

const EMERGENCY_PATTERN =
  /\b(chest pain|can'?t breathe|cannot breathe|difficulty breathing|suicidal|kill myself|severe bleeding|stroke|unconscious|not breathing|anaphylaxis|overdose)\b/i;

const FALLBACK_RESULT: TriageResult = {
  urgency: 'moderate',
  summary: "I couldn't complete a full assessment right now, so please treat this as unresolved.",
  possibleFactors: [],
  selfCareSteps: [],
  seekCareIf: ['Any worsening of symptoms', 'New or severe pain', 'Difficulty breathing'],
  disclaimer: 'This is general wellness information, not a medical diagnosis. If you\'re worried, contact a healthcare professional.',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await verifyRequestAuth(req.headers.authorization);

    const body = req.body as {
      symptom?: string;
      severity?: number;
      durationHours?: number;
      profile?: Partial<UserProfile> | null;
    };

    if (!body?.symptom) {
      res.status(400).json({ error: 'symptom is required' });
      return;
    }

    // Deterministic safety net: obvious emergency phrasing skips the model
    // entirely and returns an immediate urgent result.
    if (EMERGENCY_PATTERN.test(body.symptom)) {
      res.status(200).json({
        urgency: 'urgent',
        summary: 'What you\'ve described can be a sign of a medical emergency.',
        possibleFactors: [],
        selfCareSteps: [],
        seekCareIf: ['This applies now — contact emergency services immediately.'],
        disclaimer: 'This is general wellness information, not a medical diagnosis. Call your local emergency number now.',
      } satisfies TriageResult);
      return;
    }

    const systemPrompt = buildSystemPrompt(body.profile) + '\n\n' + TRIAGE_SYSTEM_SUFFIX;
    const userTurn = `Symptom: ${body.symptom}\nSeverity (1-10): ${body.severity ?? 'not specified'}\nDuration: ${
      body.durationHours ? `${body.durationHours} hours` : 'not specified'
    }`;

    const { text } = await runCompletion({
      systemPrompt,
      turns: [{ role: 'user', content: userTurn }],
      jsonMode: true,
      temperature: 0.3,
    });

    const parsed = safeParseTriage(text);
    res.status(200).json(parsed ?? FALLBACK_RESULT);
  } catch (err) {
    console.error('[api/triage] error:', err);
    res.status(200).json(FALLBACK_RESULT);
  }
}

function safeParseTriage(raw: string): TriageResult | null {
  try {
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    const parsed = JSON.parse(cleaned);
    if (!parsed.urgency || !parsed.summary) return null;
    return {
      urgency: parsed.urgency,
      summary: parsed.summary,
      possibleFactors: Array.isArray(parsed.possibleFactors) ? parsed.possibleFactors : [],
      selfCareSteps: Array.isArray(parsed.selfCareSteps) ? parsed.selfCareSteps : [],
      seekCareIf: Array.isArray(parsed.seekCareIf) ? parsed.seekCareIf : [],
      disclaimer:
        parsed.disclaimer ||
        'This is general wellness information, not a medical diagnosis. If you\'re worried, contact a healthcare professional.',
    };
  } catch {
    return null;
  }
}
