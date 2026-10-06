import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import {
  Activity,
  LayoutDashboard,
  MessagesSquare,
  ClipboardList,
  LineChart,
  UserCircle,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/useAuthStore';
import AppFooter from '@/components/layout/AppFooter';

const NAV_ITEMS = [
  { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/app/chat', label: 'Copilot chat', icon: MessagesSquare },
  { to: '/app/log', label: 'Health log', icon: ClipboardList },
  { to: '/app/insights', label: 'Insights', icon: LineChart },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
];

export default function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { profile, user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    if (auth) await signOut(auth);
    navigate('/');
  }

  const initials = (profile?.displayName || user?.displayName || user?.email || '?')
    .trim()
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-ink flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 h-16 flex items-center justify-between px-5 bg-ink/90 backdrop-blur border-b border-line">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-vital/10 border border-vital/30">
            <Activity size={14} className="text-vital" />
          </span>
          <span className="font-display font-semibold text-mist">Aira</span>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)} className="text-mist" aria-label="Toggle menu">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 flex-shrink-0 bg-ink-soft border-r border-line flex flex-col z-40 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="hidden lg:flex items-center gap-2.5 px-6 h-20 border-b border-line">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-vital/10 border border-vital/30">
            <Activity size={16} className="text-vital" />
          </span>
          <span className="font-display font-semibold text-lg text-mist">Aira</span>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 mt-16 lg:mt-0 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-vital/10 text-vital border border-vital/20'
                    : 'text-slate hover:text-mist hover:bg-ink-softer border border-transparent'
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-line">
          <div className="flex items-center gap-3 px-2 py-2">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-vital/15 text-vital text-xs font-semibold font-mono">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="text-sm text-mist truncate">{profile?.displayName || user?.displayName || 'Your account'}</p>
              <p className="text-xs text-slate-dim truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full mt-1 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate hover:text-coral hover:bg-coral/5 transition-colors"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-16 lg:pt-0 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        {/* Chat fills the full viewport height, so it skips the footer */}
        {pathname !== '/app/chat' && <AppFooter />}
      </main>
    </div>
  );
}
