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
    const response = await api.get(`/public/buku-tamu/${qrToken}`);
    return response.data;
  },

  // Submit attendance with photos
  submitAttendance: async (qrToken, formData) => {
    const response = await api.post(`/public/buku-tamu/${qrToken}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};

export default api;