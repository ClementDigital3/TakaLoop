'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('takaloop_token');
    if (token) {
      getMe()
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('takaloop_token'); localStorage.removeItem('takaloop_user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    localStorage.setItem('takaloop_token', token);
    localStorage.setItem('takaloop_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('takaloop_token');
    localStorage.removeItem('takaloop_user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
