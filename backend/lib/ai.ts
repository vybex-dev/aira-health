import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatTurn } from './types.js';

// Groq: fast inference, used as the primary provider for chat latency.
// Model choice: Llama 3.3 70B versatile — strong general reasoning at low latency.
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Gemini 3.5 Flash: free-tier fallback, also strong at structured JSON output.
const GEMINI_MODEL = 'gemini-3.5-flash';

let groqClient: Groq | null = null;
function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groqClient;
}

let geminiClient: GoogleGenerativeAI | null = null;
function getGemini(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!geminiClient) geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return geminiClient;
}

export interface CompletionResult {
  text: string;
  provider: 'groq' | 'gemini';
}

/**
 * Runs a chat-style completion against Groq first; on any failure (missing key,
 * rate limit, network error), transparently falls back to Gemini 3.5 Flash.
 * `jsonMode` requests structured JSON output from whichever provider succeeds.
 */
export async function runCompletion(params: {
  systemPrompt: string;
  turns: ChatTurn[];
  jsonMode?: boolean;
  temperature?: number;
}): Promise<CompletionResult> {
  const { systemPrompt, turns, jsonMode = false, temperature = 0.4 } = params;

  const groq = getGroq();
  if (groq) {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature,
        max_tokens: 900,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        messages: [
          { role: 'system', content: systemPrompt },
          ...turns.map((t) => ({ role: t.role, content: t.content }) as const),
        ],
      });
      const text = completion.choices[0]?.message?.content?.trim();
      if (text) return { text, provider: 'groq' };
    } catch (err) {
      console.error('[ai] Groq completion failed, falling back to Gemini:', (err as Error).message);
    }
  }

  const gemini = getGemini();
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature,
          maxOutputTokens: 900,
          ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
        },
      });

      // Gemini's chat API expects the last message separately from history.
      const history = turns.slice(0, -1).map((t) => ({
        role: t.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: t.content }],
      }));
      const last = turns[turns.length - 1];

      const chat = model.startChat({ history });
      const result = await chat.sendMessage(last?.content ?? '');
      const text = result.response.text().trim();
      if (text) return { text, provider: 'gemini' };
    } catch (err) {
      console.error('[ai] Gemini completion failed:', (err as Error).message);
    }
  }

  throw new Error(
    'Both AI providers are unavailable. Check GROQ_API_KEY and GEMINI_API_KEY environment variables.'
  );
}
