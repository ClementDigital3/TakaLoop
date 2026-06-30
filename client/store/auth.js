import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: true,

  init: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('takaloop_token');
    const user = localStorage.getItem('takaloop_user');
    if (token && user) {
      set({ token, user: JSON.parse(user), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  login: (token, user) => {
    localStorage.setItem('takaloop_token', token);
    localStorage.setItem('takaloop_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('takaloop_token');
    localStorage.removeItem('takaloop_user');
    set({ token: null, user: null });
  },

  updateUser: (updates) => {
    const updated = { ...get().user, ...updates };
    localStorage.setItem('takaloop_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));
