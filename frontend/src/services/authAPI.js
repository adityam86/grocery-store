import { API_ENDPOINTS } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${storage.getToken()}`,
});

export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  register: async (fullName, email, password) => {
    const res = await fetch(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  getProfile: async () => {
    const res = await fetch(API_ENDPOINTS.PROFILE, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
    return data;
  },

  updateProfile: async (updates) => {
    const res = await fetch(API_ENDPOINTS.PROFILE, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  addAddress: async (address) => {
    const res = await fetch(API_ENDPOINTS.ADDRESS, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add address');
    return data;
  },

  removeAddress: async (address) => {
    const res = await fetch(API_ENDPOINTS.ADDRESS, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ address }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to remove address');
    return data;
  },
};
