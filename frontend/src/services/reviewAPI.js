import { API_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${storage.getToken()}`,
});

export const reviewAPI = {
  addReview: async (productId, { rating, comment }) => {
    const res = await fetch(API_ENDPOINTS.PRODUCT_REVIEWS(productId), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Review submission failed');
    return data;
  },
};
