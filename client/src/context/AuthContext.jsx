// context/AuthContext.jsx
// Keeps the logged-in user available to every page (like a global variable).

import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start with whatever was saved in localStorage so refresh keeps you logged in
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });
  const [checking, setChecking] = useState(Boolean(localStorage.getItem('token')));

  // On app load, confirm the saved token is still valid
  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api
      .get('/auth/me')
      .then((res) => saveUser(res.data.user))
      .catch(() => {}) // 401 is handled by the axios interceptor
      .finally(() => setChecking(false));
  }, []);

  const saveUser = (u) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const saveSession = ({ token, user: u }) => {
    localStorage.setItem('token', token);
    saveUser(u);
    return u;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return saveSession(res.data);
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    return saveSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
