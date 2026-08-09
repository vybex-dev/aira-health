import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import type { UserProfile } from '@/types';

/**
 * Mount once near the app root. Keeps `useAuthStore` in sync with Firebase
 * Auth and the user's Firestore profile document in real time.
 */
export function useAuthSync() {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    if (!auth || !db) {
      // Firebase isn't configured (missing env vars) — treat as signed out
      // rather than hanging on a perpetual loading state.
      setLoading(false);
      return;
    }
    const firestore = db; // narrow once, outside the closure below

    let unsubProfile: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubProfile) {
        unsubProfile();
        unsubProfile = undefined;
      }

      if (firebaseUser) {
        unsubProfile = onSnapshot(doc(firestore, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
          setLoading(false);
        });
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
