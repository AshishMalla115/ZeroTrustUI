import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { X, Shield, ShieldCheck, ShieldAlert, ShieldOff, UserCheck, Database, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { useState, useEffect } from 'react';

const scenarios = [
  { id: 1, path: '/scenario/1', title: 'Normal Login', icon: ShieldCheck, desc: 'Legitimate user authentication' },
  { id: 2, path: '/scenario/2', title: 'Failed Auth (Brute Force)', icon: ShieldAlert, desc: '3 consecutive wrong passwords' },
  { id: 3, path: '/scenario/3', title: 'Middleware Scoring', icon: Database, desc: 'Continuous verification on each request' },
  { id: 4, path: '/scenario/4', title: 'Token Blacklist', icon: ShieldOff, desc: 'Session revocation after logout' },
  { id: 5, path: '/scenario/5', title: 'Admin Flow', icon: UserCheck, desc: 'Privileged visibility & override' },
  { id: 6, path: '/scenario/6', title: 'Input Validation', icon: Terminal, desc: 'Schema-level rejection (422)' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { adminToken } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={clsx(
          'fixed top-16 left-0 z-30 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0'
        )}
      >
        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          <NavLink
            to="/"
            className={clsx(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              location.pathname === '/'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Shield className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Attack Scenarios
            </h3>
          </div>

          {scenarios.map((scenario) => {
            const isActive = location.pathname === scenario.path;
            const Icon = scenario.icon;
            const isAdminOnly = scenario.id === 5;

            return (
              <NavLink
                key={scenario.id}
                to={scenario.path}
                className={clsx(
                  'flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  isAdminOnly && !adminToken && 'opacity-50 cursor-not-allowed pointer-events-none'
                )}
                aria-disabled={isAdminOnly && !adminToken}
              >
                <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600')} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{scenario.title}</p>
                  <p className="text-xs text-gray-500 truncate">{scenario.desc}</p>
                </div>
              </NavLink>
            );
          })}

          <div className="pt-4 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Backend Status
            </h3>
            <BackendStatus />
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Close Sidebar
          </button>
        </div>
      </aside>
    </>
  );
};

const BackendStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(2000) });
        setStatus(res.ok ? 'connected' : 'disconnected');
      } catch {
        setStatus('disconnected');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 text-sm">
      <span className={clsx(
        'w-2 h-2 rounded-full',
        status === 'connected' && 'bg-green-500',
        status === 'disconnected' && 'bg-red-500',
        status === 'checking' && 'bg-yellow-500 animate-pulse'
      )} />
      <span className="text-gray-600 capitalize">{status}</span>
    </div>
  );
};