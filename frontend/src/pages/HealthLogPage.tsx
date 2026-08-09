import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Smile, Moon, StickyNote, Stethoscope, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { addLogEntry, subscribeToLogs } from '@/lib/firestore';
import type { HealthLogEntry } from '@/types';

type Tab = 'symptom' | 'vitals' | 'mood' | 'sleep' | 'note';

const TABS: { key: Tab; label: string; icon: typeof HeartPulse }[] = [
  { key: 'symptom', label: 'Symptom', icon: Stethoscope },
  { key: 'vitals', label: 'Vitals', icon: HeartPulse },
  { key: 'mood', label: 'Mood', icon: Smile },
  { key: 'sleep', label: 'Sleep', icon: Moon },
  { key: 'note', label: 'Note', icon: StickyNote },
];

export default function HealthLogPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('symptom');
  const [logs, setLogs] = useState<HealthLogEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToLogs(user.uid, setLogs, 50);
  }, [user]);

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="px-6 sm:px-10 py-10 max-w-4xl mx-auto">
      <h1 className="font-display font-semibold text-3xl text-mist tracking-tight mb-1">Health log</h1>
      <p className="text-slate text-sm mb-8">Thirty seconds now saves guesswork later.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key
                ? 'bg-vital text-ink'
                : 'bg-ink-softer text-slate border border-line hover:text-mist'
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-ink-softer p-7 mb-10">
        {tab === 'symptom' && <SymptomForm uid={user?.uid} onSaved={flashSaved} />}
        {tab === 'vitals' && <VitalsForm uid={user?.uid} onSaved={flashSaved} />}
        {tab === 'mood' && <MoodForm uid={user?.uid} onSaved={flashSaved} />}
        {tab === 'sleep' && <SleepForm uid={user?.uid} onSaved={flashSaved} />}
        {tab === 'note' && <NoteForm uid={user?.uid} onSaved={flashSaved} />}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mt-5 text-sm text-vital"
          >
            <Check size={15} />
            Saved to your health log.
          </motion.div>
        )}
      </div>

      <h2 className="font-display font-medium text-lg text-mist mb-4">History</h2>
      <div className="rounded-[var(--radius-card)] border border-line bg-ink-softer divide-y divide-line">
        {logs.length === 0 && <p className="text-sm text-slate-dim p-6 text-center">No entries yet.</p>}
        {logs.map((log) => (
          <div key={log.id} className="p-4 flex items-center justify-between gap-4">
            <span className="text-sm text-mist">{describeLog(log)}</span>
            <span className="text-xs text-slate-dim font-mono flex-shrink-0">
              {new Date(log.createdAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-mono text-slate-dim mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="px-5 py-2.5 rounded-full bg-vital text-ink text-sm font-semibold hover:bg-vital-dim transition-colors disabled:opacity-50"
    >
      Save entry
    </button>
  );
}

function SymptomForm({ uid, onSaved }: { uid?: string; onSaved: () => void }) {
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState(4);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !symptom.trim()) return;
    await addLogEntry(uid, { type: 'symptom', symptom: symptom.trim(), severity });
    setSymptom('');
    setSeverity(4);
    onSaved();
  }

  return (
    <form onSubmit={submit}>
      <FormRow label="What are you experiencing?">
        <input
          className="auth-input"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          placeholder="e.g. dull headache, sore throat"
          required
        />
      </FormRow>
      <FormRow label={`Severity — ${severity}/10`}>
        <input
          type="range"
          min={1}
          max={10}
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="w-full accent-[#4ADE9E]"
        />
      </FormRow>
      <SubmitButton disabled={!symptom.trim()} />
    </form>
  );
}

function VitalsForm({ uid, onSaved }: { uid?: string; onSaved: () => void }) {
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [spo2, setSpo2] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    await addLogEntry(uid, {
      type: 'vitals',
      ...(heartRate && { heartRate: Number(heartRate) }),
      ...(systolic && { systolic: Number(systolic) }),
      ...(diastolic && { diastolic: Number(diastolic) }),
      ...(spo2 && { spo2: Number(spo2) }),
    });
    setHeartRate('');
    setSystolic('');
    setDiastolic('');
    setSpo2('');
    onSaved();
  }

  const hasAny = heartRate || systolic || diastolic || spo2;

  return (
    <form onSubmit={submit}>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <FormRow label="Heart rate (bpm)">
          <input
            type="number"
            className="auth-input"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            placeholder="72"
          />
        </FormRow>
        <FormRow label="SpO₂ (%)">
          <input
            type="number"
            className="auth-input"
            value={spo2}
            onChange={(e) => setSpo2(e.target.value)}
            placeholder="98"
          />
        </FormRow>
        <FormRow label="Systolic (mmHg)">
          <input
            type="number"
            className="auth-input"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            placeholder="120"
          />
        </FormRow>
        <FormRow label="Diastolic (mmHg)">
          <input
            type="number"
            className="auth-input"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            placeholder="80"
          />
        </FormRow>
      </div>
      <SubmitButton disabled={!hasAny} />
    </form>
  );
}

function MoodForm({ uid, onSaved }: { uid?: string; onSaved: () => void }) {
  const options = [
    { v: 1, label: 'Low' },
    { v: 2, label: 'Meh' },
    { v: 3, label: 'Okay' },
    { v: 4, label: 'Good' },
    { v: 5, label: 'Great' },
  ];

  async function submit(v: number) {
    if (!uid) return;
    await addLogEntry(uid, { type: 'mood', mood: v });
    onSaved();
  }

  return (
    <div>
      <p className="text-xs font-mono text-slate-dim mb-4">How are you feeling right now?</p>
      <div className="flex gap-3 flex-wrap">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => submit(o.v)}
            className="px-5 py-3 rounded-xl border border-line bg-ink text-sm text-mist hover:border-vital/40 hover:bg-vital/5 transition-colors"
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SleepForm({ uid, onSaved }: { uid?: string; onSaved: () => void }) {
  const [hours, setHours] = useState('7');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    await addLogEntry(uid, { type: 'sleep', sleepHours: Number(hours) });
    onSaved();
  }

  return (
    <form onSubmit={submit}>
      <FormRow label="Hours slept last night">
        <input
          type="number"
          step="0.5"
          className="auth-input"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </FormRow>
      <SubmitButton disabled={!hours} />
    </form>
  );
}

function NoteForm({ uid, onSaved }: { uid?: string; onSaved: () => void }) {
  const [note, setNote] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !note.trim()) return;
    await addLogEntry(uid, { type: 'note', note: note.trim() });
    setNote('');
    onSaved();
  }

  return (
    <form onSubmit={submit}>
      <FormRow label="Anything else worth remembering?">
        <textarea
          className="auth-input resize-none"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Free-form notes — context for future you (and Aira)"
        />
      </FormRow>
      <SubmitButton disabled={!note.trim()} />
    </form>
  );
}

function describeLog(log: HealthLogEntry) {
  switch (log.type) {
    case 'symptom':
      return `Symptom — ${log.symptom} (severity ${log.severity}/10)`;
    case 'vitals': {
      const parts = [];
      if (log.heartRate) parts.push(`HR ${log.heartRate} bpm`);
      if (log.systolic) parts.push(`BP ${log.systolic}/${log.diastolic}`);
      if (log.spo2) parts.push(`SpO₂ ${log.spo2}%`);
      return `Vitals — ${parts.join(', ')}`;
    }
    case 'mood':
      return `Mood — ${['', 'Low', 'Meh', 'Okay', 'Good', 'Great'][log.mood || 0]}`;
    case 'sleep':
      return `Sleep — ${log.sleepHours}h`;
    case 'note':
      return `Note — ${log.note}`;
    default:
      return 'Entry';
  }
}
