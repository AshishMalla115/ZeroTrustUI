import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { Button } from '../common/Button';
import { DecisionBadge } from '../common/DecisionBadge';
import { Menu, X, User, Shield, LogOut, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

export const Header = () => {
  const { user, adminToken, isAuthenticated, isAdmin, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 h-16">
      <div className="flex items-center justify-between h-full px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className={clsx('p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden', sidebarOpen && 'bg-gray-100')}
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-600" />
            <span className="font-bold text-xl text-gray-900 hidden sm:block">Zero Trust Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.email}</span>
                <DecisionBadge decision={isAdmin ? 'allow' : 'mfa'} size="sm" />
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-700">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 hidden md:block" />
                </button>
              </div>

              {adminToken && (
                <Button variant="ghost" size="sm" onClick={() => window.location.href = '/scenario/5'}>
                  Admin Dashboard
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}

          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => window.location.href = '/scenario/1'}>
                Login
              </Button>
              <Button size="sm" onClick={() => window.location.href = '/scenario/5'}>
                Admin Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};