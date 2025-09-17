import { FileText, X, CheckCircle, Download, Calendar, User, Building2, MessageSquare, Trash2, AlertTriangle, Search, Filter, Loader, Mail, RefreshCcw, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useState, useEffect } from 'react';
import LoadingSpinner from '../Ui/LoadingSpinner';
import StatCard from '../Ui/StatCard';
import isImageFile from '../../utils/isImageFile';
import ImageModal from '../Ui/ImageModal';

const AdminDaftarSuratMasuk = () => {
  const [suratData, setSuratData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, suratId: null, suratInfo: null });
  const [selectedImage, setSelectedImage] = useState(null);

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch data dari API
  useEffect(() => {
    fetchAllData();
  }, []);

  // Effect untuk filtering dan searching
  useEffect(() => {
    let filtered = suratData;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(surat => surat.status === statusFilter);
    }
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(surat =>
        surat.asal_instansi?.toLowerCase().includes(searchLower) ||
        surat.tujuan_jabatan?.toLowerCase().includes(searchLower) ||
        surat.nomor_surat?.toLowerCase().includes(searchLower) ||
        surat.keterangan?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredData(filtered);
  }, [suratData, searchTerm, statusFilter]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      const suratResponse = await api.get('/surat-masuk');
      const disposisiResponse = await api.get('/disposisi/kepala');

      const disposisiMapping = {};
      disposisiResponse.data?.data?.forEach(disposisi => {
        if (disposisi.surat_masuk?.id) {
          disposisiMapping[disposisi.surat_masuk.id] = disposisi.id;
        }
      });

      const suratWithDisposisiId = suratResponse.data?.data?.map(surat => ({
        ...surat,
        disposisi_id: disposisiMapping[surat.id] || null
      })) || [];

      setSuratData(suratWithDisposisiId);
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.response) {
        const errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err.request) {
        setError('Tidak ada respon dari server. Pastikan server backend berjalan.');
        toast.error('Tidak ada respon dari server');
      } else {
        setError('Terjadi kesalahan saat mengambil data');
        toast.error('Terjadi kesalahan saat mengambil data');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // ✅ STATUS BADGE — DISAMAKAN DENGAN GAYA SURAT MASUK
  const getStatusBadge = (status) => {
    const statusConfig = {
      'belum dibaca': {
        color: 'bg-green-100 text-green-800',
        text: 'Belum Dibaca'
      },
      'sudah dibaca': {
        color: 'bg-gray-100 text-gray-800',
        text: 'Sudah Dibaca'
      }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const handleDownloadPDF = async (suratId, nomorSurat) => {
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      const surat = suratData.find(s => s.id === suratId);
      const disposisiId = surat?.disposisi_id;

      if (!disposisiId) {
        toast.error('Disposisi tidak ditemukan untuk surat ini');
        return;
      }

      const response = await api.get(`/disposisi/download-pdf/${disposisiId}`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const total = progressEvent.total;
          const current = progressEvent.loaded;
          if (total) {
            const percentage = Math.round((current / total) * 100);
            setDownloadProgress(percentage);
          }
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `disposisi-${nomorSurat || suratId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF berhasil diunduh!');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      if (err.response) {
        const errorMessage = err.response.data?.error || 'Gagal mengunduh PDF';
        toast.error(errorMessage);
      } else if (err.request) {
        toast.error('Tidak ada respon dari server saat mengunduh PDF');
      } else {
        toast.error('Terjadi kesalahan saat mengunduh PDF');
      }
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const openDeleteModal = (surat) => {
    setDeleteModal({
      isOpen: true,
      suratId: surat.id,
      suratInfo: {
        asal_instansi: surat.asal_instansi,
        tujuan_jabatan: surat.tujuan_jabatan,
        created_at: surat.created_at
      }
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, suratId: null, suratInfo: null });
  };

  const handleConfirmDelete = async (id) => {
    try {
      await api.delete(`/surat-masuk/${id}`);
      toast.success('Surat berhasil dihapus');
      closeDeleteModal();
      fetchAllData();
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Gagal menghapus surat';
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error('Tidak ada respon dari server');
      } else {
        toast.error('Terjadi kesalahan saat menghapus surat');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  // Calculate statistics
  const totalSurat = suratData.length;
  const belumDibaca = suratData.filter(surat => surat.status === 'belum dibaca').length;
  const sudahDibaca = suratData.filter(surat => surat.status === 'sudah dibaca').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAllData}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-full font-medium transition shadow"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="">

        {/* ✅ Stat Cards — DISAMAKAN DENGAN GAYA SURAT MASUK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <StatCard
            title="Total Surat"
            count={totalSurat}
            icon={Mail}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-white"
            iconColor="text-teal-400"
            borderColor="border-slate-200"
          />
          <StatCard
            title="Belum Dibaca"
            count={belumDibaca}
            icon={Clock}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-gray-500"
            iconColor="text-white"
            borderColor="border-slate-200"
          />
          <StatCard
            title="Sudah Dibaca"
            count={sudahDibaca}
            icon={CheckCircle}
            bgColor="bg-black"
            textColor="text-white"
            iconBg="bg-white"
            iconColor="text-black"
            borderColor="border-slate-200"
          />
        </div>

        {/* ✅ Search and Filter Section — DISAMAKAN DENGAN GAYA SURAT MASUK */}
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan instansi, tujuan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-full transition-all"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="all">Semua Status</option>
                <option value="belum dibaca">Belum Dibaca</option>
                <option value="sudah dibaca">Sudah Dibaca</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>
              Menampilkan {filteredData.length} dari {suratData.length} surat
              {searchTerm && (
                <span className="ml-1">
                  untuk pencarian "{searchTerm}"
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="ml-1">
                  dengan status {statusFilter === 'belum dibaca' ? 'Belum Dibaca' : 'Sudah Dibaca'}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ✅ Card Surat — SEMUA INFO LANGSUNG DITAMPILKAN, TANPA MODAL */}
        {filteredData.length === 0 && suratData.length > 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak Ada Hasil yang Cocok</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset semua filter
            </button>
          </div>
        ) : suratData.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak Ada Surat Masuk</h3>
            <p className="text-gray-500">Belum ada surat masuk yang tersedia.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredData.map((surat) => {
              return (
                <article
                  key={surat.id}
                  className="group relative bg-white space-y-3 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-slate-200"
                >
                  {/* Header */}
                  <div className="border-b border-gray-50/50 pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {surat.asal_instansi}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          <span className="font-medium text-gray-700">Tujuan:</span> {surat.tujuan_jabatan?.replace(/-/g, ' ') || '-'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {getStatusBadge(surat.status)}
                        <span className="text-xs text-gray-500 mt-1">{formatDate(surat.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mt-0.5">
                          <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tanggal Dibuat</p>
                          <p className="text-gray-800">{formatDate(surat.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-0.5">
                          <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tujuan Jabatan</p>
                          <p className="text-gray-800 capitalize">{surat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keterangan */}
                  <div className="border-t border-gray-50/50 pt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Keterangan:
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {surat.keterangan ? (
                        surat.keterangan
                      ) : (
                        <span className="text-gray-400 italic">Tidak ada keterangan tambahan.</span>
                      )}
                    </p>
                  </div>

                  {surat.photos && surat.photos.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Lampiran: ({surat.photos.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {surat.photos.map((photo) => {
                          const isImage = isImageFile(photo);
                          return (
                            <div
                              key={photo.id}
                              onClick={() => {
                                if (isImage) {
                                  setSelectedImage(photo.url);
                                } else {
                                  window.open(photo.url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                            >
                              {isImage ? (
                                <img
                                  src={photo.url}
                                  alt={photo.filename}
                                  className="w-20 h-20 object-cover group-hover:brightness-110 transition-transform duration-500 rounded-lg shadow-lg"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="text-[#D9534F] flex flex-col items-center justify-center w-20 h-20 bg-gray-100 rounded-lg">
                                  <FileText className="w-8 h-8" />
                                  <p className="text-xs font-bold mt-1 text-center break-words">
                                    {photo.filename.split('.').pop()?.toUpperCase() || 'FILE'}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tombol Aksi — HANYA DOWNLOAD & HAPUS */}
                  <div className="space-y-3 pt-3 border-t border-gray-50/50">
                    {surat.has_disposisi === true && surat.disposisi_id && (
                      <button
                        onClick={() => handleDownloadPDF(surat.id, surat.nomor_surat)}
                        disabled={isDownloading}
                        className={`inline-flex w-full justify-center items-center gap-2 px-4 py-3 rounded-full text-sm font-medium shadow transition-all duration-200 ${isDownloading
                          ? 'bg-white border border-green-400 text-green-400 cursor-not-allowed opacity-75'
                          : 'bg-white border border-green-400 hover:-translate-y-0.5 text-green-400'
                          }`}
                      >
                        {isDownloading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            {downloadProgress}%
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            Download PDF
                          </>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => openDeleteModal(surat)}
                      className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-white border border-red-400 hover:-translate-y-0.5 text-red-400 rounded-full text-sm font-medium shadow transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Hapus
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ✅ Delete Confirmation Modal — TETAP ADA, HANYA UNTUK HAPUS */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Konfirmasi Hapus</h3>
                      <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                    </div>
                  </div>
                  <button
                    onClick={closeDeleteModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition"
                  >
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-gray-800 font-medium mb-3">
                    Apakah Anda yakin ingin menghapus surat dari:
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-900">
                          {deleteModal.suratInfo?.asal_instansi}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900 capitalize">
                          {deleteModal.suratInfo?.tujuan_jabatan?.replace(/-/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-900">
                          {formatDate(deleteModal.suratInfo?.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => handleConfirmDelete(deleteModal.suratId)}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

export default AdminDaftarSuratMasuk;