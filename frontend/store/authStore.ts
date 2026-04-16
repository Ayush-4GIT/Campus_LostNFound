'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user';

interface AuthState {
  user:     User | null;
  token:    string | null;
  isLoaded: boolean;
  setAuth:  (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:     null,
      token:    null,
      isLoaded: false,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('token', token);
        set({ user, token, isLoaded: true });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        set({ user: null, token: null, isLoaded: true });
      },
    }),
    { name: 'campus-auth' }
  )
);
