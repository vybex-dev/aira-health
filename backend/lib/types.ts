export type Urgency = 'info' | 'low' | 'moderate' | 'urgent';

export interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  age?: number;
  sex?: string;
  heightCm?: number;
  weightKg?: number;
  conditions: string[];
  allergies: string[];
  medications: MedicationEntry[];
}

export interface ChatTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface TriageResult {
  urgency: Urgency;
  summary: string;
  possibleFactors: string[];
  selfCareSteps: string[];
  seekCareIf: string[];
  disclaimer: string;
}
