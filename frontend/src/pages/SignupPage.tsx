import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, Loader2 } from 'lucide-react';
import { auth, db, googleProvider } from '@/lib/firebase';
import AuthLayout from '@/components/layout/AuthLayout';

async function createUserProfileDoc(uid: string, displayName: string, email: string) {
  if (!db) return;
  await setDoc(
    doc(db, 'users', uid),
    {
      uid,
      displayName,
      email,
      conditions: [],
      allergies: [],
      medications: [],
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth) {
      setError('Firebase is not configured. Add your VITE_FIREBASE_* env vars — see .env.example.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await createUserProfileDoc(cred.user.uid, name, email);
      navigate('/app');
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!auth || !googleProvider) {
      setError('Firebase is not configured. Add your VITE_FIREBASE_* env vars — see .env.example.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await createUserProfileDoc(cred.user.uid, cred.user.displayName || 'there', cred.user.email || '');
      navigate('/app');
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Free forever for personal use. Takes under a minute.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-lg bg-red/10 border border-red/25 text-red text-sm">
            <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Field label="Full name">
          <input
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="auth-input"
            placeholder="Jordan Rivera"
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            placeholder="At least 6 characters"
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-vital text-ink font-semibold hover:bg-vital-dim transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Create account
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs text-slate-dim font-mono">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <button
        onClick={handleGoogle}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-full border border-line text-mist text-sm font-medium hover:border-slate-dim transition-colors disabled:opacity-60"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="text-sm text-slate mt-8 text-center">
        Already have an account?{' '}
        <Link to="/login" className="text-vital hover:text-vital-dim font-medium">
          Log in
        </Link>
      </p>

      <p className="text-xs text-slate-dim mt-6 text-center leading-relaxed">
        By continuing, you agree that Aira provides wellness information only and
        does not replace professional medical care.
      </p>
    </AuthLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono text-slate-dim mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code || '';
  if (code.includes('email-already-in-use')) return 'An account with this email already exists.';
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('popup-closed-by-user')) return 'Sign-in was cancelled.';
  return 'Something went wrong. Please try again.';
}
