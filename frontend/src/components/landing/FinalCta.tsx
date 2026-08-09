import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import AiraOrb from '@/components/three/AiraOrb';

export default function FinalCta() {
  const navigate = useNavigate();
  return (
    <section className="relative py-32 border-t border-line overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 pointer-events-none">
        <AiraOrb state="listening" size={620} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl mx-auto px-6 text-center"
      >
        <h2 className="font-display font-semibold text-4xl sm:text-5xl text-mist tracking-tight mb-5">
          Start understanding your health today
        </h2>
        <p className="text-slate text-lg mb-10 leading-relaxed">
          Free to start. No credit card. Your first health log takes under a minute.
        </p>
        <button
          onClick={() => navigate('/signup')}
          className="group inline-flex items-center gap-2 px-7 py-4 rounded-full bg-vital text-ink font-semibold hover:bg-vital-dim transition-colors"
        >
          Create your account
          <ArrowRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </motion.div>
    </section>
  );
}
