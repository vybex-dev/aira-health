import { AlertTriangle } from 'lucide-react';
import { isFirebaseConfigured } from '@/lib/firebase';

/**
 * Shown only when VITE_FIREBASE_* env vars are absent — helps a developer
 * running the app for the first time (or a misconfigured deploy) understand
 * immediately why auth/data features aren't working, instead of guessing.
 */
export default function ConfigWarningBanner() {
  if (isFirebaseConfigured) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[100] bg-amber/95 text-ink text-xs sm:text-sm font-mono px-4 py-2.5 flex items-center justify-center gap-2 text-center">
      <AlertTriangle size={14} className="flex-shrink-0" />
      Firebase isn't configured — copy <code className="font-semibold">.env.example</code> to{' '}
      <code className="font-semibold">.env</code> and add your project's keys to enable sign-in.
    </div>
  );
}
