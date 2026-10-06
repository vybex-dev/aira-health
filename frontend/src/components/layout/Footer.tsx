import { Activity } from 'lucide-react';
import PoweredByVybex from '@/components/layout/PoweredByVybex';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-vital/10 border border-vital/30">
                <Activity size={14} className="text-vital" />
              </span>
              <span className="font-display font-semibold text-mist">Aira</span>
            </div>
            <p className="text-sm text-slate max-w-sm leading-relaxed">
              Aira is a wellness copilot, not a medical device. It doesn't diagnose,
              prescribe, or replace your clinician — it helps you understand your body
              and decide when to seek care.
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-dim mb-3 font-mono">Product</p>
            <ul className="space-y-2.5 text-sm text-slate">
              <li><a href="#copilot" className="hover:text-mist transition-colors">Copilot</a></li>
              <li><a href="#how-it-works" className="hover:text-mist transition-colors">How it works</a></li>
              <li><a href="#trust" className="hover:text-mist transition-colors">Trust &amp; safety</a></li>
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-slate-dim mb-3 font-mono">Emergency</p>
            <p className="text-sm text-slate leading-relaxed">
              If you're experiencing a medical emergency, call your local emergency
              number immediately. Don't wait on a chat response.
            </p>
          </div>
        </div>

        <div className="pulse-divider my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-dim">
          <span>© {new Date().getFullYear()} Aira Health. All rights reserved.</span>
          <span className="font-mono">Not a substitute for professional medical advice.</span>
          <PoweredByVybex />
        </div>
      </div>
    </footer>
  );
}
