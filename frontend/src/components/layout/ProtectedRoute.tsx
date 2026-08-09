import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import AiraOrb from '@/components/three/AiraOrb';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex flex-col items-center justify-center gap-4">
        <AiraOrb state="thinking" size={140} />
        <p className="text-slate text-sm font-mono">Loading your health data…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
