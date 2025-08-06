// services/suratService.js
import { api } from '../utils/api';

export const suratService = {
  // Fetch all surat masuk
  async getAllSuratMasuk() {
    try {
      const response = await api.get('/surat-masuk/all');
      const result = response.data;
      console.log('API Response:', result);
      return result.data || [];
    } catch (error) {
      console.error('Error fetching surat masuk:', error);
      throw new Error(error.message || 'Gagal mengambil data surat masuk');
    }
  },

  // Fetch photo with blob response
  async getPhoto(photoUrl) {
    try {
      const response = await api.get(photoUrl.replace('/api', ''), {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw new Error('Gagal memuat foto');
    }
  }
};