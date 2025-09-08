// src/services/bukuTamuService.js
import { api } from '../utils/api'; // Sesuaikan path jika berbeda

// Fungsi untuk memuat daftar acara
export const fetchEvents = async (params = {}) => {
  try {
    const response = await api.get('/v1/buku-tamu', { params });
    return response.data; // Mengembalikan data dari API
  } catch (error) {
    console.error('Service Error - fetchEvents:', error);
    throw error; // Melempar error agar bisa ditangani di komponen
  }
};

// Fungsi untuk memuat daftar tamu berdasarkan ID acara
export const fetchGuests = async (eventId, params = {}) => {
  try {
    const response = await api.get(`/v1/buku-tamu/${eventId}/tamu`, { params });
    return response.data;
  } catch (error) {
    console.error('Service Error - fetchGuests:', error);
    throw error;
  }
};

// Fungsi untuk membuat acara baru
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/v1/buku-tamu', eventData);
    return response.data;
  } catch (error) {
    console.error('Service Error - createEvent:', error);
    throw error;
  }
};

// Fungsi untuk mengubah status acara
export const updateEventStatus = async (eventId, status) => {
  try {
    const response = await api.patch(`/v1/buku-tamu/${eventId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Service Error - updateEventStatus:', error);
    throw error;
  }
};

// Fungsi untuk menghapus acara
export const deleteEvent = async (eventId) => {
  try {
     // Tidak perlu mengembalikan data karena ini DELETE, cukup cek status berhasil
    const response = await api.delete(`/v1/buku-tamu/${eventId}`);
    return response; // Atau bisa return true jika hanya perlu tahu berhasil
  } catch (error) {
    console.error('Service Error - deleteEvent:', error);
    throw error;
  }
};

// Fungsi untuk menghapus foto tamu
export const deleteGuestPhoto = async (photoId) => { // Perhatikan: di komponen asli, endpoint-nya pakai photoId, bukan eventId. Ini mungkin typo di komponen.
  try {
    const response = await api.delete(`/v1/buku-tamu/foto/${photoId}`); // Sesuaikan endpoint jika perlu
    return response;
  } catch (error) {
    console.error('Service Error - deleteGuestPhoto:', error);
    throw error;
  }
};

// Jika ada fungsi lain seperti download QR, itu biasanya dilakukan langsung di komponen
// karena melibatkan DOM (createElement, click link), bukan pemanggilan API murni.