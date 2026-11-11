import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types/api';

interface AuthState {
  user: User | null;
  token: string | null;
  adminToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (token: string, user: User, isAdmin?: boolean) => void;
  setAdminToken: (token: string) => void;
  logout: () => void;
  clearAdminToken: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      adminToken: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (token: string, user: User, isAdmin = false) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: isAdmin || user.role === 'admin',
          adminToken: isAdmin || user.role === 'admin' ? token : null,
        });
      },

      setAdminToken: (token: string) => {
        set({ adminToken: token, isAdmin: true });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        });
      },

      clearAdminToken: () => {
        set({ adminToken: null, isAdmin: false });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'zerotrust-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        adminToken: state.adminToken,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);