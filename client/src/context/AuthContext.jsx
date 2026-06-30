import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('takaloop_user');
    return u ? JSON.parse(u) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.success) {
        localStorage.setItem('takaloop_token', data.token);
        localStorage.setItem('takaloop_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally { setLoading(false); }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        localStorage.setItem('takaloop_token', data.token);
        localStorage.setItem('takaloop_user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('takaloop_token');
    localStorage.removeItem('takaloop_user');
    setUser(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('takaloop_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
