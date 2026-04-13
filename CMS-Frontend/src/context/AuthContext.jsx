import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';
import { getToken, getUser, removeToken, removeUser } from '../utils/helpers';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /*
   * onAddressesReceived is a ref to a callback that AddressContext
   * registers once it mounts. When login returns addresses we fire it
   * so AddressContext can seed itself without a second network call.
   */
  const onAddressesReceived = useRef(null);

  /** AddressContext calls this once on mount to wire up the seed fn */
  const registerAddressSeed = useCallback((fn) => {
    onAddressesReceived.current = fn;
  }, []);

  /* ── Bootstrap: restore session on page reload ── */
  useEffect(() => {
    const token = getToken();
    const saved = getUser();
    if (token && saved) {
      setUser(saved);
      authService.getProfile()
        .then((data) => setUser(data.user ?? data))
        .catch(() => { removeToken(); removeUser(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  /* ── Login ── */
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);

    /* Seed addresses into AddressContext from the login response
       — avoids a second round-trip to the backend */
    if (data.addresses?.length && onAddressesReceived.current) {
      onAddressesReceived.current(data.addresses);
    }

    return data;
  }, []);

  /* ── Signup ── */
  const signup = useCallback(async (formData) => {
    const data = await authService.signup(formData);
    setUser(data.user);
    return data;
  }, []);

  /* ── Logout ── */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const updateUser = useCallback((updated) => setUser(updated), []);

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated,
      login, signup, logout, updateUser,
      registerAddressSeed,
    }}>
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