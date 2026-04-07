import api from './api';
import { setToken, setUser, removeToken, removeUser } from '../utils/helpers';

const authService = {
  /** Register new customer */
  signup: async (data) => {
    const res = await api.post('/auth/signup', data);
    if (res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  },

  /** Login existing customer */
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  },

  /** Logout */
  logout: () => {
    removeToken();
    removeUser();
  },

  /** Fetch own profile */
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  /** Update profile */
  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.user) setUser(res.data.user);
    return res.data;
  },

  /** Change password */
  changePassword: async (data) => {
    const res = await api.put('/auth/change-password', data);
    return res.data;
  },

  /** Forgot password */
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  /** Reset password */
  resetPassword: async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, newPassword });
    return res.data;
  },
};

export default authService;
