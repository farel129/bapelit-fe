import React, { useState, useEffect } from 'react';
import { Search, Eye, FileText, Calendar, Building, User, AlertCircle, Loader2, Filter, RotateCcw, Trash2, X, RefreshCcw, CheckCircle, Clock, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

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
      
      // Update state untuk menghapus item dari list
      setDisposisi(prevDisposisi => prevDisposisi.filter(item => item.id !== id));
      
      // Tampilkan pesan sukses
      toast.success(response.data.message || 'Disposisi berhasil dihapus');
      
      // Tutup modal
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

  // StatCard component
  const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor }) => (
    <div className={`${bgColor} p-6 rounded-2xl shadow-sm border ${borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl shadow-md`}>
          <Icon className={`w-6 h-6 text-white`} />
        </div>
      </div>
    </div>
  );

  // Status badge component
  const StatusBadge = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'belum dibaca': return 'bg-red-100 text-red-800 border-red-200';
        case 'dibaca': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'dalam proses': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'diproses': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'selesai': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(status)}`}>
        {status || 'Unknown'}
      </span>
    );
  };

  // Sifat badge component
  const SifatBadge = ({ sifat }) => {
    const getSifatColor = (sifat) => {
      switch (sifat) {
        case 'Sangat Segera': return 'border-red-500 border text-red-500';
        case 'Segera': return 'bg-orange-500 text-white';
        case 'Biasa': return 'bg-blue-500 text-white';
        case 'Rahasia': return 'bg-purple-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getSifatColor(sifat)}`}>
        {sifat}
      </span>
    );
  };

  // Pagination component
  const Pagination = () => {
    // Always show pagination if there are items, even if only 1 page
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
          <span className="text-sm font-medium" style={{ color: '#6D4C41' }}>
            Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
          </span>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#6D4C41' }}>Per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => changeItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-[#EDE6E3] rounded-xl text-sm focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] bg-white text-[#2E2A27] shadow-sm"
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
                <ChevronLeft className="h-4 w-4" style={{ color: '#6D4C41' }} />
              </button>

              {getVisiblePages().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-3 py-2 text-[#6D4C41]">...</span>
                ) : (
                  <button
                    key={index}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-xl transition-colors font-semibold shadow-sm border ${
                      currentPage === page
                        ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white border-[#EDE6E3]'
                        : 'border-[#EDE6E3] hover:bg-[#FDFCFB] text-[#2E2A27] hover:text-[#6D4C41]'
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
                <ChevronRight className="h-4 w-4" style={{ color: '#6D4C41' }} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
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
                  <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Konfirmasi Hapus</h3>
                  <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button
                onClick={closeDeleteModal}
                className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-colors border border-[#EDE6E3]"
              >
                <X className="h-5 w-5" style={{ color: '#6D4C41' }} />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-[#2E2A27] font-semibold mb-4">
                Apakah Anda yakin ingin menghapus disposisi ini?
              </p>
              <div className="bg-[#FDFCFB] p-4 rounded-xl border border-[#EDE6E3] shadow-sm">
                <p className="font-semibold text-[#2E2A27]">{selectedDisposisi.perihal}</p>
                <p className="text-sm text-[#6D4C41] mt-1">Nomor: {selectedDisposisi.nomor_surat}</p>
                <p className="text-sm text-[#6D4C41]">Dari: {selectedDisposisi.asal_instansi}</p>
              </div>
              <p className="text-red-700 text-sm mt-3 font-semibold">
                <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Status surat akan diubah menjadi belum didisposisi.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2.5 text-[#2E2A27] border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] font-semibold transition-all shadow-sm"
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
        <span className="ml-2 text-[#6D4C41]">Memuat data disposisi...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Semua Disposisi</h1>
            <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Kelola disposisi surat dengan elegan</p>
          </div>
        </div>
        <button
          onClick={fetchDisposisi}
          className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Disposisi"
          count={totalDisposisi}
          icon={Archive}
          bgColor="bg-white"
          textColor="text-[#2E2A27]"
          iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
          borderColor="border-[#EDE6E3]"
        />
        <StatCard
          title="Belum Dibaca"
          count={belumDibaca}
          icon={Clock}
          bgColor="bg-white"
          textColor="text-[#2E2A27]"
          iconBg="bg-gradient-to-br from-[#D9534F] to-[#B52B27]"
          borderColor="border-[#EDE6E3]"
        />
        <StatCard
          title="Diproses"
          count={diproses}
          icon={FileText}
          bgColor="bg-white"
          textColor="text-[#2E2A27]"
          iconBg="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
          borderColor="border-[#EDE6E3]"
        />
        <StatCard
          title="Selesai"
          count={selesai}
          icon={CheckCircle}
          bgColor="bg-white"
          textColor="text-[#2E2A27]"
          iconBg="bg-gradient-to-br from-[#2196F3] to-[#0D47A1]"
          borderColor="border-[#EDE6E3]"
        />
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl border-2 border-[#EDE6E3] shadow-md p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6D4C41]" />
              <input
                type="text"
                placeholder="Cari berdasarkan perihal, nomor surat, instansi, atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] placeholder-[#6D4C41] shadow-sm"
              />
            </div>
          </div>

          {/* Filter Sifat */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D4C41] z-10" />
              <select
                value={selectedSifat}
                onChange={(e) => setSelectedSifat(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] shadow-sm appearance-none"
              >
                <option value="">Semua Sifat</option>
                <option value="Sangat Segera">Sangat Segera</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>
          </div>

          {/* Filter Status */}
          <div className="w-full lg:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D4C41] z-10" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] shadow-sm appearance-none"
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
              className="px-4 py-3 text-[#2E2A27] bg-white border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] transition-all flex items-center gap-2 font-semibold shadow-sm hover:shadow-md"
            >
              <Filter className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Disposisi List */}
      {currentItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
          <FileText className="h-12 w-12 text-[#6D4C41] mx-auto mb-4" />
          <p className="text-[#2E2A27] text-lg font-semibold">
            {disposisi.length === 0 ? 'Belum ada disposisi' : 'Tidak ada disposisi yang sesuai filter'}
          </p>
          <p className="text-[#6D4C41] mt-1">
            {disposisi.length === 0 ? 'Belum ada disposisi yang dibuat' : 'Coba ubah filter pencarian'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {currentItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <SifatBadge sifat={item.sifat} />
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-4">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Nomor Surat</p>
                      <p className="font-semibold text-[#2E2A27]">{item.nomor_surat || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Asal Instansi</p>
                      <p className="font-semibold text-[#2E2A27]">{item.asal_instansi || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Disposisi Kepada</p>
                      <p className="font-semibold text-[#2E2A27]">{item.disposisi_kepada_jabatan || '-'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Tanggal Dibuat</p>
                      <p className="font-semibold text-[#2E2A27]">{formatDate(item.created_at)}</p>
                    </div>
                  </div>

                  {/* Instruksi */}
                  {item.dengan_hormat_harap && (
                    <div className="bg-[#FDFCFB] p-4 rounded-xl border border-[#EDE6E3] mb-4 shadow-sm">
                      <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Instruksi</p>
                      <p className="text-[#2E2A27]">{item.dengan_hormat_harap}</p>
                    </div>
                  )}

                  {/* Catatan */}
                  {item.catatan && (
                    <div className="bg-[#FDFCFB] p-4 rounded-xl border border-[#EDE6E3] shadow-sm">
                      <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Catatan</p>
                      <p className="text-[#2E2A27]">{item.catatan}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="ml-6 flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      window.location.href = `/kepala/disposisi/${item.id}`;
                    }}
                    className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] flex items-center gap-x-2 justify-center shadow-md text-white px-4 py-3 text-sm font-semibold cursor-pointer rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border border-[#EDE6E3]"
                  >
                    <Eye className="h-4 w-4" />
                    Detail
                  </button>
                  
                  <button
                    onClick={() => openDeleteModal(item)}
                    disabled={deleteLoading === item.id}
                    className={`flex items-center gap-x-2 shadow-md px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 border border-[#EDE6E3] ${
                      deleteLoading === item.id
                        ? 'bg-gradient-to-br from-[#D9534F] to-[#B52B27] text-white cursor-not-allowed opacity-75'
                        : 'bg-gradient-to-br from-[#D9534F] to-[#B52B27] text-white hover:from-[#B52B27] hover:to-[#8B0000] hover:-translate-y-0.5 hover:shadow-lg'
                    }`}
                  >
                    {deleteLoading === item.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Hapus
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
          ))}
        </div>
      )}

      {/* Pagination - Always show if there are items */}
      {totalItems > 0 && <Pagination />}

      {/* Delete Confirmation Modal */}
      <DeleteModal />
    </div>
  );
};

export default DisposisiList;