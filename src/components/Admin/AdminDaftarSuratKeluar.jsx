import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Trash2, Paperclip, Calendar, Clock, FileText, User, MessageSquare, AlertCircle, AlertTriangle, Building2, X, Search } from 'lucide-react'; // ✅ Hapus Filter ikon karena tidak dipakai
import toast from 'react-hot-toast';
import LoadingSpinner from '../Ui/LoadingSpinner';
import isImageFile from '../../utils/isImageFile';
import ImageModal from '../Ui/ImageModal';

const AdminDaftarSuratKeluar = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // ✅ State untuk modal hapus
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, suratId: null, suratInfo: null });

  // ✅ State hanya untuk pencarian — HAPUS statusFilter
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  const fetchSuratKeluar = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/surat-keluar');
      const data = response.data.data || [];
      setSuratList(data);
      setFilteredData(data);
    } catch (err) {
      const errorMessage = 'Gagal memuat daftar surat keluar';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Effect hanya untuk search — HAPUS logika filter status
  useEffect(() => {
    let filtered = suratList;

    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(surat =>
        surat.nama_surat?.toLowerCase().includes(searchLower) ||
        surat.ditujukan_ke?.toLowerCase().includes(searchLower) ||
        surat.keterangan?.toLowerCase().includes(searchLower) ||
        surat.catatan_internal?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(filtered);
  }, [suratList, searchTerm]); // ✅ Hapus statusFilter dari dependency

  const openDeleteModal = (surat) => {
    setDeleteModal({
      isOpen: true,
      suratId: surat.id,
      suratInfo: {
        nama_surat: surat.nama_surat,
        ditujukan_ke: surat.ditujukan_ke,
        created_at: surat.created_at
      }
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, suratId: null, suratInfo: null });
  };

  const handleConfirmDelete = async (id) => {
    try {
      await api.delete(`/surat-keluar/${id}`);
      toast.success('Surat berhasil dihapus');
      closeDeleteModal();
      fetchSuratKeluar();
    } catch (err) {
      const errorMessage = 'Gagal menghapus surat keluar';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuratKeluar();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // ❌ HAPUS getStatusBadge — karena tidak ada status

  // ✅ Fungsi reset — hanya reset search
  const clearFilters = () => {
    setSearchTerm('');
    // ❌ Hapus setStatusFilter karena tidak ada
  };

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
              onClick={fetchSuratKeluar}
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

        {/* ✅ Search Section — HAPUS bagian filter status */}
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, tujuan, keterangan..."
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

            {/* ❌ HAPUS Filter Status Dropdown */}

            {/* Clear Filters Button — hanya muncul jika ada search */}
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          {/* Results Info — HAPUS penyebutan status */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>
              Menampilkan {filteredData.length} dari {suratList.length} surat
              {searchTerm && (
                <span className="ml-1">
                  untuk pencarian "{searchTerm}"
                </span>
              )}
              {/* ❌ HAPUS bagian status */}
            </span>
          </div>
        </div>

        {/* ✅ Empty State — jika tidak ada hasil setelah search */}
        {filteredData.length === 0 && suratList.length > 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak Ada Hasil yang Cocok</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Coba ubah kata kunci pencarian.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset pencarian
            </button>
          </div>
        )}

        {suratList.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak Ada Surat Keluar</h3>
            <p className="text-gray-500">Belum ada surat keluar yang tersedia.</p>
          </div>
        )}

        {filteredData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredData.map((surat) => (
              <article
                key={surat.id}
                className="group relative bg-white space-y-3 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-slate-200"
              >
                {/* Header — ❌ HAPUS badge status */}
                <div className="border-b border-gray-50/50 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {surat.nama_surat}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <span className="font-medium text-gray-700">Tujuan:</span> {surat.ditujukan_ke?.replace(/-/g, ' ') || '-'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      {/* ❌ HAPUS getStatusBadge(surat.status) */}
                      <span className="text-xs text-gray-500 mt-1">{formatDate(surat.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mt-0.5">
                        <Calendar className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Tanggal Surat</p>
                        <p className="text-gray-800">{formatDate(surat.tanggal_surat)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-0.5">
                        <Clock className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Dibuat</p>
                        <p className="text-gray-800">{formatDate(surat.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {surat.keterangan && (
                  <div className="border-t border-gray-50/50 pt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Keterangan:
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {surat.keterangan}
                    </p>
                  </div>
                )}

                {surat.catatan_internal && (
                  <div className="border-t border-gray-50/50 pt-3">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Catatan Internal:
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-sm italic bg-gray-50 p-3 rounded-lg">
                      {surat.catatan_internal}
                    </p>
                  </div>
                )}

                {surat.file_count > 0 && (
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Paperclip className="w-5 h-5" />
                      Lampiran: ({surat.file_count})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {surat.files.map((file) => {
                        const isImage = isImageFile(file);
                        return (
                          <div
                            key={file.id}
                            onClick={() => {
                              if (isImage) {
                                setSelectedImage(file.url);
                              } else {
                                window.open(file.url, '_blank', 'noopener,noreferrer');
                              }
                            }}
                            className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                          >
                            {isImage ? (
                              <img
                                src={file.url}
                                alt={file.filename}
                                className="w-20 h-20 object-cover group-hover:brightness-110 transition-transform duration-500 rounded-lg shadow-lg"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="text-[#D9534F] flex flex-col items-center justify-center w-20 h-20 bg-gray-100 rounded-lg">
                                <FileText className="w-8 h-8" />
                                <p className="text-xs font-bold mt-1 text-center break-words">
                                  {file.filename.split('.').pop()?.toUpperCase() || 'FILE'}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-3 border-t border-gray-50/50">
                  <button
                    onClick={() => openDeleteModal(surat)}
                    className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-white border border-red-400 hover:-translate-y-0.5 text-red-400 rounded-full text-sm font-medium shadow transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ✅ MODAL HAPUS — tetap dipertahankan */}
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
                  Apakah Anda yakin ingin menghapus surat:
                </p>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">
                        {deleteModal.suratInfo?.nama_surat}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900 capitalize">
                        {deleteModal.suratInfo?.ditujukan_ke?.replace(/-/g, ' ')}
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

      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

export default AdminDaftarSuratKeluar;