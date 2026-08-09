import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useAuthStore } from '@/store/useAuthStore';
import { subscribeToLogs } from '@/lib/firestore';
import type { HealthLogEntry } from '@/types';

export default function InsightsPage() {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<HealthLogEntry[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToLogs(user.uid, setLogs, 200);
  }, [user]);

  const heartRateData = useMemo(
    () =>
      logs
        .filter((l) => l.type === 'vitals' && l.heartRate)
        .slice()
        .reverse()
        .map((l) => ({ date: formatDate(l.createdAt), value: l.heartRate })),
    [logs]
  );

  const sleepData = useMemo(
    () =>
      logs
        .filter((l) => l.type === 'sleep')
        .slice()
        .reverse()
        .map((l) => ({ date: formatDate(l.createdAt), value: l.sleepHours })),
    [logs]
  );

  const moodData = useMemo(
    () =>
      logs
        .filter((l) => l.type === 'mood')
        .slice()
        .reverse()
        .map((l) => ({ date: formatDate(l.createdAt), value: l.mood })),
    [logs]
  );

  const hasAnyData = heartRateData.length + sleepData.length + moodData.length > 0;

  return (
    <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto">
      <h1 className="font-display font-semibold text-3xl text-mist tracking-tight mb-1">Insights</h1>
      <p className="text-slate text-sm mb-10">Trends across everything you've logged.</p>

      {!hasAnyData ? (
        <div className="rounded-[var(--radius-card)] border border-line bg-ink-softer p-16 text-center">
          <p className="text-slate">
            Log a few vitals, sleep, or mood entries and your trends will appear here.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {heartRateData.length > 0 && (
            <ChartCard title="Heart rate" unit="bpm">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={heartRateData}>
                  <defs>
                    <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ADE9E" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#4ADE9E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke="#1E2A3F" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#8A93A6', fontSize: 11 }} axisLine={{ stroke: '#1E2A3F' }} tickLine={false} />
                  <YAxis tick={{ fill: '#8A93A6', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#4ADE9E" strokeWidth={2} fill="url(#hrGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {sleepData.length > 0 && (
            <ChartCard title="Sleep" unit="hours">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="4 6" stroke="#1E2A3F" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#8A93A6', fontSize: 11 }} axisLine={{ stroke: '#1E2A3F' }} tickLine={false} />
                  <YAxis tick={{ fill: '#8A93A6', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" fill="#FF8B6B" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {moodData.length > 0 && (
            <ChartCard title="Mood" unit="1–5 scale" wide={sleepData.length === 0 || heartRateData.length === 0}>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={moodData}>
                  <defs>
                    <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F2B84B" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#F2B84B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 6" stroke="#1E2A3F" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#8A93A6', fontSize: 11 }} axisLine={{ stroke: '#1E2A3F' }} tickLine={false} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#8A93A6', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#F2B84B" strokeWidth={2} fill="url(#moodGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </div>
      )}
    </div>
  );
}

const tooltipStyle = {
  background: '#16223B',
  border: '1px solid #1E2A3F',
  borderRadius: 10,
  fontSize: 12,
  color: '#F7F9FC',
};

function ChartCard({
  title,
  unit,
  children,
  wide,
}: {
  title: string;
  unit: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-ink-softer p-6 ${wide ? 'lg:col-span-2' : ''}`}>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display font-medium text-mist">{title}</h3>
        <span className="text-xs text-slate-dim font-mono">{unit}</span>
      </div>
      {children}
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
