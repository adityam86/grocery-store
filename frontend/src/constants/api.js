export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  ADDRESS: `${API_BASE_URL}/api/auth/address`,

  // Products
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT: (id) => `${API_BASE_URL}/api/products/${id}`,
  PRODUCT_REVIEWS: (id) => `${API_BASE_URL}/api/products/${id}/reviews`,

  // Wishlist
  WISHLIST: `${API_BASE_URL}/api/auth/wishlist`,
  WISHLIST_TOGGLE: `${API_BASE_URL}/api/auth/wishlist/toggle`,

  // Orders
  ORDERS: `${API_BASE_URL}/api/orders`,
  ORDER: (id) => `${API_BASE_URL}/api/orders/${id}`,
  ORDER_INVOICE: (id) => `${API_BASE_URL}/api/orders/${id}/invoice`,
  ORDER_STATUS: (id) => `${API_BASE_URL}/api/orders/${id}/status`,

  // Payments
  PAYMENT_INTENT: `${API_BASE_URL}/api/payments/create-intent`,
  PAYMENT_CONFIRM: `${API_BASE_URL}/api/payments/confirm`,
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'apna_bazar_token',
  USER: 'apna_bazar_user',
  CART: 'apna_bazar_cart',
  THEME: 'apna_bazar_theme',
  WISHLIST: 'apna_bazar_simulated_wishlist',
  ORDERS: 'apna_bazar_simulated_orders',
  PRODUCTS: 'apna_bazar_simulated_products',
};
