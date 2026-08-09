import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const NAV_LINKS = [
  { label: 'Copilot', href: '#copilot' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Trust & safety', href: '#trust' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-ink/85 backdrop-blur-lg border-b border-line' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 h-18 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-vital/10 border border-vital/30">
            <Activity size={16} className="text-vital" strokeWidth={2.5} />
            <span className="absolute inset-0 rounded-full border border-vital/40 animate-ping opacity-40" />
          </span>
          <span className="font-display font-semibold text-lg tracking-tight text-mist">Aira</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate hover:text-mist transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate('/app')}
              className="px-4 py-2 rounded-full bg-vital text-ink text-sm font-semibold hover:bg-vital-dim transition-colors"
            >
              Open dashboard
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate hover:text-mist transition-colors"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2 rounded-full bg-vital text-ink text-sm font-semibold hover:bg-vital-dim transition-colors"
              >
                Get started
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-mist"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-ink border-t border-line px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-slate hover:text-mist"
            >
              {link.label}
            </a>
          ))}
          <div className="pulse-divider my-1" />
          {user ? (
            <button
              onClick={() => navigate('/app')}
              className="px-4 py-2.5 rounded-full bg-vital text-ink text-sm font-semibold text-center"
            >
              Open dashboard
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} className="text-sm text-slate text-left">
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-4 py-2.5 rounded-full bg-vital text-ink text-sm font-semibold"
              >
                Get started
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
