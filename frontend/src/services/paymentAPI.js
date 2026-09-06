import { API_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${storage.getToken()}`,
});

export const paymentAPI = {
  createIntent: async (amount) => {
    const res = await fetch(API_ENDPOINTS.PAYMENT_INTENT, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment intent failed');
    return data;
  },

  confirm: async (orderId, paymentId) => {
    const res = await fetch(API_ENDPOINTS.PAYMENT_CONFIRM, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ orderId, paymentId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Payment confirmation failed');
    return data;
  },
};
