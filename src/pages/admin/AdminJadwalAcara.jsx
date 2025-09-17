import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, User, Clock, Filter, Search, X } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import Skeleton from '../../components/Ui/Skeleton';
import AdminBuatJadwalAcara from '../../components/Admin/AdminBuatJadwalAcara';

const AdminJadwalAcara = () => {
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // State pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10; // Tetapkan limit per halaman

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
    kategori: 'umum',
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
      params.append('page', currentPage);  // ← Kirim page
      params.append('limit', limit);      // ← Kirim limit

      const response = await api.get(`/jadwal-acara?${params}`);

      setJadwalList(response.data?.data || []);
      const pagination = response.data?.pagination || {};
      setTotalCount(pagination.total || 0);
      setTotalPages(Math.ceil((pagination.total || 0) / limit));
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

  // Fetch ulang saat filter atau currentPage berubah
  useEffect(() => {
    fetchJadwal();
  }, [filter, currentPage]); // ← tambahkan currentPage di sini

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
      fetchJadwal(); // Refresh data termasuk halaman 1
      setCurrentPage(1); // Reset ke halaman 1 setelah create/update
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
      fetchJadwal(); // Refresh data
      // Jika halaman sekarang kosong, mundur ke halaman sebelumnya
      if (jadwalList.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
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
      fetchJadwal(); // Refresh data
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
      <div className="bg-white rounded-3xl shadow-lg p-5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <Calendar className="h-6 w-6 text-teal-400" />
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
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
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
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
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
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
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
              className="w-full px-3 py-2 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
              min="2020"
              max="2030"
            />
          </div>
        </div>

        {/* Jadwal List */}
        {loading && !showForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
            {[...Array(limit)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm overflow-hidden"
              >
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

                  <div className="space-y-3 mb-4">
                    <Skeleton width="100%" height="16px" radius="md" />
                    <Skeleton width="100%" height="16px" radius="md" />
                    <Skeleton width="100%" height="16px" radius="md" />
                    <Skeleton width="100%" height="16px" radius="md" />
                  </div>

                  <Skeleton width="100%" height="16px" radius="md" />
                  <Skeleton width="80%" height="16px" radius="md" className="mt-2" />

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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
                  {jadwalList.map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white shadow-lg rounded-xl">
                              <Calendar className="h-5 w-5 text-teal-400" />
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
                            className="text-xs border border-[#e5e7eb] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-400 bg-white"
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-6 bg-white rounded-2xl border border-[#e5e7eb]">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg transition-colors font-medium text-sm"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-[#6b7280]">
                      Halaman {currentPage} dari {totalPages} ({totalCount} total)
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 rounded-lg transition-colors font-medium text-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      <AdminBuatJadwalAcara
        showForm={showForm}
        editingId={editingId}
        resetForm={resetForm}
        handleSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        searchLocation={searchLocation}
        showRecommendations={showRecommendations}
        recommendations={recommendations}
        selectRecommendation={selectRecommendation}
        loading={loading}
      />
    </div>
  );
};

export default AdminJadwalAcara;