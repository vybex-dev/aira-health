export type Urgency = 'info' | 'low' | 'moderate' | 'urgent';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  age?: number;
  sex?: 'female' | 'male' | 'intersex' | 'prefer_not_to_say';
  heightCm?: number;
  weightKg?: number;
  conditions: string[];
  allergies: string[];
  medications: MedicationEntry[];
  createdAt: number;
}

export interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay?: string[];
}

export interface HealthLogEntry {
  id: string;
  uid: string;
  type: 'symptom' | 'vitals' | 'mood' | 'sleep' | 'note';
  createdAt: number;
  // symptom
  symptom?: string;
  severity?: number; // 1-10
  // vitals
  heartRate?: number;
  systolic?: number;
  diastolic?: number;
  spo2?: number;
  temperatureC?: number;
  // mood
  mood?: number; // 1-5
  // sleep
  sleepHours?: number;
  // free text
  note?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  urgency?: Urgency;
  provider?: 'groq' | 'gemini';
}

export interface TriageResult {
  urgency: Urgency;
  summary: string;
  possibleFactors: string[];
  selfCareSteps: string[];
  seekCareIf: string[];
  disclaimer: string;
}

export interface DailyInsight {
  id: string;
  uid: string;
  createdAt: number;
  headline: string;
  body: string;
  metricsConsidered: string[];
}

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'alert';
