import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import AiraOrb from '@/components/three/AiraOrb';
import AmbientField from '@/components/three/AmbientField';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden">
      <AmbientField />
      {/* radial glow behind orb */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-vital/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-vital/25 bg-vital/[0.06] text-vital text-xs font-mono mb-7">
            <Sparkles size={13} />
            Your vitals, understood in plain language
          </div>

          <h1 className="font-display font-semibold text-5xl sm:text-6xl lg:text-[3.6rem] leading-[1.05] tracking-tight text-mist mb-6">
            A health copilot that
            <span className="text-gradient-vital"> listens before it advises.</span>
          </h1>

          <p className="text-lg text-slate leading-relaxed max-w-lg mb-9">
            Log symptoms, track vitals, and ask Aira anything about how you feel.
            It reads your history, reasons through it out loud, and tells you
            plainly when something's worth a doctor's attention — and when it isn't.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-vital text-ink font-semibold hover:bg-vital-dim transition-colors"
            >
              Start your health log
              <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-full border border-line text-mist text-sm font-medium hover:border-slate-dim transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="flex items-center gap-6 mt-11 pt-8 border-t border-line">
            <Stat value="24/7" label="Copilot availability" />
            <Stat value="<2s" label="Typical response time" />
            <Stat value="0" label="Diagnoses made for you" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.15 }}
          className="relative flex items-center justify-center"
        >
          <div className="animate-float-slow">
            <AiraOrb state="idle" size={460} />
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-ink-softer/80 backdrop-blur border border-line text-xs font-mono text-slate flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-vital animate-blink-dot" />
            Aira is listening
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display font-semibold text-2xl text-mist">{value}</div>
      <div className="text-xs text-slate-dim mt-0.5">{label}</div>
    </div>
  );
}
