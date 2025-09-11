import { api } from "../utils/api";

export const atasanDisposisiService = {

  getAtasanDisposisi: async () => {
    try {
      const response = await api.get('/disposisi/atasan')
      return response.data;
    } catch (error) {

    }
  },

  getAtasanDisposisiDetail: async (disposisiId) => {
    try {
      const response = await api.get(`/disposisi/atasan/${disposisiId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil detail disposisi');
    }
  },

  getMyFeedback: async (role) => {
    try {
      const response = await api.get(`/feedback-disposisi/atasan/role/${role}`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil feedback anda');
    }
  },

  getFeedbackDariBawahan: async (role, id) => {
    try {
      const response = await api.get(`/feedback-disposisi/atasan/${role}/feedback-bawahan/${id}`)
      return response.data
    } catch (error) {
      // Preserve original error untuk bisa dicek status code-nya
      const enhancedError = new Error(error.response?.data?.error || 'Gagal mengambil feedback bawahan');
      enhancedError.status = error.response?.status;
      enhancedError.originalError = error;
      throw enhancedError;
    }
  },

  // Method baru dari dokumen
  acceptDisposisiSekretaris: async (id) => {
    try {
      const response = await api.put(`/disposisi/sekretaris/terima/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal menerima disposisi');
    }
  },

  acceptDisposisiKabid: async (id) => {
    try {
      const response = await api.put(`/disposisi/kabid/terima/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal menerima disposisi');
    }
  },

  downloadPDF: async (disposisiId) => {
    try {
      const response = await api.get(`/disposisi/download-pdf/${disposisiId}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengunduh PDF');
    }
  },

  createFeedback: async (role, id, formData) => {
    try {
      const response = await api.post(`/feedback-disposisi/atasan/${role}/buat/${id}`, formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengirim feedback');
    }
  },

  getFeedbackForEdit: async (role, feedbackId) => {
    try {
      const response = await api.get(`/feedback-disposisi/atasan/${role}/edit-view/${feedbackId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil data feedback untuk edit');
    }
  },

  updateFeedback: async (role, feedbackId, formData) => {
    try {
      const response = await api.put(`/feedback-disposisi/atasan/${role}/edit/${feedbackId}`, formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal memperbarui feedback');
    }
  }
};