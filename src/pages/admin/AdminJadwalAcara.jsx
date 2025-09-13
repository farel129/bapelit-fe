import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, User, Clock, Filter, Search, X } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast'; // Gunakan toast untuk feedback lebih elegan
import Skeleton from '../../components/Ui/Skeleton';

const AdminJadwalAcara = () => {
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filter, setFilter] = useState({
    status: '',
    kategori: '',
    bulan: '',
    tahun: new Date().getFullYear()
  });

  // State untuk rekomendasi lokasi
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    nama_acara: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu_mulai: '',
    waktu_selesai: '',
    lokasi: '',
    pic_nama: '',
    pic_kontak: '',
    kategori: '',
    status: 'aktif',
    prioritas: 'biasa',
    peserta_target: '',
    serp_data: null
  });

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append('status', filter.status);
      if (filter.kategori) params.append('kategori', filter.kategori);
      if (filter.bulan) params.append('bulan', filter.bulan);
      params.append('tahun', filter.tahun);

      const response = await api.get(`/jadwal-acara?${params}`);
      setJadwalList(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        toast.error('Terjadi kesalahan saat mengambil data');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJadwal();
  }, [filter]);

  // Debounce untuk pencarian rekomendasi
  useEffect(() => {
    const handler = setTimeout(() => {
      if (formData.lokasi.length >= 3) {
        searchRecommendations(formData.lokasi);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [formData.lokasi]);

  const searchRecommendations = async (query) => {
    if (!query.trim() || query.length < 3) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }

    try {
      const response = await api.get(`/jadwal-acara/rekomendasi-lokasi?q=${encodeURIComponent(query)}`);

      if (response.data.local_results && response.data.local_results.length > 0) {
        setRecommendations(response.data.local_results);
        setShowRecommendations(true);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } catch (error) {
      console.error('Error searching recommendations:', error);
      setRecommendations([]);
      setShowRecommendations(false);
    }
  };

  const selectRecommendation = (recommendation) => {
    let locationString = recommendation.title;
    if (recommendation.address) {
      locationString += `, ${recommendation.address}`;
    }

    setFormData(prev => ({
      ...prev,
      lokasi: locationString,
      serp_data: {
        place_id: recommendation.place_id,
        coordinates: recommendation.coordinates
      }
    }));

    setShowRecommendations(false);
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      toast.error('Masukkan nama lokasi atau alamat');
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(`/jadwal-acara/rekomendasi-lokasi?q=${encodeURIComponent(query)}`);

      if (response.data.local_results && response.data.local_results.length > 0) {
        const firstResult = response.data.local_results[0];

        let locationString = firstResult.title;
        if (firstResult.address) {
          locationString += `, ${firstResult.address}`;
        }

        setFormData(prev => ({
          ...prev,
          lokasi: locationString,
          serp_data: {
            place_id: firstResult.place_id,
            coordinates: firstResult.coordinates
          }
        }));

        toast.success(`Lokasi ditemukan: ${locationString}`);
      } else {
        setFormData(prev => ({
          ...prev,
          lokasi: query.trim()
        }));
        toast.info('Lokasi tidak ditemukan di database, menampilkan berdasarkan input Anda');
      }
    } catch (error) {
      console.error('Error searching with location service:', error);
      setFormData(prev => ({
        ...prev,
        lokasi: query.trim()
      }));
      toast.error('Gagal mencari lokasi, menampilkan berdasarkan input Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/jadwal-acara/${editingId}`, formData);
        toast.success('Jadwal acara berhasil diupdate!');
      } else {
        await api.post('/jadwal-acara', formData);
        toast.success('Jadwal acara berhasil dibuat!');
      }

      resetForm();
      fetchJadwal();
    } catch (error) {
      console.error('Error saving data:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        toast.error('Terjadi kesalahan saat menyimpan data');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nama_acara: '',
      deskripsi: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
      waktu_mulai: '',
      waktu_selesai: '',
      lokasi: '',
      pic_nama: '',
      pic_kontak: '',
      kategori: '',
      status: 'aktif',
      prioritas: 'biasa',
      peserta_target: '',
      serp_data: null
    });
    setShowForm(false);
    setEditingId(null);
    setRecommendations([]);
    setShowRecommendations(false);
  };

  const handleEdit = (jadwal) => {
    setFormData({
      nama_acara: jadwal.nama_acara,
      deskripsi: jadwal.deskripsi,
      tanggal_mulai: jadwal.tanggal_mulai,
      tanggal_selesai: jadwal.tanggal_selesai,
      waktu_mulai: jadwal.waktu_mulai,
      waktu_selesai: jadwal.waktu_selesai || '',
      lokasi: jadwal.lokasi,
      pic_nama: jadwal.pic_nama,
      pic_kontak: jadwal.pic_kontak,
      kategori: jadwal.kategori,
      status: jadwal.status,
      prioritas: jadwal.prioritas,
      peserta_target: jadwal.peserta_target || '',
      serp_data: jadwal.serp_data || null
    });
    setEditingId(jadwal.id);
    setShowForm(true);
    setRecommendations([]);
    setShowRecommendations(false);
  };

  const handleDelete = async (id, nama) => {
    if (!window.confirm(`Hapus jadwal acara "${nama}"? Tindakan ini tidak dapat dibatalkan.`)) return;

    setLoading(true);
    try {
      await api.delete(`/jadwal-acara/${id}`);
      toast.success('Jadwal acara berhasil dihapus!');
      fetchJadwal();
    } catch (error) {
      console.error('Error deleting data:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        toast.error('Terjadi kesalahan saat menghapus data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    try {
      await api.patch(`/jadwal-acara/${id}`, { status: newStatus });
      toast.success(`Status berhasil diubah ke ${newStatus}!`);
      fetchJadwal();
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        toast.error('Terjadi kesalahan saat mengubah status');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'aktif': 'bg-green-50 text-green-800 border border-green-200',
      'selesai': 'bg-blue-50 text-blue-800 border border-blue-200',
      'dibatalkan': 'bg-red-50 text-red-800 border border-red-200',
      'ditunda': 'bg-yellow-50 text-yellow-800 border border-yellow-200'
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {status === 'aktif' ? 'Aktif' :
          status === 'selesai' ? 'Selesai' :
            status === 'dibatalkan' ? 'Dibatalkan' :
              status === 'ditunda' ? 'Ditunda' : status}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'sangat penting': return 'text-red-600';
      case 'penting': return 'text-orange-600';
      case 'biasa': return 'text-[#6b7280]';
      default: return 'text-[#6b7280]';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showRecommendations && !event.target.closest('.location-input-container')) {
        setShowRecommendations(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRecommendations]);

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border-2 border-[#e5e7eb] p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <Calendar className="h-6 w-6 text-pink-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#000000]">Jadwal Acara</h1>
              <p className="text-sm font-medium text-[#6b7280]">Kelola jadwal acara instansi dengan efisien</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-black hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tambah Jadwal
          </button>
        </div>

        {/* Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
              <option value="ditunda">Ditunda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Kategori</label>
            <select
              value={filter.kategori}
              onChange={(e) => setFilter({ ...filter, kategori: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
            >
              <option value="">Semua Kategori</option>
              <option value="rapat">Rapat</option>
              <option value="pelatihan">Pelatihan</option>
              <option value="seminar">Seminar</option>
              <option value="umum">Umum</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Bulan</label>
            <select
              value={filter.bulan}
              onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
            >
              <option value="">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#000000] mb-1">Tahun</label>
            <input
              type="number"
              value={filter.tahun}
              onChange={(e) => setFilter({ ...filter, tahun: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
              min="2020"
              max="2030"
            />
          </div>
        </div>

        {/* Jadwal List */}
        {loading && !showForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm overflow-hidden"
              >
                {/* Header Skeleton */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton width="40px" height="40px" radius="full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton width="180px" height="18px" radius="md" />
                        <Skeleton width="120px" height="14px" radius="md" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Skeleton width="30px" height="30px" radius="full" />
                      <Skeleton width="30px" height="30px" radius="full" />
                    </div>
                  </div>

                  {/* Metadata Skeleton */}
                  <div className="space-y-3 mb-4">
                    <Skeleton width="100%" height="16px" radius="md" />
                    <Skeleton width="100%" height="16px" radius="md" />
                    <Skeleton width="100%" height="16px" radius="md" />
                    <Skeleton width="100%" height="16px" radius="md" />
                  </div>

                  {/* Deskripsi Skeleton */}
                  <Skeleton width="100%" height="16px" radius="md" />
                  <Skeleton width="80%" height="16px" radius="md" className="mt-2" />

                  {/* Badges Skeleton */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Skeleton width="70px" height="24px" radius="full" />
                      <Skeleton width="60px" height="20px" radius="full" />
                    </div>
                    <Skeleton width="80px" height="28px" radius="full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {jadwalList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm">
                <Calendar className="h-16 w-16 text-[#6b7280] mx-auto mb-4 opacity-70" />
                <p className="text-[#000000] text-lg font-semibold mb-1">Belum ada jadwal acara</p>
                <p className="text-[#6b7280] text-sm">Tambahkan jadwal acara pertama Anda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {jadwalList.map((jadwal) => (
                  <div
                    key={jadwal.id}
                    className="bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white shadow-lg rounded-xl">
                            <Calendar className="h-5 w-5 text-[#f6339a]" />
                          </div>
                          <div>
                            <h3 className="font-bold text-[#000000] truncate max-w-[180px]">{jadwal.nama_acara}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(jadwal)}
                            className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-[#e5e7eb]"
                            aria-label="Edit"
                          >
                            <Edit className="w-4 h-4 text-[#6b7280]" />
                          </button>
                          <button
                            onClick={() => handleDelete(jadwal.id, jadwal.nama_acara)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                            aria-label="Hapus"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-[#6b7280]">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {jadwal.tanggal_mulai}
                            {jadwal.tanggal_selesai && jadwal.tanggal_selesai !== jadwal.tanggal_mulai &&
                              ` - ${jadwal.tanggal_selesai}`}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-[#6b7280]">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>
                            {jadwal.waktu_mulai}
                            {jadwal.waktu_selesai && ` - ${jadwal.waktu_selesai}`}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-[#6b7280]">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="truncate max-w-[180px]">
                            {jadwal.lokasi}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-[#6b7280]">
                          <User className="h-4 w-4 mr-2" />
                          <span>{jadwal.pic_nama}</span>
                        </div>
                      </div>

                      {jadwal.deskripsi && (
                        <p className="text-sm text-[#6b7280] mb-4 line-clamp-2">
                          {jadwal.deskripsi}
                        </p>
                      )}

                      {/* Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(jadwal.status)}
                          <span className={`text-xs font-medium ${getPriorityColor(jadwal.prioritas)}`}>
                            {jadwal.prioritas}
                          </span>
                        </div>

                        <select
                          value={jadwal.status}
                          onChange={(e) => handleStatusChange(jadwal.id, e.target.value)}
                          className="text-xs border border-[#e5e7eb] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#f6339a] bg-white"
                          disabled={loading}
                        >
                          <option value="aktif">Aktif</option>
                          <option value="selesai">Selesai</option>
                          <option value="dibatalkan">Dibatalkan</option>
                          <option value="ditunda">Ditunda</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal — Glassmorphism & Consistent Style */}
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl h-[90vh] overflow-y-auto">
            {/* Background glassmorphism */}
            <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#e5e7eb]"></div>
            {/* Content */}
            <div className="relative h-full overflow-y-auto rounded-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-[#e5e7eb] px-8 py-6 z-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-lg">
                      <Calendar className="h-6 w-6 text-pink-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#000000]">
                        {editingId ? 'Edit Jadwal Acara' : 'Tambah Jadwal Acara'}
                      </h2>
                      <p className="text-sm font-medium text-[#6b7280]">Isi detail jadwal acara dengan lengkap</p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-[#e5e7eb]"
                    aria-label="Tutup form"
                  >
                    <X className="h-5 w-5 text-[#000000] group-hover:text-[#6b7280]" />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Nama Acara *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama_acara}
                        onChange={(e) => setFormData({ ...formData, nama_acara: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                        placeholder="Contoh: Rapat Koordinasi Bulanan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                        placeholder="Tulis deskripsi singkat tentang acara ini..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Tanggal Mulai *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal_mulai}
                        onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal_selesai}
                        onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Waktu Mulai *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.waktu_mulai}
                        onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        value={formData.waktu_selesai}
                        onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Lokasi *
                      </label>
                      <div className="relative location-input-container">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            required
                            value={formData.lokasi}
                            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                            className="flex-1 px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                            placeholder="Masukkan alamat atau nama lokasi"
                          />
                          <button
                            type="button"
                            onClick={() => searchLocation(formData.lokasi)}
                            disabled={loading || !formData.lokasi.trim()}
                            className="px-5 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm font-medium text-[#000000] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Mencari...' : 'Cari'}
                          </button>
                        </div>

                        {/* Skeleton Dropdown Rekomendasi */}
                        {showRecommendations && recommendations.length === 0 && loading && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="px-4 py-3 border-b border-[#e5e7eb] last:border-b-0">
                                <Skeleton width="100%" height="16px" radius="md" className="mb-1" />
                                <Skeleton width="80%" height="14px" radius="md" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Dropdown Rekomendasi Asli (tetap ada) */}
                        {showRecommendations && recommendations.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {recommendations.map((rec, index) => (
                              <div
                                key={index}
                                onClick={() => selectRecommendation(rec)}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-[#e5e7eb] last:border-b-0"
                              >
                                <div className="font-medium text-[#000000]">{rec.title}</div>
                                {rec.address && (
                                  <div className="text-sm text-[#6b7280] mt-1">{rec.address}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Peta Lokasi
                      </label>
                      <div className="h-64 w-full border border-[#e5e7eb] rounded-xl overflow-hidden">
                        {loading ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Skeleton width="100%" height="100%" radius="xl" />
                          </div>
                        ) : formData.lokasi ? (
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps?q=${encodeURIComponent(formData.lokasi)}&output=embed`}
                            allowFullScreen
                            title="Lokasi Acara"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#6b7280]">
                            Masukkan lokasi dan klik "Cari" untuk melihat peta
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">
                        {formData.serp_data ?
                          "Lokasi ditemukan melalui pencarian otomatis" :
                          "Menampilkan peta berdasarkan input manual"
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        PIC Nama *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pic_nama}
                        onChange={(e) => setFormData({ ...formData, pic_nama: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                        placeholder="Nama petugas penanggung jawab"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        PIC Kontak
                      </label>
                      <input
                        type="text"
                        value={formData.pic_kontak}
                        onChange={(e) => setFormData({ ...formData, pic_kontak: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                        placeholder="Nomor HP / Email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Kategori
                      </label>
                      <select
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      >
                        <option value="umum">Umum</option>
                        <option value="rapat">Rapat</option>
                        <option value="pelatihan">Pelatihan</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Prioritas
                      </label>
                      <select
                        value={formData.prioritas}
                        onChange={(e) => setFormData({ ...formData, prioritas: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      >
                        <option value="biasa">Biasa</option>
                        <option value="penting">Penting</option>
                        <option value="sangat penting">Sangat Penting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Target Peserta
                      </label>
                      <input
                        type="number"
                        value={formData.peserta_target}
                        onChange={(e) => setFormData({ ...formData, peserta_target: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                        min="1"
                        placeholder="Jumlah peserta yang diharapkan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-sm text-[#000000]"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="selesai">Selesai</option>
                        <option value="dibatalkan">Dibatalkan</option>
                        <option value="ditunda">Ditunda</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-[#e5e7eb]">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJadwalAcara;