import { LOCAL_STORAGE_KEYS } from '../constants/api';

export const storage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  },
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  },

  // Typed helpers
  getToken: () => localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN) || null,
  setToken: (token) => localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token),
  removeToken: () => localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN),

  getUser: () => {
    try {
      const u = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  setUser: (user) => localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(LOCAL_STORAGE_KEYS.USER),

  getCart: () => {
    try {
      const c = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      return c ? JSON.parse(c) : [];
    } catch { return []; }
  },
  setCart: (cart) => localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart)),

  getTheme: () => localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) || 'saffron',
  setTheme: (theme) => localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, theme),

  getWishlist: () => {
    try {
      const w = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST);
      return w ? JSON.parse(w) : [];
    } catch { return []; }
  },
  setWishlist: (list) => localStorage.setItem(LOCAL_STORAGE_KEYS.WISHLIST, JSON.stringify(list)),

  getSimulatedOrders: () => {
    try {
      const o = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return o ? JSON.parse(o) : [];
    } catch { return []; }
  },
  setSimulatedOrders: (orders) => localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders)),

  getSimulatedProducts: () => {
    try {
      const p = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
      return p ? JSON.parse(p) : null;
    } catch { return null; }
  },
  setSimulatedProducts: (products) => localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products)),

  clearAuth: () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  },
};
