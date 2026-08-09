import type { Urgency } from '@/types';
import { clsx } from 'clsx';

const CONFIG: Record<Urgency, { label: string; classes: string }> = {
  info: { label: 'Informational', classes: 'bg-slate/10 text-slate border-slate/25' },
  low: { label: 'Low concern', classes: 'bg-vital/10 text-vital border-vital/30' },
  moderate: { label: 'Moderate — monitor closely', classes: 'bg-amber/10 text-amber border-amber/30' },
  urgent: { label: 'Seek care promptly', classes: 'bg-red/10 text-red border-red/30' },
};

export default function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const cfg = CONFIG[urgency];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium font-mono',
        cfg.classes
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {cfg.label}
    </span>
  );
}
