import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app: App | null = null;

function getAdminApp(): App | null {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel env vars can't hold literal newlines cleanly, so the private key
  // is stored with escaped \n sequences and unescaped here.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      '[firebaseAdmin] Missing Firebase Admin credentials — requests will proceed unauthenticated. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.'
    );
    return null;
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

/**
 * Verifies the `Authorization: Bearer <idToken>` header against Firebase Auth.
 * Returns the decoded uid, or null if the token is missing/invalid/admin is
 * unconfigured. Endpoints treat null as "anonymous" rather than hard-failing,
 * since the AI endpoints are useful even without a persisted identity — but
 * routes that touch user-specific data should require a non-null uid.
 */
export async function verifyRequestAuth(authHeader?: string): Promise<string | null> {
  const adminApp = getAdminApp();
  if (!adminApp || !authHeader?.startsWith('Bearer ')) return null;

  const idToken = authHeader.slice('Bearer '.length);
  try {
    const decoded = await getAuth(adminApp).verifyIdToken(idToken);
    return decoded.uid;
  } catch (err) {
    console.error('[firebaseAdmin] Token verification failed:', (err as Error).message);
    return null;
  }
}
