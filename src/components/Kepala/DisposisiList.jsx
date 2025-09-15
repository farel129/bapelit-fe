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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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
        case 'belum dibaca': return 'bg-slate-100 text-yellow-800 border border-slate-200';
        case 'dibaca': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'dalam proses':
        case 'diproses': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        case 'selesai': return 'bg-green-100 text-green-800 border border-green-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
        {status}
      </span>
    );
  };

  // === SIFAT BADGE (DIUBAH SESUAI PALET STANDAR) ===
  const SifatBadge = ({ sifat }) => {
    const getSifatColor = (sifat) => {
      switch (sifat) {
        case 'Sangat Segera': return 'bg-red-100 text-red-800 border border-red-200';
        case 'Segera': return 'bg-orange-100 text-orange-800 border border-orange-200';
        case 'Biasa': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'Rahasia': return 'bg-purple-100 text-purple-800 border border-purple-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSifatColor(sifat)}`}>
        {sifat}
      </span>
    );
  };

  // === PAGINATION COMPONENT (SAMA SEPERTI SURAT MASUK LIST) ===
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
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border-2 border-[#EDE6E3]">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-[#EDE6E3] rounded-xl text-sm focus:ring-2 focus:ring-white focus:border-white bg-white text-black shadow-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <>
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getVisiblePages().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-3 py-2 text-black">...</span>
                ) : (
                  <button
                    key={index}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-xl transition-colors font-semibold shadow-sm border ${
                      currentPage === page
                        ? 'bg-black text-white border-[#EDE6E3]'
                        : 'border-[#EDE6E3] hover:bg-[#FDFCFB] text-black hover:text-black'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // === DELETE MODAL (DISAMAKAN DENGAN GAYA STANDAR) ===
  const DeleteModal = () => {
    if (!showDeleteModal || !selectedDisposisi) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border-2 border-[#EDE6E3]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-[#D9534F] to-[#B52B27] rounded-xl shadow-md">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black">Konfirmasi Hapus</h3>
                  <p className="text-sm font-medium text-black opacity-80">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-colors border border-[#EDE6E3]"
              >
                <X className="h-5 w-5 text-black" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-black font-semibold mb-4">
                Apakah Anda yakin ingin menghapus disposisi ini?
              </p>
              <div className="bg-[#FDFCFB] p-4 rounded-xl border border-[#EDE6E3] shadow-sm">
                <p className="font-semibold text-black">{selectedDisposisi.perihal}</p>
                <p className="text-sm text-black opacity-80 mt-1">Nomor: {selectedDisposisi.nomor_surat}</p>
                <p className="text-sm text-black opacity-80">Dari: {selectedDisposisi.asal_instansi}</p>
              </div>
              <p className="text-red-700 text-sm mt-3 font-semibold">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Status surat akan diubah menjadi belum didisposisi.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2.5 text-black border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] font-semibold transition-all shadow-sm"
                disabled={deleteLoading === selectedDisposisi.id}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(selectedDisposisi.id)}
                disabled={deleteLoading === selectedDisposisi.id}
                className={`px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md border border-[#EDE6E3] flex items-center gap-2 ${
                  deleteLoading === selectedDisposisi.id
                    ? 'bg-gradient-to-br from-[#D9534F] to-[#B52B27] text-white cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-br from-[#D9534F] to-[#B52B27] text-white hover:from-[#B52B27] hover:to-[#8B0000] hover:-translate-y-0.5 hover:shadow-lg'
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={fetchDisposisi}
          className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-white"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Cards (Sesuai Gaya Surat Masuk List) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Disposisi"
          count={totalDisposisi}
          icon={Archive}
          bgColor="bg-white"
          textColor="text-black"
          iconBg="bg-pink-400"
          borderColor="border-slate-200"
          iconColor="text-white"
        />
        <StatCard
          title="Belum Dibaca"
          count={belumDibaca}
          icon={Clock}
          bgColor="bg-white"
          textColor="text-black"
          iconBg="bg-slate-200"
          borderColor="border-slate-200"
          iconColor="text-black"
        />
        <StatCard
          title="Diproses"
          count={diproses}
          icon={FileText}
          bgColor="bg-white"
          textColor="text-black"
          iconBg="bg-neutral-500"
          borderColor="border-slate-200"
          iconColor="text-white"
        />
        <StatCard
          title="Selesai"
          count={selesai}
          icon={CheckCircle}
          bgColor="bg-black"
          textColor="text-white"
          iconBg="bg-white"
          borderColor="border-slate-200"
          iconColor="text-pink-400"
        />
      </div>

      {/* Filters */}
      <div className="p-3 shadow-lg rounded-2xl border-black/15 border">
        <div className="mb-3">
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan perihal, nomor surat, instansi, atau jabatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-white focus:border-white text-black placeholder-black shadow-sm"
                />
              </div>
            </div>

            {/* Filter Sifat */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black z-10" />
                <select
                  value={selectedSifat}
                  onChange={(e) => setSelectedSifat(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-white focus:border-white text-black shadow-sm appearance-none"
                >
                  <option value="">Semua Sifat</option>
                  <option value="Sangat Segera">Sangat Segera</option>
                  <option value="Segera">Segera</option>
                  <option value="Rahasia">Rahasia</option>
                  <option value="Biasa">Biasa</option>
                </select>
              </div>
            </div>

            {/* Filter Status */}
            <div className="w-full lg:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black z-10" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-white focus:border-white text-black shadow-sm appearance-none"
                >
                  <option value="">Semua Status</option>
                  <option value="belum dibaca">Belum Dibaca</option>
                  <option value="dibaca">Dibaca</option>
                  <option value="diproses">Dalam Proses</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
            </div>

            {/* Reset */}
            <div className="flex gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] transition-all flex items-center gap-2 text-black font-semibold shadow-sm hover:shadow-md"
              >
                <Filter className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Disposisi List - CARD VERSION (TETAP KONSISTEN DENGAN SURAT MASUK) */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
            <FileText className="h-12 w-12 text-black mx-auto mb-4" />
            <p className="text-black text-lg font-semibold">
              {disposisi.length === 0 ? 'Belum ada disposisi' : 'Tidak ada disposisi yang sesuai filter'}
            </p>
            <p className="text-black mt-1">
              {disposisi.length === 0 ? 'Belum ada disposisi yang dibuat' : 'Coba ubah filter pencarian'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
            <table className="min-w-full divide-y divide-[#EDE6E3] bg-white rounded-2xl">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Nomor Surat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Asal Instansi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Disposisi Kepada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Sifat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE6E3]">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {item.nomor_surat || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {item.asal_instansi || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {item.disposisi_kepada_jabatan || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <SifatBadge sifat={item.sifat} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => window.location.href = `/kepala/disposisi/${item.id}`}
                          className="flex items-center justify-center gap-x-1 text-pink-400 hover:text-pink-700 text-sm font-medium bg-white px-3 py-2 border border-[#EDE6E3] rounded-xl hover:shadow-sm transition-all"
                        >
                          <Eye className="w-4 h-4" /> Lihat
                        </button>

                        <button
                          onClick={() => openDeleteModal(item)}
                          disabled={deleteLoading === item.id}
                          className={`flex items-center justify-center gap-x-1 text-white text-sm font-medium px-3 py-2 rounded-xl transition-all ${
                            deleteLoading === item.id
                              ? 'bg-neutral-400 opacity-75 cursor-not-allowed'
                              : 'bg-neutral-400 hover:-translate-y-0.5 hover:shadow-lg'
                          }`}
                        >
                          {deleteLoading === item.id ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin" />
                              Hapus
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4" />
                              Hapus
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalItems > 0 && <Pagination />}

      {/* Delete Confirmation Modal */}
      <DeleteModal />
    </div>
  );
};

export default DisposisiList;