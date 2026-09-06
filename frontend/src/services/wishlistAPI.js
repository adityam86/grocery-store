import { API_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${storage.getToken()}`,
});

export const wishlistAPI = {
  getWishlist: async () => {
    const res = await fetch(API_ENDPOINTS.WISHLIST, { headers: authHeaders() });
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return await res.json();
  },

  toggle: async (productId) => {
    const res = await fetch(API_ENDPOINTS.WISHLIST_TOGGLE, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ productId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Wishlist toggle failed');
    return data;
  },
};
