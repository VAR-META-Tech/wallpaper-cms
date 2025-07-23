import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services/api';
import type { LoginCredentials, User } from '../types/interfaces';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
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
          const response = await authApi.login(credentials);
          
          if (response.data.success) {
            const { token, user } = response.data.data;
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              isLoading: false,
              error: null
            });
            
            return { success: true };
          } else {
            const errorMessage = response.data.error || 'Login failed';
            set({
              error: errorMessage,
              isLoading: false,
              isAuthenticated: false,
            });
            return { success: false, error: errorMessage };
          }
        } catch (error: any) {
          console.error('Login error:', error);
          const errorMessage = error.response?.data?.error || error.message || 'Authentication failed';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
          });
          return { success: false, error: errorMessage };
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
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        try {
          const response = await authApi.verifyToken();
          
          if (response.data.success) {
            const user = response.data.data;
            localStorage.setItem('auth_user', JSON.stringify(user));
            set({ 
              user, 
              token, 
              isAuthenticated: true 
            });
          } else {
            // Token invalid, clear auth state
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false 
            });
          }
        } catch (error) {
          // Token verification failed, clear auth state
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
        }
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