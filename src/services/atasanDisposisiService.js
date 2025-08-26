import { api } from "../utils/api";

export const atasanDisposisiService = {

getAtasanDisposisiDetail: async (disposisiId) => {
    try {
      const response = await api.get(`/atasan/disposisi/${disposisiId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Gagal mengambil detail disposisi');
    }
  },
}