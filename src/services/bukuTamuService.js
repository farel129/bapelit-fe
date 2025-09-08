// services/bukuTamuService.js
import { api } from '../utils/api';

export class BukuTamuService {
  // Events API calls
  static async getEvents(params = {}) {
    try {
      const response = await api.get('/v1/buku-tamu', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal memuat data buku tamu');
    }
  }

  static async createEvent(eventData) {
    try {
      const response = await api.post('/v1/buku-tamu', eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal membuat buku tamu');
    }
  }

  static async updateEventStatus(eventId, status) {
    try {
      const response = await api.patch(`/v1/buku-tamu/${eventId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengubah status acara');
    }
  }

  static async deleteEvent(eventId) {
    try {
      const response = await api.delete(`/v1/buku-tamu/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal menghapus buku tamu');
    }
  }

  // Guests API calls
  static async getGuests(eventId, params = {}) {
    try {
      const response = await api.get(`/v1/buku-tamu/${eventId}/tamu`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal memuat data tamu');
    }
  }

  // Photos API calls
  static async deleteGuestPhoto(photoId) {
    try {
      const response = await api.delete(`/v1/buku-tamu/${photoId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal menghapus foto');
    }
  }
}