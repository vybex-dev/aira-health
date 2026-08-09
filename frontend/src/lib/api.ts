import { auth } from '@/lib/firebase';
import type { ChatMessage, TriageResult, UserProfile } from '@/types';

// In dev, Vite proxies /api -> local backend (see vite.config.ts).
// In prod (Vercel), /api resolves to the sibling serverless functions.
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function authHeaders(): Promise<HeadersInit> {
  const token = await auth?.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function sendChatMessage(params: {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
  profile?: Partial<UserProfile> | null;
}): Promise<{ reply: string; urgency: ChatMessage['urgency']; provider: 'groq' | 'gemini' }> {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  return res.json();
}

export async function runTriage(params: {
  symptom: string;
  severity: number;
  durationHours?: number;
  profile?: Partial<UserProfile> | null;
}): Promise<TriageResult> {
  const res = await fetch(`${BASE}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Triage request failed: ${res.status}`);
  return res.json();
}

export async function getDailyInsight(params: {
  recentLogsSummary: string;
  profile?: Partial<UserProfile> | null;
}): Promise<{ headline: string; body: string }> {
  const res = await fetch(`${BASE}/insight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`Insight request failed: ${res.status}`);
  return res.json();
}
