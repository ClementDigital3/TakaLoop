import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  totalPoints: number;
  badge: string;
  qrCode: string;
  ward?: string;
  county?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (v: boolean) => void;
  logout: () => void;
  init: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem('takaloop_user', JSON.stringify(user));
    else localStorage.removeItem('takaloop_user');
  },

  setToken: (token) => {
    set({ token });
    if (token) localStorage.setItem('takaloop_token', token);
    else localStorage.removeItem('takaloop_token');
  },

  setLoading: (isLoading) => set({ isLoading }),

  logout: () => {
    localStorage.removeItem('takaloop_token');
    localStorage.removeItem('takaloop_user');
    set({ user: null, token: null });
  },

  init: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('takaloop_token');
      const user = localStorage.getItem('takaloop_user');
      set({
        token: token || null,
        user: user ? JSON.parse(user) : null,
        isLoading: false,
      });
    }
  },
}));
