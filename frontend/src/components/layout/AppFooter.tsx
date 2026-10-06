import { Link } from 'react-router-dom';
import PoweredByVybex from '@/components/layout/PoweredByVybex';

export default function AppFooter() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-dim">
        <span>© {new Date().getFullYear()} Aira Health</span>
        <nav aria-label="Footer" className="flex items-center gap-5">
          <Link to="/app" className="hover:text-mist transition-colors">Overview</Link>
          <Link to="/app/profile" className="hover:text-mist transition-colors">Profile</Link>
          <Link to="/" className="hover:text-mist transition-colors">Home</Link>
        </nav>
        <PoweredByVybex />
      </div>
    </footer>
  );
}
