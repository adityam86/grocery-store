import { API_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${storage.getToken()}`,
});

export const productAPI = {
  getAll: async ({ category, search } = {}) => {
    const url = new URL(API_ENDPOINTS.PRODUCTS);
    if (category && category !== 'all') url.searchParams.append('category', category);
    if (search) url.searchParams.append('search', search);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  },

  getById: async (id) => {
    const res = await fetch(API_ENDPOINTS.PRODUCT(id));
    if (!res.ok) throw new Error('Product not found');
    return await res.json();
  },

  create: async (productData) => {
    const res = await fetch(API_ENDPOINTS.PRODUCTS, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create product');
    return data;
  },

  update: async (id, updates) => {
    const res = await fetch(API_ENDPOINTS.PRODUCT(id), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update product');
    return data;
  },

  delete: async (id) => {
    const res = await fetch(API_ENDPOINTS.PRODUCT(id), {
      method: 'DELETE',
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete product');
    return data;
  },

  addReview: async (productId, { rating, comment }) => {
    const res = await fetch(API_ENDPOINTS.PRODUCT_REVIEWS(productId), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add review');
    return data;
  },
};
