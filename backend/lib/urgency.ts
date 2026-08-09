import type { Urgency } from './types.js';

const TAG_PATTERN = /\[URGENCY:\s*(info|low|moderate|urgent)\s*\]/i;

const EMERGENCY_PATTERN =
  /\b(chest pain|can'?t breathe|cannot breathe|difficulty breathing|suicidal|kill myself|severe bleeding|stroke|unconscious|not breathing|anaphylaxis|overdose)\b/i;

/**
 * Extracts the trailing [URGENCY: x] tag from a model reply (if present),
 * strips it from the visible text, and hard-overrides to "urgent" if the
 * raw user input matches an emergency keyword pattern — a cheap, deterministic
 * safety net that doesn't depend on the model remembering to tag correctly.
 */
export function extractUrgency(
  rawReply: string,
  userInput: string
): { text: string; urgency: Urgency } {
  const match = rawReply.match(TAG_PATTERN);
  let urgency: Urgency = (match?.[1]?.toLowerCase() as Urgency) || 'info';
  const text = rawReply.replace(TAG_PATTERN, '').trim();

  if (EMERGENCY_PATTERN.test(userInput)) {
    urgency = 'urgent';
  }

  return { text, urgency };
}
