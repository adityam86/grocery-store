import { API_BASE_URL } from '../constants/api';
import { storage } from '../utils/localStorage';

const authHeaders = () => ({
  Authorization: `Bearer ${storage.getToken()}`,
});

export const notificationAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      headers: authHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  },

  markRead: async (notificationId) => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to mark notification');
    return await res.json();
  },
};
