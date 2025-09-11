import { api } from "../utils/api";

export const staffDisposisiService = {
  // Terima disposisi
  terimaDisposisi: async (disposisiId) => {
    try {
      const response = await api.put(`/disposisi/bawahan/terima/${disposisiId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal menerima disposisi');
    }
  },

  // Dapatkan detail disposisi
  getDisposisiDetail: async (disposisiId) => {
    try {
      const response = await api.get(`/disposisi/bawahan/${disposisiId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil detail disposisi');
    }
  },

  // Dapatkan daftar disposisi
  getDaftarDisposisi: async (params = {}) => {
    try {
      const response = await api.get('/disposisi/bawahan', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil daftar disposisi');
    }
  },

  // Kirim feedback untuk disposisi
  submitFeedback: async (disposisiId, formData) => {
    try {
      const response = await api.post(`/feedback-disposisi/bawahan/${disposisiId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        'Gagal mengirim feedback. Silakan coba lagi.'
      );
    }
  },

  // Dapatkan daftar feedback saya
 getMyFeedback: async (params = {}) => {
    try {
      const response = await api.get('/feedback-disposisi/bawahan', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        'Gagal mengambil daftar feedback'
      );
    }
  },

  // Dapatkan detail feedback untuk edit
  getFeedbackForEdit: async (feedbackId) => {
    try {
      const response = await api.get(`/feedback-disposisi/bawahan/edit-view/${feedbackId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        'Gagal mengambil detail feedback'
      );
    }
  },

  // Update feedback
  updateFeedback: async (feedbackId, formData) => {
    try {
      const response = await api.put(`/feedback-disposisi/bawahan/edit/${feedbackId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || 
        'Gagal memperbarui feedback. Silakan coba lagi.'
      );
    }
  }
};