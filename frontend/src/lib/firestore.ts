import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HealthLogEntry, ChatMessage, UserProfile } from '@/types';

function requireDb() {
  if (!db) {
    throw new Error(
      'Firestore is not configured. Add your VITE_FIREBASE_* env vars — see .env.example.'
    );
  }
  return db;
}

// ---------- Health logs ----------

export function subscribeToLogs(
  uid: string,
  cb: (logs: HealthLogEntry[]) => void,
  max = 100
): Unsubscribe {
  const q = query(collection(requireDb(), 'users', uid, 'logs'), orderBy('createdAt', 'desc'), limit(max));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as HealthLogEntry));
  });
}

export async function addLogEntry(uid: string, entry: Omit<HealthLogEntry, 'id' | 'uid' | 'createdAt'>) {
  await addDoc(collection(requireDb(), 'users', uid, 'logs'), {
    ...entry,
    uid,
    createdAt: Date.now(),
  });
}

// ---------- Chat ----------

const DEFAULT_CHAT_ID = 'primary';

export function subscribeToChat(uid: string, cb: (messages: ChatMessage[]) => void): Unsubscribe {
  const q = query(
    collection(requireDb(), 'users', uid, 'chats', DEFAULT_CHAT_ID, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ChatMessage));
  });
}

export async function addChatMessage(uid: string, message: Omit<ChatMessage, 'id'>) {
  await addDoc(collection(requireDb(), 'users', uid, 'chats', DEFAULT_CHAT_ID, 'messages'), message);
}

// ---------- Profile ----------

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  await updateDoc(doc(requireDb(), 'users', uid), { ...updates });
}

// ---------- Insights ----------

export async function saveDailyInsight(uid: string, headline: string, body: string, metricsConsidered: string[]) {
  await addDoc(collection(requireDb(), 'users', uid, 'insights'), {
    uid,
    headline,
    body,
    metricsConsidered,
    createdAt: serverTimestamp(),
  });
}
