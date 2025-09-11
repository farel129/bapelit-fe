// api.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Guest Book API Functions
export const guestBookAPI = {
  // Get event info by QR token
  getEventInfo: async (qrToken) => {
    try {
      const response = await api.get(`/buku-tamu/${qrToken}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Event not found');
    }
  },

  // 🆕 NEW: Check apakah device sudah pernah submit
  checkDeviceSubmission: async (qrToken, deviceId) => {
    try {
      const response = await api.post(`/buku-tamu/${qrToken}/check-device`, {
        device_id: deviceId
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Check submission failed');
    }
  },

  // Submit attendance with photos (UPDATED - sudah include device_id)
  submitAttendance: async (qrToken, formData) => {
    try {
      const response = await api.post(`/buku-tamu/${qrToken}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      // Preserve error structure untuk handling di component
      const errorResponse = {
        response: {
          data: error.response?.data || { error: 'Unknown error' },
          status: error.response?.status || 500
        }
      };
      throw errorResponse;
    }
  }
};

export default api;