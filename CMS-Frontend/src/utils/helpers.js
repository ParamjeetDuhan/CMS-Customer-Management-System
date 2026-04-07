import { TOKEN_KEY, USER_KEY } from './constants';

/* ─── Token helpers ───────────────────────────────── */
export const getToken    = ()        => localStorage.getItem(TOKEN_KEY);
export const setToken    = (token)   => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = ()        => localStorage.removeItem(TOKEN_KEY);

export const getUser     = ()        => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};
export const setUser     = (user)    => localStorage.setItem(USER_KEY, JSON.stringify(user));
export const removeUser  = ()        => localStorage.removeItem(USER_KEY);

/* ─── Currency ────────────────────────────────────── */
export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);

/* ─── Date ────────────────────────────────────────── */
export const formatDate = (dateStr, opts = {}) =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    ...opts,
  });

export const formatDateTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ─── Distance ────────────────────────────────────── */
export const formatDistance = (km) =>
  km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;

export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* ─── Text ────────────────────────────────────────── */
export const truncate = (str, n = 100) =>
  str?.length > n ? `${str.slice(0, n)}…` : str;

export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

export const slugify = (str) =>
  str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

/* ─── Cart ────────────────────────────────────────── */
export const calcCartTotal = (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const calcCartCount = (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

/* ─── Validation ──────────────────────────────────── */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) =>
  /^[6-9]\d{9}$/.test(phone);

export const isValidPassword = (pass) =>
  pass.length >= 6;

/* ─── Stars ────────────────────────────────────────── */
export const renderStars = (rating) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return { full, half, empty };
};

/* ─── Order status colours ────────────────────────── */
export const statusColour = (status) => {
  const map = {
    Pending:   'warning',
    Confirmed: 'info',
    Preparing: 'info',
    Shipped:   'primary',
    Delivered: 'success',
    Cancelled: 'error',
    Paid:      'success',
    Failed:    'error',
    Refunded:  'warning',
  };
  return map[status] || 'info';
};

/* ─── Geolocation ─────────────────────────────────── */
export const getUserLocation = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
