import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Check } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { updateUserProfile } from '@/lib/firestore';
import type { MedicationEntry } from '@/types';

export default function ProfilePage() {
  const { user, profile } = useAuthStore();
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAge(profile.age?.toString() || '');
    setSex(profile.sex || '');
    setHeightCm(profile.heightCm?.toString() || '');
    setWeightKg(profile.weightKg?.toString() || '');
    setConditions(profile.conditions || []);
    setAllergies(profile.allergies || []);
    setMedications(profile.medications || []);
  }, [profile]);

  async function handleSave() {
    if (!user) return;
    await updateUserProfile(user.uid, {
      ...(age && { age: Number(age) }),
      ...(sex && { sex: sex as never }),
      ...(heightCm && { heightCm: Number(heightCm) }),
      ...(weightKg && { weightKg: Number(weightKg) }),
      conditions,
      allergies,
      medications,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="px-6 sm:px-10 py-10 max-w-3xl mx-auto">
      <h1 className="font-display font-semibold text-3xl text-mist tracking-tight mb-1">Health profile</h1>
      <p className="text-slate text-sm mb-10">
        This context shapes every answer Aira gives you — the more complete, the better.
      </p>

      <Section title="About you">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Age">
            <input type="number" className="auth-input" value={age} onChange={(e) => setAge(e.target.value)} placeholder="32" />
          </Field>
          <Field label="Sex">
            <select className="auth-input" value={sex} onChange={(e) => setSex(e.target.value)}>
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="intersex">Intersex</option>
            </select>
          </Field>
          <Field label="Height / weight">
            <div className="flex gap-2">
              <input type="number" className="auth-input" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="cm" />
              <input type="number" className="auth-input" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="kg" />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Conditions">
        <TagEditor items={conditions} setItems={setConditions} placeholder="e.g. asthma, type 2 diabetes" />
      </Section>

      <Section title="Allergies">
        <TagEditor items={allergies} setItems={setAllergies} placeholder="e.g. penicillin, peanuts" />
      </Section>

      <Section title="Medications">
        <MedicationEditor medications={medications} setMedications={setMedications} />
      </Section>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={handleSave}
          className="px-6 py-3 rounded-full bg-vital text-ink text-sm font-semibold hover:bg-vital-dim transition-colors"
        >
          Save profile
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-sm text-vital"
          >
            <Check size={15} /> Saved
          </motion.span>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 pb-8 border-b border-line">
      <h2 className="font-display font-medium text-mist mb-4">{title}</h2>
      {children}
    </div>
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

function TagEditor({
  items,
  setItems,
  placeholder,
}: {
  items: string[];
  setItems: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  function add() {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    setItems([...items, v]);
    setDraft('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink border border-line text-sm text-mist"
          >
            {item}
            <button onClick={() => setItems(items.filter((i) => i !== item))} className="text-slate-dim hover:text-coral">
              <X size={13} />
            </button>
          </span>
        ))}
        {items.length === 0 && <span className="text-sm text-slate-dim">None added yet</span>}
      </div>
      <div className="flex gap-2">
        <input
          className="auth-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-xl border border-line text-slate hover:text-vital hover:border-vital/40 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function MedicationEditor({
  medications,
  setMedications,
}: {
  medications: MedicationEntry[];
  setMedications: (m: MedicationEntry[]) => void;
}) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];

  function toggleTime(time: string) {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  }

  function add() {
    if (!name.trim()) return;
    setMedications([
      ...medications,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        timeOfDay: selectedTimes,
      },
    ]);
    setName('');
    setDosage('');
    setFrequency('');
    setSelectedTimes([]);
  }

  return (
    <div>
      <div className="space-y-2 mb-4">
        {medications.map((m) => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-ink border border-line">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-mist font-medium">{m.name}</span>
                <span className="text-xs text-slate-dim">
                  {[m.dosage, m.frequency].filter(Boolean).join(' · ')}
                </span>
              </div>
              {m.timeOfDay && m.timeOfDay.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {m.timeOfDay.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-vital/10 text-vital border border-vital/25"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setMedications(medications.filter((med) => med.id !== m.id))}
              className="text-slate-dim hover:text-coral transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {medications.length === 0 && <p className="text-sm text-slate-dim">No medications added yet</p>}
      </div>
      <div className="space-y-3">
        <div className="grid sm:grid-cols-3 gap-2">
          <input className="auth-input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="auth-input" placeholder="Dosage (e.g. 10mg)" value={dosage} onChange={(e) => setDosage(e.target.value)} />
          <input
            className="auth-input"
            placeholder="Frequency (e.g. daily)"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3 rounded-xl bg-ink border border-line">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-mono text-slate-dim">Scheduled Times</span>
            <div className="flex flex-wrap gap-1.5">
              {TIMES.map((time) => {
                const isSelected = selectedTimes.includes(time);
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleTime(time)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-vital/15 text-vital border-vital/40'
                        : 'bg-ink-softer text-slate border-line hover:text-mist hover:border-slate'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={add}
            className="flex-shrink-0 flex items-center justify-center h-11 w-11 rounded-xl bg-vital text-ink hover:bg-vital-dim transition-colors self-end"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
