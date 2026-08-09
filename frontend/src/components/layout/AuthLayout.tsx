import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import AiraOrb from '@/components/three/AiraOrb';

export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-ink grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col items-center justify-center border-r border-line overflow-hidden">
        <div className="absolute inset-0 bg-vital/[0.04]" />
        <AiraOrb state="idle" size={380} />
        <p className="relative mt-4 text-slate text-sm max-w-xs text-center leading-relaxed">
          "Understand what's changing in your body before it becomes urgent."
        </p>
      </div>

      <div className="flex flex-col justify-center px-8 sm:px-16 py-16">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-12">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vital/10 border border-vital/30">
            <Activity size={16} className="text-vital" />
          </span>
          <span className="font-display font-semibold text-lg text-mist">Aira</span>
        </Link>

        <div className="max-w-sm w-full">
          <h1 className="font-display font-semibold text-3xl text-mist tracking-tight mb-2">{title}</h1>
          <p className="text-slate text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
