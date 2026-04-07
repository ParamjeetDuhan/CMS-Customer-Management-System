import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { getToken, getUser, removeToken, removeUser } from '../utils/helpers';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* ── Bootstrap: restore session ── */
  useEffect(() => {
    const token   = getToken();
    const saved   = getUser();
    if (token && saved) {
      setUser(saved);
      // optionally refresh profile
      authService.getProfile()
        .then((data) => setUser(data.user ?? data))
        .catch(() => { removeToken(); removeUser(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (formData) => {
    const data = await authService.signup(formData);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updated) => {
    setUser(updated);
  }, []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
