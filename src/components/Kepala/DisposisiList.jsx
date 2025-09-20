import React, { useState, useEffect } from 'react';
import { Search, Eye, FileText, Calendar, Building, User, AlertCircle, Loader2, Filter, RotateCcw, Trash2, X, RefreshCcw, CheckCircle, Clock, Archive, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Ui/LoadingSpinner';
import StatCard from '../Ui/StatCard';

const DisposisiList = () => {
  const [disposisi, setDisposisi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSifat, setSelectedSifat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDisposisi, setSelectedDisposisi] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch data disposisi
  const fetchDisposisi = async () => {
    try {
      setLoading(true);
      const response = await api.get('/disposisi/kepala');
      setDisposisi(response.data.data || []);
    } catch (err) {
      console.error('Error fetching disposisi:', err);
      toast.error(err.response?.data?.error || 'Gagal memuat data disposisi');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete disposisi
  const handleDelete = async (id) => {
    try {
      setDeleteLoading(id);
      const response = await api.delete(`/disposisi/kepala/${id}`);

      setDisposisi(prevDisposisi => prevDisposisi.filter(item => item.id !== id));
      toast.success(response.data.message || 'Disposisi berhasil dihapus');
      setShowDeleteModal(false);
      setSelectedDisposisi(null);
    } catch (err) {
      console.error('Error deleting disposisi:', err);
      toast.error(err.response?.data?.error || 'Gagal menghapus disposisi');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (disposisiItem) => {
    setSelectedDisposisi(disposisiItem);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedDisposisi(null);
  };

  // Load data saat komponen mount
  useEffect(() => {
    fetchDisposisi();
  }, []);

  // Filter data berdasarkan search dan filter
  const filteredDisposisi = disposisi.filter(item => {
    const matchSearch = searchTerm === '' ||
      item.perihal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.asal_instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.disposisi_kepada_jabatan?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchSifat = selectedSifat === '' || item.sifat === selectedSifat;
    const matchStatus = selectedStatus === '' || item.status === selectedStatus;

    return matchSearch && matchSifat && matchStatus;
  });

  // Pagination calculations
  const totalItems = filteredDisposisi.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredDisposisi.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSifat, selectedStatus]);

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const changeItemsPerPage = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Calculate statistics
  const totalDisposisi = disposisi.length;
  const belumDibaca = disposisi.filter(item => item.status === 'belum dibaca').length;
  const diproses = disposisi.filter(item => item.status === 'dalam proses' || item.status === 'diproses').length;
  const selesai = disposisi.filter(item => item.status === 'selesai').length;

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSifat('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // === STATUS BADGE (DISAMAKAN DENGAN GAYA SURAT MASUK) ===
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'belum dibaca': return 'bg-green-100 text-green-800';
        case 'dibaca': return 'bg-blue-100 text-blue-800';
        case 'dalam proses':
        case 'diproses': return 'bg-yellow-100 text-yellow-800';
        case 'selesai': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  // === SIFAT BADGE (DIUBAH SESUAI PALET STANDAR SURAT MASUK) ===
  const SifatBadge = ({ sifat }) => {
    const getSifatColor = (sifat) => {
      switch (sifat) {
        case 'Sangat Segera': return 'bg-red-100 text-red-800';
        case 'Segera': return 'bg-orange-100 text-orange-800';
        case 'Biasa': return 'bg-blue-100 text-blue-800';
        case 'Rahasia': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSifatColor(sifat)}`}>
        {sifat}
      </span>
    );
  };

  // === PAGINATION COMPONENT (GAYA MINIMALIS & SESUAI SURAT MASUK) ===
  const Pagination = () => {
    if (totalItems === 0) return null;

    const getVisiblePages = () => {
      const visiblePages = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          visiblePages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            visiblePages.push(i);
          }
          visiblePages.push('...');
          visiblePages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          visiblePages.push(1);
          visiblePages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            visiblePages.push(i);
          }
        } else {
          visiblePages.push(1);
          visiblePages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            visiblePages.push(i);
          }
          visiblePages.push('...');
          visiblePages.push(totalPages);
        }
      }

      return visiblePages;
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mt-6">
        <div className="text-sm text-gray-700">
          Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
        </div>

        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => changeItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          >
            <option value={5}>5/hal</option>
            <option value={10}>10/hal</option>
            <option value={25}>25/hal</option>
            <option value={50}>50/hal</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {getVisiblePages().map((page, index) =>
              page === '...' ? (
                <span key={index} className="px-3 py-1">...</span>
              ) : (
                <button
                  key={index}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    currentPage === page
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // === DELETE MODAL (GAYA CARD & BUTTON SESUAI SURAT MASUK) ===
  const DeleteModal = () => {
    if (!showDeleteModal || !selectedDisposisi) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5 text-red-600" />
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

            <div className="mb-2">
              <p className="text-gray-800 font-medium mb-2">
                Apakah Anda yakin ingin menghapus disposisi ini?
              </p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="font-semibold text-gray-900">{selectedDisposisi.perihal}</p>
                <p className="text-sm text-gray-600 mt-1">Nomor: {selectedDisposisi.nomor_surat}</p>
                <p className="text-sm text-gray-600">Dari: {selectedDisposisi.asal_instansi}</p>
              </div>
              <p className="text-red-600 text-xs mt-3">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Status surat akan diubah menjadi belum didisposisi.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition"
                disabled={deleteLoading === selectedDisposisi.id}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(selectedDisposisi.id)}
                disabled={deleteLoading === selectedDisposisi.id}
                className={`px-4 py-2.5 rounded-full font-medium text-white transition flex items-center gap-2 ${
                  deleteLoading === selectedDisposisi.id
                    ? 'bg-red-400 cursor-not-allowed opacity-75'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {deleteLoading === selectedDisposisi.id ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="">

        {/* Header Refresh */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={fetchDisposisi}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 text-sm font-medium shadow-sm transition"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stat Cards — Disesuaikan Gaya SuratMasukList */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
          <StatCard
            title="Total Disposisi"
            count={totalDisposisi}
            icon={Archive}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-teal-400"
            borderColor="border-slate-200"
            iconColor="text-white"
          />
          <StatCard
            title="Belum Dibaca"
            count={belumDibaca}
            icon={Clock}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-green-100"
            borderColor="border-slate-200"
            iconColor="text-green-800"
          />
          <StatCard
            title="Diproses"
            count={diproses}
            icon={FileText}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-yellow-100"
            borderColor="border-slate-200"
            iconColor="text-yellow-800"
          />
          <StatCard
            title="Selesai"
            count={selesai}
            icon={CheckCircle}
            bgColor="bg-black"
            textColor="text-white"
            iconBg="bg-white"
            borderColor="border-slate-200"
            iconColor="text-teal-400"
          />
        </div>

        {/* Filters — Disesuaikan Gaya SuratMasukList */}
        <div className="mb-2">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan perihal, nomor surat, instansi, atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Filter Sifat */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedSifat}
                onChange={(e) => setSelectedSifat(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="">Semua Sifat</option>
                <option value="Sangat Segera">Sangat Segera</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
                <option value="Biasa">Biasa</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="">Semua Status</option>
                <option value="belum dibaca">Belum Dibaca</option>
                <option value="dibaca">Dibaca</option>
                <option value="diproses">Dalam Proses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>

          </div>
        </div>

        {/* Disposisi List — CARD LAYOUT (SEPERTI SURAT MASUK) */}
        {currentItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-2">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {disposisi.length === 0 ? 'Belum ada disposisi' : 'Tidak ada disposisi yang cocok'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {disposisi.length === 0
                ? 'Belum ada disposisi yang dibuat. Silakan buat disposisi baru.'
                : 'Coba ubah kata kunci pencarian atau filter status.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            {currentItems.map((item) => (
              <article
                key={item.id}
                className="group relative bg-white space-y-2 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-slate-200"
              >
                {/* Header */}
                <div className="border-b border-gray-50/50 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.perihal || 'Tanpa Perihal'}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <span className="font-medium text-gray-700">Nomor Surat:</span> {item.nomor_surat || '-'} •{' '}
                        <span className="font-medium text-gray-700">Dari:</span> {item.asal_instansi || '-'}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-800 rounded-full text-sm font-medium shadow-sm">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                        <User className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Disposisi Kepada</p>
                        <p className="text-gray-800">{item.disposisi_kepada_jabatan || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                        <AlertCircle className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Sifat</p>
                        <SifatBadge sifat={item.sifat || 'Biasa'} />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-gray-500 font-medium">Status</p>
                        <StatusBadge status={item.status || 'belum dibaca'} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="space-y-2 pt-3 border-t border-gray-50/50">
                  <button
                    onClick={() => window.location.href = `/kepala/disposisi/${item.id}`}
                    className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-sm font-medium shadow transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Detail
                  </button>

                  <button
                    onClick={() => openDeleteModal(item)}
                    disabled={deleteLoading === item.id}
                    className={`inline-flex w-full justify-center items-center gap-2 px-4 py-3 rounded-full text-sm font-medium shadow transition-colors duration-200 ${
                      deleteLoading === item.id
                        ? 'bg-red-400 text-white cursor-not-allowed opacity-75'
                        : 'bg-white border border-red-400 hover:-translate-y-0.5 text-red-400'
                    }`}
                  >
                    {deleteLoading === item.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Hapus Disposisi
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && <Pagination />}

        {/* Delete Confirmation Modal */}
        <DeleteModal />
      </main>
    </div>
  );
};

export default DisposisiList;