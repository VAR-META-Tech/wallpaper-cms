import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LoginCredentials, User } from '../types/interfaces';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  verifyToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simple demo authentication - accept admin/admin123
          if (credentials.username === 'admin' && credentials.password === 'admin123') {
            const user = { id: '1', username: 'admin', role: 'admin' };
            const token = 'demo_token_' + Date.now();
            localStorage.setItem('auth_token', token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Invalid credentials');
          }
        } catch (error: any) {
          const errorMessage = 'Invalid username or password';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      verifyToken: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token || !token.startsWith('demo_token_')) {
          set({ isAuthenticated: false });
          return;
        }

        // Demo token verification - accept any token that starts with 'demo_token_'
        set({
          user: { id: '1', username: 'admin', role: 'admin' },
          token,
          isAuthenticated: true,
        });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);