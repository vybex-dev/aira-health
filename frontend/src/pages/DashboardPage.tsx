import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, Moon, Smile, Plus, ArrowRight, MessagesSquare } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { subscribeToLogs } from '@/lib/firestore';
import { getDailyInsight } from '@/lib/api';
import type { HealthLogEntry } from '@/types';
import AiraOrb from '@/components/three/AiraOrb';

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<HealthLogEntry[]>([]);
  const [insight, setInsight] = useState<{ headline: string; body: string } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToLogs(user.uid, setLogs, 30);
  }, [user]);

  const latestVitals = useMemo(() => logs.find((l) => l.type === 'vitals'), [logs]);
  const latestMood = useMemo(() => logs.find((l) => l.type === 'mood'), [logs]);
  const latestSleep = useMemo(() => logs.find((l) => l.type === 'sleep'), [logs]);

  useEffect(() => {
    if (!user || logs.length === 0 || insight || insightLoading) return;
    setInsightLoading(true);
    const summary = summarizeLogs(logs);
    getDailyInsight({ recentLogsSummary: summary, profile })
      .then(setInsight)
      .catch(() => setInsight(null))
      .finally(() => setInsightLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, logs]);

  const firstName = (profile?.displayName || user?.displayName || 'there').split(' ')[0];

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display font-semibold text-3xl text-mist tracking-tight">
            {greeting()}, {firstName}
          </h1>
          <p className="text-slate text-sm mt-1">Here's where things stand today.</p>
        </div>
        <button
          onClick={() => navigate('/app/log')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-vital text-ink text-sm font-semibold hover:bg-vital-dim transition-colors self-start sm:self-auto"
        >
          <Plus size={16} />
          Log entry
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* AI insight card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-2 relative overflow-hidden rounded-[var(--radius-card)] border border-vital/20 bg-gradient-to-br from-vital/[0.07] to-transparent p-7"
        >
          <div className="absolute -right-10 -top-10 opacity-30 pointer-events-none">
            <AiraOrb state={insightLoading ? 'thinking' : 'idle'} size={220} />
          </div>
          <div className="relative max-w-md">
            <p className="text-xs uppercase tracking-wider text-vital font-mono mb-3">Today's insight</p>
            {insightLoading ? (
              <div className="space-y-2.5">
                <div className="h-5 w-2/3 rounded bg-line animate-pulse" />
                <div className="h-4 w-full rounded bg-line animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-line animate-pulse" />
              </div>
            ) : insight ? (
              <>
                <h2 className="font-display font-medium text-xl text-mist mb-2.5">{insight.headline}</h2>
                <p className="text-sm text-slate leading-relaxed">{insight.body}</p>
              </>
            ) : (
              <>
                <h2 className="font-display font-medium text-xl text-mist mb-2.5">
                  Log a few entries to unlock insights
                </h2>
                <p className="text-sm text-slate leading-relaxed">
                  Once you've tracked vitals, sleep, or mood, Aira will surface patterns
                  worth your attention here — automatically, every day.
                </p>
              </>
            )}
            <button
              onClick={() => navigate('/app/chat')}
              className="inline-flex items-center gap-1.5 mt-5 text-sm font-medium text-vital hover:text-vital-dim transition-colors"
            >
              Ask Aira about this
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Quick chat CTA */}
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => navigate('/app/chat')}
          className="flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-ink-softer p-7 text-left hover:border-vital/30 transition-colors"
        >
          <div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-vital/10 text-vital mb-4">
              <MessagesSquare size={18} />
            </span>
            <h3 className="font-display font-medium text-mist mb-1.5">Not feeling right?</h3>
            <p className="text-sm text-slate leading-relaxed">
              Describe what's going on and get grounded, context-aware guidance.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-vital">
            Start a conversation <ArrowRight size={14} />
          </span>
        </motion.button>
      </div>

      {/* Vitals row */}
      <div className="grid sm:grid-cols-3 gap-6 mb-8">
        <VitalCard
          icon={HeartPulse}
          label="Latest vitals"
          value={
            latestVitals?.heartRate
              ? `${latestVitals.heartRate} bpm`
              : latestVitals?.systolic
                ? `${latestVitals.systolic}/${latestVitals.diastolic}`
                : '—'
          }
          sub={latestVitals ? timeAgo(latestVitals.createdAt) : 'No readings yet'}
          color="vital"
        />
        <VitalCard
          icon={Moon}
          label="Last night's sleep"
          value={latestSleep?.sleepHours ? `${latestSleep.sleepHours}h` : '—'}
          sub={latestSleep ? timeAgo(latestSleep.createdAt) : 'Not logged'}
          color="coral"
        />
        <VitalCard
          icon={Smile}
          label="Mood"
          value={latestMood?.mood ? moodLabel(latestMood.mood) : '—'}
          sub={latestMood ? timeAgo(latestMood.createdAt) : 'Not logged'}
          color="amber"
        />
      </div>

      {/* Recent activity */}
      <div className="rounded-[var(--radius-card)] border border-line bg-ink-softer p-7">
        <h3 className="font-display font-medium text-mist mb-5">Recent activity</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-dim py-6 text-center">
            Nothing logged yet. Your first entry takes about thirty seconds.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {logs.slice(0, 6).map((log) => (
              <li key={log.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-vital flex-shrink-0" />
                  <span className="text-sm text-mist truncate">{describeLog(log)}</span>
                </div>
                <span className="text-xs text-slate-dim font-mono flex-shrink-0">{timeAgo(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function VitalCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: typeof HeartPulse;
  label: string;
  value: string;
  sub: string;
  color: 'vital' | 'coral' | 'amber';
}) {
  const colorClasses = {
    vital: 'bg-vital/10 text-vital',
    coral: 'bg-coral/10 text-coral',
    amber: 'bg-amber/10 text-amber',
  }[color];

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-ink-softer p-6">
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg mb-4 ${colorClasses}`}>
        <Icon size={16} />
      </span>
      <p className="text-xs text-slate-dim font-mono mb-1">{label}</p>
      <p className="font-display font-semibold text-2xl text-mist">{value}</p>
      <p className="text-xs text-slate-dim mt-1">{sub}</p>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function moodLabel(mood: number) {
  return ['', 'Low', 'Meh', 'Okay', 'Good', 'Great'][mood] || '—';
}

function describeLog(log: HealthLogEntry) {
  switch (log.type) {
    case 'symptom':
      return `Logged symptom: ${log.symptom} (severity ${log.severity}/10)`;
    case 'vitals':
      return log.heartRate
        ? `Heart rate: ${log.heartRate} bpm`
        : `Blood pressure: ${log.systolic}/${log.diastolic}`;
    case 'mood':
      return `Mood check-in: ${moodLabel(log.mood || 0)}`;
    case 'sleep':
      return `Sleep: ${log.sleepHours} hours`;
    case 'note':
      return log.note || 'Note added';
    default:
      return 'Entry logged';
  }
}

function summarizeLogs(logs: HealthLogEntry[]): string {
  return logs
    .slice(0, 20)
    .map((l) => `- [${new Date(l.createdAt).toLocaleDateString()}] ${describeLog(l)}`)
    .join('\n');
}
