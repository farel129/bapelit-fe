import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, User, Clock, Filter } from 'lucide-react';
import { api } from '../../utils/api';

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

      const response = await api.get(`/admin/jadwal-acara?${params}`);
      
      setJadwalList(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        alert(errorMessage);
      } else if (error.request) {
        alert('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        alert('Terjadi kesalahan saat mengambil data');
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

  // Fungsi untuk mencari rekomendasi lokasi
  const searchRecommendations = async (query) => {
    if (!query.trim() || query.length < 3) {
      setRecommendations([]);
      setShowRecommendations(false);
      return;
    }

    try {
      // Gunakan endpoint backend kita
      const response = await api.get(`/lokasi-rekomendasi?q=${encodeURIComponent(query)}`);
      
      if (response.data.local_results && response.data.local_results.length > 0) {
        setRecommendations(response.data.local_results);
        setShowRecommendations(true);
      } else {
        setRecommendations([]);
        setShowRecommendations(false);
      }
    } catch (error) {
      console.error('Error searching recommendations:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
      setRecommendations([]);
      setShowRecommendations(false);
    }
  };

  // Fungsi untuk memilih rekomendasi
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

  // Fungsi untuk mencari lokasi berdasarkan input
  const searchLocation = async (query) => {
    if (!query.trim()) {
      alert('Masukkan nama lokasi atau alamat');
      return;
    }

    setLoading(true);
    
    try {
      // Gunakan endpoint backend kita
      const response = await api.get(`/lokasi-rekomendasi?q=${encodeURIComponent(query)}`);
      
      if (response.data.local_results && response.data.local_results.length > 0) {
        // Ambil hasil pertama
        const firstResult = response.data.local_results[0];
        
        // Format lokasi untuk ditampilkan
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
        
        alert(`Lokasi ditemukan: ${locationString}`);
      } else {
        // Jika tidak ditemukan, fallback ke input manual
        setFormData(prev => ({
          ...prev,
          lokasi: query.trim()
        }));
        alert('Lokasi tidak ditemukan di database, menampilkan berdasarkan input Anda');
      }
    } catch (error) {
      console.error('Error searching with location service:', error);
      if (error.response) {
        console.error('Response error:', error.response.data);
      }
      // Fallback jika error
      setFormData(prev => ({
        ...prev,
        lokasi: query.trim()
      }));
      alert('Gagal mencari lokasi, menampilkan berdasarkan input Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/admin/jadwal-acara/${editingId}/update`, formData);
        alert('Jadwal acara berhasil diupdate!');
      } else {
        await api.post('/admin/jadwal-acara/buat', formData);
        alert('Jadwal acara berhasil dibuat!');
      }
      
      resetForm();
      fetchJadwal();
    } catch (error) {
      console.error('Error saving data:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        alert(errorMessage);
      } else if (error.request) {
        alert('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        alert('Terjadi kesalahan saat menyimpan data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Reset form
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
    
    // Clear rekomendasi saat edit
    setRecommendations([]);
    setShowRecommendations(false);
  };

  const handleDelete = async (id, nama) => {
    if (!confirm(`Hapus jadwal acara "${nama}"?`)) return;
    
    setLoading(true);
    try {
      await api.delete(`/admin/jadwal-acara/${id}/delete`);
      alert('Jadwal acara berhasil dihapus!');
      fetchJadwal();
    } catch (error) {
      console.error('Error deleting data:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        alert(errorMessage);
      } else if (error.request) {
        alert('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        alert('Terjadi kesalahan saat menghapus data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setLoading(true);
    try {
      await api.patch(`/admin/jadwal-acara/${id}/status`, { status: newStatus });
      alert(`Status berhasil diubah ke ${newStatus}!`);
      fetchJadwal();
    } catch (error) {
      console.error('Error updating status:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
        alert(errorMessage);
      } else if (error.request) {
        alert('Tidak ada respon dari server. Pastikan server backend berjalan.');
      } else {
        alert('Terjadi kesalahan saat mengubah status');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif': return 'bg-green-100 text-green-800 border-green-300';
      case 'selesai': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'dibatalkan': return 'bg-red-100 text-red-800 border-red-300';
      case 'ditunda': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'sangat penting': return 'text-red-600';
      case 'penting': return 'text-orange-600';
      case 'biasa': return 'text-gray-600';
      default: return 'text-gray-600';
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
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Acara</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Tambah Jadwal
          </button>
        </div>

        {/* Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
              <option value="ditunda">Ditunda</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select
              value={filter.kategori}
              onChange={(e) => setFilter({...filter, kategori: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="rapat">Rapat</option>
              <option value="pelatihan">Pelatihan</option>
              <option value="seminar">Seminar</option>
              <option value="umum">Umum</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
            <select
              value={filter.bulan}
              onChange={(e) => setFilter({...filter, bulan: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input
              type="number"
              value={filter.tahun}
              onChange={(e) => setFilter({...filter, tahun: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="2020"
              max="2030"
            />
          </div>
        </div>

        {/* Jadwal List */}
        {loading && !showForm ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat jadwal acara...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jadwalList.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>Belum ada jadwal acara</p>
              </div>
            ) : (
              jadwalList.map((jadwal) => (
                <div key={jadwal.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">{jadwal.nama_acara}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(jadwal)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(jadwal.id, jadwal.nama_acara)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>
                        {jadwal.tanggal_mulai}
                        {jadwal.tanggal_selesai && jadwal.tanggal_selesai !== jadwal.tanggal_mulai && 
                          ` - ${jadwal.tanggal_selesai}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>
                        {jadwal.waktu_mulai}
                        {jadwal.waktu_selesai && ` - ${jadwal.waktu_selesai}`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      <span>
                        {jadwal.lokasi}
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(jadwal.lokasi)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:underline text-xs"
                        >
                          (Lihat di Maps)
                        </a>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>{jadwal.pic_nama}</span>
                    </div>
                  </div>

                  {jadwal.deskripsi && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{jadwal.deskripsi}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(jadwal.status)}`}>
                        {jadwal.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(jadwal.prioritas)}`}>
                        {jadwal.prioritas}
                      </span>
                    </div>
                    
                    <select
                      value={jadwal.status}
                      onChange={(e) => handleStatusChange(jadwal.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={loading}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                      <option value="ditunda">Ditunda</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Jadwal Acara' : 'Tambah Jadwal Acara'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Acara *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_acara}
                      onChange={(e) => setFormData({...formData, nama_acara: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_mulai}
                      onChange={(e) => setFormData({...formData, tanggal_mulai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Selesai
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal_selesai}
                      onChange={(e) => setFormData({...formData, tanggal_selesai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Mulai *
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.waktu_mulai}
                      onChange={(e) => setFormData({...formData, waktu_mulai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waktu Selesai
                    </label>
                    <input
                      type="time"
                      value={formData.waktu_selesai}
                      onChange={(e) => setFormData({...formData, waktu_selesai: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi *
                    </label>
                    <div className="relative location-input-container">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={formData.lokasi}
                          onChange={(e) => {
                            setFormData({...formData, lokasi: e.target.value});
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Masukkan alamat atau nama lokasi"
                        />
                        <button
                          type="button"
                          onClick={() => searchLocation(formData.lokasi)}
                          disabled={loading}
                          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm disabled:opacity-50"
                        >
                          {loading ? 'Mencari...' : 'Cari'}
                        </button>
                      </div>

                      {/* Dropdown Rekomendasi */}
                      {showRecommendations && recommendations.length > 0 && (
                        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {recommendations.map((rec, index) => (
                            <div
                              key={index}
                              onClick={() => selectRecommendation(rec)}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{rec.title}</div>
                              {rec.address && (
                                <div className="text-sm text-gray-600 mt-1">{rec.address}</div>
                              )}
                              {rec.rating && (
                                <div className="text-xs text-gray-500 mt-1">
                                  ⭐ {rec.rating} ({rec.reviews || 0} reviews)
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Picker - Google Maps Embed dengan hasil */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peta Lokasi
                    </label>
                    <div className="h-64 w-full border border-gray-300 rounded-md overflow-hidden">
                      {formData.lokasi ? (
                        <iframe
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          style={{ border: 0 }}
                          src={`https://www.google.com/maps?q=${encodeURIComponent(formData.lokasi)}&output=embed`}
                          allowFullScreen
                          title="Lokasi Acara"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                          Masukkan lokasi dan klik "Cari" untuk melihat peta
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.serp_data ? 
                        "Lokasi ditemukan melalui pencarian" : 
                        "Menampilkan peta berdasarkan input manual"
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIC Nama *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.pic_nama}
                      onChange={(e) => setFormData({...formData, pic_nama: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIC Kontak
                    </label>
                    <input
                      type="text"
                      value={formData.pic_kontak}
                      onChange={(e) => setFormData({...formData, pic_kontak: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({...formData, kategori: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="umum">Umum</option>
                      <option value="rapat">Rapat</option>
                      <option value="pelatihan">Pelatihan</option>
                      <option value="seminar">Seminar</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioritas
                    </label>
                    <select
                      value={formData.prioritas}
                      onChange={(e) => setFormData({...formData, prioritas: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="biasa">Biasa</option>
                      <option value="penting">Penting</option>
                      <option value="sangat penting">Sangat Penting</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Peserta
                    </label>
                    <input
                      type="number"
                      value={formData.peserta_target}
                      onChange={(e) => setFormData({...formData, peserta_target: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="selesai">Selesai</option>
                      <option value="dibatalkan">Dibatalkan</option>
                      <option value="ditunda">Ditunda</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : editingId ? 'Update' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJadwalAcara;