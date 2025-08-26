import { api } from "../utils/api";

export const staffDisposisiService = {
  // Terima disposisi
  terimaDisposisi: async (disposisiId) => {
    try {
      const response = await api.put(`/staff/disposisi/terima/${disposisiId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal menerima disposisi');
    }
  },

  // Dapatkan detail disposisi
  getDisposisiDetail: async (disposisiId) => {
    try {
      const response = await api.get(`/staff/disposisi/${disposisiId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil detail disposisi');
    }
  },

  // Dapatkan daftar disposisi
  getDaftarDisposisi: async (params = {}) => {
    try {
      const response = await api.get('/staff/disposisi', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil daftar disposisi');
    }
  },

  // Kirim feedback untuk disposisi
  submitFeedback: async (disposisiId, formData) => {
    try {
      const response = await api.post(`/bawahan/disposisi/${disposisiId}/feedback`, formData, {
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
      console.log('🔍 Calling getMyFeedback:', '/bawahan/feedback/saya'); // ← Debug log
      const response = await api.get('/bawahan/feedback/saya', { params });
      console.log('✅ getMyFeedback success:', response.data); // ← Debug log
      return response.data;
    } catch (error) {
      console.error('❌ getMyFeedback error:', error.response); // ← Debug log
      console.error('❌ Full error object:', error); // ← Debug log
      throw new Error(
        error.response?.data?.error || 
        'Gagal mengambil daftar feedback'
      );
    }
  },

  // Dapatkan detail feedback untuk edit
  getFeedbackForEdit: async (feedbackId) => {
    try {
      const response = await api.get(`/bawahan/feedback/${feedbackId}/edit`);
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
      const response = await api.put(`/bawahan/feedback/${feedbackId}`, formData, {
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