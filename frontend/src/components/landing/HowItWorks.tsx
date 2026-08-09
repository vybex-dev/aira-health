import { motion } from 'framer-motion';

const STEPS = [
  {
    tag: 'Step 1',
    title: 'Build your health profile',
    body: 'Add your age, conditions, allergies, and medications once. Every future answer is shaped by this context.',
  },
  {
    tag: 'Step 2',
    title: 'Log as you go',
    body: 'A symptom, a blood pressure reading, a rough night of sleep — thirty seconds of logging builds a real picture over time.',
  },
  {
    tag: 'Step 3',
    title: 'Ask, and get grounded answers',
    body: "Chat with Aira about how you're feeling. It reasons over your logged history and tells you what matters and what can wait.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-28 border-t border-line bg-ink-soft/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-xl mb-16">
          <p className="text-xs uppercase tracking-wider text-vital font-mono mb-3">How it works</p>
          <h2 className="font-display font-semibold text-4xl text-mist tracking-tight">
            Three steps, then it compounds
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.tag}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative pl-6"
            >
              <div className="absolute left-0 top-1 bottom-0 w-px bg-line">
                <div className="absolute -left-[3px] top-0 h-1.5 w-1.5 rounded-full bg-vital" />
              </div>
              <span className="text-xs font-mono text-vital">{step.tag}</span>
              <h3 className="font-display font-medium text-mist text-xl mt-2 mb-3">{step.title}</h3>
              <p className="text-sm text-slate leading-relaxed">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
