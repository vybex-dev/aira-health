import { motion } from 'framer-motion';
import { HeartPulse, MessagesSquare, LineChart, Pill } from 'lucide-react';

const FEATURES = [
  {
    icon: MessagesSquare,
    title: 'Ask anything, get reasoned answers',
    body: 'Describe symptoms in your own words. Aira asks the follow-ups a good triage nurse would, then explains its reasoning — not just a verdict.',
  },
  {
    icon: HeartPulse,
    title: 'Vitals that mean something',
    body: 'Log heart rate, blood pressure, sleep, and mood. Aira connects the dots across days, not just single readings.',
  },
  {
    icon: LineChart,
    title: 'Trends before crises',
    body: "A daily insight surfaces what's shifting — resting heart rate creeping up, sleep debt building — before it becomes a problem.",
  },
  {
    icon: Pill,
    title: 'Medication-aware',
    body: 'Your conditions, allergies, and current medications shape every answer, so guidance is relevant to your actual health picture.',
  },
];

export default function CopilotShowcase() {
  return (
    <section id="copilot" className="relative py-28 border-t border-line">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-wider text-vital font-mono mb-3">The copilot</p>
          <h2 className="font-display font-semibold text-4xl text-mist tracking-tight mb-4">
            Built to reason, not just reply
          </h2>
          <p className="text-slate text-lg leading-relaxed">
            Aira combines fast-response and deep-reasoning models with your personal
            health context, so every answer is grounded in your history — not a
            generic symptom database.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-5 rounded-[var(--radius-card)] bg-ink-softer border border-line hover:border-vital/25 transition-colors"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-vital/10 text-vital mb-4">
                  <f.icon size={17} />
                </span>
                <h3 className="font-display font-medium text-mist text-[15px] mb-2">{f.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>

          <ChatPreview />
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      className="rounded-[var(--radius-card)] border border-line bg-ink-soft grain-overlay overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-line">
        <span className="h-2 w-2 rounded-full bg-coral" />
        <span className="h-2 w-2 rounded-full bg-amber" />
        <span className="h-2 w-2 rounded-full bg-vital" />
        <span className="ml-2 text-xs font-mono text-slate-dim">aira · chat</span>
      </div>
      <div className="p-6 space-y-4">
        <ChatBubble from="user">
          I've had a dull headache since yesterday afternoon, worse when I stand up fast.
        </ChatBubble>
        <ChatBubble from="aira">
          Noted — and I see you logged 4.5 hrs of sleep last night, well under your usual 7.
          A few quick questions: any nausea, or is your vision affected at all?
        </ChatBubble>
        <ChatBubble from="user">No nausea. Vision's fine.</ChatBubble>
        <ChatBubble from="aira" highlight>
          Given the pattern — short sleep, positional headache, no red-flag symptoms —
          this reads as low concern, likely tension or mild dehydration. Try water,
          a proper meal, and an early night. I'll check back tomorrow if it persists.
        </ChatBubble>
      </div>
    </motion.div>
  );
}

function ChatBubble({
  children,
  from,
  highlight,
}: {
  children: React.ReactNode;
  from: 'user' | 'aira';
  highlight?: boolean;
}) {
  const isUser = from === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-line text-mist rounded-br-sm'
            : highlight
              ? 'bg-vital/10 border border-vital/25 text-mist rounded-bl-sm'
              : 'bg-ink-softer border border-line text-slate rounded-bl-sm'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
