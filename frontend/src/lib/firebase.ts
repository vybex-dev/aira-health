import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// All values are injected at build time via Vite env vars.
// Set these in your `.env.local` (see `.env.example`) and in your
// Vercel project's Environment Variables for production.
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True once real Firebase config values are present (vs. empty env vars). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

let auth: Auth | undefined;
let db: Firestore | undefined;
let googleProvider: GoogleAuthProvider | undefined;

// Guard initialization so a missing/invalid config surfaces as a clear,
// catchable condition (`isFirebaseConfigured`) instead of an uncaught
// exception that white-screens the entire app.
if (isFirebaseConfigured) {
  try {
    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    console.error('[firebase] Initialization failed:', err);
  }
} else {
  console.warn(
    '[firebase] Missing VITE_FIREBASE_* environment variables — auth and Firestore are disabled. ' +
      'Copy .env.example to .env and fill in your Firebase web app config.'
  );
}

export { auth, db, googleProvider };
