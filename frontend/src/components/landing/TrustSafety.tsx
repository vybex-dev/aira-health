import { motion } from 'framer-motion';
import { ShieldCheck, PhoneCall, Lock, UserCheck } from 'lucide-react';

const POINTS = [
  {
    icon: ShieldCheck,
    title: 'Not a diagnosis engine',
    body: 'Aira reasons about likely explanations and urgency — it never issues a diagnosis or prescription. That stays with licensed clinicians.',
  },
  {
    icon: PhoneCall,
    title: 'Escalates emergencies immediately',
    body: 'Any pattern consistent with a medical emergency triggers an immediate prompt to contact emergency services — no waiting on a chat.',
  },
  {
    icon: Lock,
    title: 'Your data stays yours',
    body: 'Health logs are stored under your account with per-user access rules. You can export or delete everything at any time.',
  },
  {
    icon: UserCheck,
    title: 'Built for context, not conclusions',
    body: "Every answer names its own uncertainty and points you toward a professional when the picture calls for one.",
  },
];

export default function TrustSafety() {
  return (
    <section id="trust" className="relative py-28 border-t border-line">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-xs uppercase tracking-wider text-coral font-mono mb-3">Trust &amp; safety</p>
          <h2 className="font-display font-semibold text-4xl text-mist tracking-tight mb-4">
            Confident where it should be. Cautious where it must be.
          </h2>
          <p className="text-slate text-lg leading-relaxed">
            Healthcare AI earns trust through restraint. Here's exactly where Aira
            draws its lines.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {POINTS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex gap-4 p-6 rounded-[var(--radius-card)] border border-line bg-ink-softer"
            >
              <span className="flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full bg-coral/10 text-coral">
                <p.icon size={18} />
              </span>
              <div>
                <h3 className="font-display font-medium text-mist mb-1.5">{p.title}</h3>
                <p className="text-sm text-slate leading-relaxed">{p.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
