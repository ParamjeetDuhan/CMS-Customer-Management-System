export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const TOKEN_KEY        = 'shopnear_token';
export const USER_KEY         = 'shopnear_user';
export const CART_KEY         = 'shopnear_cart';
export const LOCATION_KEY     = 'shopnear_location';

export const ORDER_STATUS = {
  PENDING:    'Pending',
  CONFIRMED:  'Confirmed',
  PREPARING:  'Preparing',
  SHIPPED:    'Shipped',
  DELIVERED:  'Delivered',
  CANCELLED:  'Cancelled',
};

export const PAYMENT_STATUS = {
  PENDING:   'Pending',
  PAID:      'Paid',
  FAILED:    'Failed',
  REFUNDED:  'Refunded',
};

export const PAYMENT_METHODS = [
  { value: 'card',   label: 'Credit / Debit Card' },
  { value: 'upi',    label: 'UPI' },
  { value: 'cod',    label: 'Cash on Delivery' },
  { value: 'wallet', label: 'Wallet' },
];

export const SHOP_CATEGORIES = [
  'All',
  'Grocery',
  'Electronics',
  'Fashion',
  'Food & Beverages',
  'Pharmacy',
  'Bakery',
  'Stationery',
  'Hardware',
  'Other',
];

export const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest First' },
  { value: 'rating',   label: 'Highest Rated' },
  { value: 'name',     label: 'Name (A-Z)' },
];

export const DEFAULT_AVATAR  = 'https://ui-avatars.com/api/?background=f97316&color=fff&bold=true&name=';
export const DEFAULT_SHOP_IMG = 'https://placehold.co/400x200/1a1a1a/f97316?text=Shop';

export const ROUTES = {
  HOME:         '/',
  LOGIN:        '/login',
  SIGNUP:       '/signup',
  SHOPS:        '/shops',
  SHOP_DETAILS: '/shops/:id',
  PRODUCTS:     '/shops/:id/products',
  CART:         '/cart',
  CHECKOUT:     '/checkout',
  ORDERS:       '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE:      '/profile',
  PAYMENT:      '/payment',
};
