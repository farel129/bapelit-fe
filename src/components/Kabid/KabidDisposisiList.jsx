import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Eye,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  Image,
  Loader
} from 'lucide-react';
import { api } from '../../utils/api';

const KabidDisposisiList = () => {
  const navigate = useNavigate();
  const [disposisi, setDisposisi] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch disposisi data
  const fetchDisposisi = async () => {
    try {
      setLoading(true);
      console.log('Fetching disposisi...');

      const response = await api.get('/kabid/disposisi/saya');
      const result = response.data;

      console.log('Data dari backend:', result);

      // Cek struktur data
      if (result && Array.isArray(result.data)) {
        setDisposisi(result.data);
      } else if (result && Array.isArray(result)) {
        // Jika backend kirim langsung array
        setDisposisi(result);
      } else {
        console.warn('Struktur data tidak dikenali:', result);
        setDisposisi([]);
      }
    } catch (error) {
      console.error('Error fetching disposisi:', error);

      // Tangani error dengan benar
      if (error.response) {
        // Server merespons dengan status error (401, 404, 500, dll)
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message || 'Error tidak diketahui';
        alert(`Gagal (${status}): ${message}`);
      } else if (error.request) {
        // Tidak ada respons (network error)
        alert('Tidak dapat terhubung ke server. Periksa koneksi internet.');
      } else {
        // Error lain
        alert('Terjadi kesalahan: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Navigate to detail page and mark as read
  const viewDetail = async (item) => {
    if (item.status === 'belum dibaca') {
      try {
        await api.put(`/kabid/disposisi/${item.id}/baca`, {});

        fetchDisposisi();

        navigate(`/kabid/disposisi/detail/${item.id}`, {
          state: { disposisi: { ...item, status: 'dibaca' } }
        });
      } catch (error) {
        console.error('Error marking as read:', error);
        navigate(`/kabid/disposisi/detail/${item.id}`, {
          state: { disposisi: item }
        });
      }
    } else {
      navigate(`/kabid/disposisi/detail/${item.id}`, {
        state: { disposisi: item }
      });
    }
  };

  // Handle feedback success
  const handleFeedbackSuccess = () => {
    fetchDisposisi(); // Refresh data
  };

  // Get status badge - Updated to handle all status
  const getStatusBadge = (status) => {
    const statusConfig = {
      'belum dibaca': {
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
        text: 'Belum Dibaca'
      },
      'dibaca': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
        text: 'Sudah Dibaca'
      },
      'diteruskan': {
        color: 'bg-purple-100 text-purple-800',
        icon: Clock,
        text: 'Diteruskan kebawahan'
      },
      'diterima': {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        text: 'Diterima oleh Kabid'
      },
      'diproses': {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        text: 'Dalam Proses'
      },
      'selesai': {
        color: 'bg-emerald-100 text-emerald-800',
        icon: CheckCircle,
        text: 'Selesai'
      }
    };

    const config = statusConfig[status] || statusConfig['belum dibaca'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    fetchDisposisi();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Memuat data disposisi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Daftar Disposisi</h1>
              <p className="text-gray-600 mt-1">Kelola disposisi yang ditujukan untuk Anda</p>
            </div>
            <button
              onClick={fetchDisposisi}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Disposisi List */}
        <div className="space-y-4">
          {disposisi.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada disposisi</h3>
              <p className="text-gray-600">
                Belum ada disposisi yang ditujukan untuk Anda
              </p>
            </div>
          ) : (
            disposisi.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.perihal}</h3>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          <span>Dari: {item.asal_instansi}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>No. Surat: {item.nomor_surat}</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          <span>No. agenda: {item.nomor_agenda}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Tgl Surat: {item.tanggal_surat}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Diterima Tanggal: {item.diterima_tanggal}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sifat dan Info Tambahan */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Sifat:</span>
                        <p className="text-sm text-gray-600 mt-1">{item.sifat}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Dengan Hormat Harap:</span>
                        <p className="text-sm text-gray-600 mt-1">{item.dengan_hormat_harap}</p>
                      </div>
                    </div>
                  </div>

                  {/* Photo Info */}
                  {item.surat_masuk?.has_photos && (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                      <Image className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        {item.surat_masuk.photo_count} lampiran foto/dokumen tersedia
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <button
                      onClick={() => viewDetail(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default KabidDisposisiList;