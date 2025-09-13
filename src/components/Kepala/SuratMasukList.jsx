import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import CreateDisposisiModal from "./CreateDisposisiModal";
import ModalDetailSuratMasuk from "./ModalDetailSuratMasuk";
import { Eye, Mail, CheckCircle, Clock, ChevronRight, RefreshCcw, FileText, Search, Filter, ChevronLeft } from "lucide-react";
import toast from 'react-hot-toast';

const SuratMasukList = () => {
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [viewDetailSurat, setViewDetailSurat] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchSuratMasuk();
  }, []);

  const fetchSuratMasuk = async () => {
    try {
      setLoading(true);
      const response = await api.get('/surat-masuk/kepala');
      setSuratMasuk(response.data.data || []);
    } catch (error) {
      console.error('Error fetching surat masuk:', error);
      toast.error('Gagal memuat surat masuk: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (suratId) => {
    try {
      await api.put(`/surat-masuk/kepala/${suratId}`);
      fetchSuratMasuk(); // Refresh list
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Gagal menandai surat sebagai dibaca');
    }
  };

  const handleViewDetail = async (surat) => {
    // Jika status masih belum dibaca, mark as read dulu
    if (surat.status === 'belum dibaca') {
      await markAsRead(surat.id);
    }

    // Buka modal detail
    setViewDetailSurat(surat);
  };

  // Filter data berdasarkan search dan filter
  const filteredSurat = suratMasuk.filter(surat => {
    const matchSearch = searchTerm === '' ||
      surat.asal_instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surat.keterangan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surat.tanggal_surat?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = selectedStatus === '' || surat.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  // Pagination calculations
  const totalItems = filteredSurat.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSurat.slice(startIndex, endIndex);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

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

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Calculate statistics
  const totalSurat = suratMasuk.length;
  const belumDibaca = suratMasuk.filter(surat => surat.status === 'belum dibaca').length;
  const sudahDibaca = suratMasuk.filter(surat => surat.status === 'sudah dibaca').length;

  const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor, iconColor }) => (
    <div className={`${bgColor} p-3 rounded-2xl shadow-sm border ${borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex items-center gap-x-7 justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl shadow-md`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

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
          <span className="text-sm font-medium" >
            Menampilkan {startIndex + 1} - {Math.min(endIndex, totalItems)} dari {totalItems} data
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" >Per halaman:</span>
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
                <ChevronLeft className="h-4 w-4"  />
              </button>

              {getVisiblePages().map((page, index) => (
                page === '...' ? (
                  <span key={index} className="px-3 py-2 text-black">...</span>
                ) : (
                  <button
                    key={index}
                    onClick={() => goToPage(page)}
                    className={`px-3 py-2 rounded-xl transition-colors font-semibold shadow-sm border ${currentPage === page
                      ? 'bg-gradient-to-br from-white to-black text-white border-[#EDE6E3]'
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
                <ChevronRight className="h-4 w-4"  />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-2 text-black">Memuat surat masuk...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={fetchSuratMasuk}
          className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-white"
        >
          <RefreshCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="Total Surat"
          count={totalSurat}
          icon={Mail}
          bgColor="bg-white"
          textColor="text-black"
          iconBg="bg-pink-500"
          iconColor='text-white'
          borderColor="border-slate-200"
        />
        <StatCard
          title="Belum Dibaca"
          count={belumDibaca}
          icon={Clock}
          bgColor="bg-white"
          textColor="text-black"
          iconBg="bg-slate-200"
          borderColor="border-slate-200"
        />
        <StatCard
          title="Sudah Dibaca"
          count={sudahDibaca}
          icon={CheckCircle}
          bgColor="bg-black"
          textColor="text-white"
          iconBg="bg-white"
          iconColor='text-pink-500'
          borderColor="border-slate-200"
        />
      </div>

      {/* Filters */}
      <div className="p-3 shadow-lg rounded-2xl border-black/15 border">
        <div className=" mb-3">
          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan asal instansi, keterangan, atau tanggal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-white focus:border-white text-black placeholder-black shadow-sm"
                />
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
                  <option value="sudah dibaca">Sudah Dibaca</option>
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

        {/* Surat Masuk List */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
            <FileText className="h-12 w-12 text-black mx-auto mb-4" />
            <p className="text-black text-lg font-semibold">
              {suratMasuk.length === 0 ? 'Tidak ada surat masuk' : 'Tidak ada surat yang sesuai filter'}
            </p>
            <p className="text-black mt-1">
              {suratMasuk.length === 0 ? 'Belum ada surat masuk yang diterima' : 'Coba ubah filter pencarian'}
            </p>
          </div>
        ) : (
          <div className="space-y-6 mb-8">
            {currentItems.map((surat) => (
              <div key={surat.id} className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium" >Asal Instansi</p>
                        <p className="font-semibold text-black">{surat.asal_instansi}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" >Tanggal Surat</p>
                        <p className="font-semibold text-black">{surat.tanggal_surat}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" >Diterima Tanggal</p>
                        <p className="font-semibold text-black">{surat.diterima_tanggal}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium" >Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${surat.status === 'sudah dibaca'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : 'bg-slate-100 text-yellow-800 border border-slate-200'
                          }`}>
                          {surat.status}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#FDFCFB] p-4 rounded-xl border border-[#EDE6E3] mb-4">
                      <p className="text-sm font-medium" >Keterangan</p>
                      <p className="text-black">{surat.keterangan}</p>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col space-y-3">
                    <button
                      onClick={() => handleViewDetail(surat)}
                      className="bg-white flex items-center gap-x-2 justify-center shadow-md text-pink-500 px-4 py-3 text-sm font-semibold cursor-pointer rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border border-[#EDE6E3]"
                    >
                      Lihat Detail<span><ChevronRight className="w-5 h-5" /></span>
                    </button>

                    {surat.has_disposisi ? (
                      <div className="text-green-700 text-sm text-center bg-green-50 px-3 py-2.5 rounded-xl border border-green-200 font-semibold">
                        ✓ Disposisi Sudah Dibuat
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSurat(surat)}
                        className="bg-black hover:opacity-90 flex items-center gap-x-2 shadow-md text-white px-4 py-3 rounded-xl cursor-pointer text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border border-slate-500"
                      >
                        Buat Disposisi <FileText className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Pagination */}
      {totalItems > 0 && <Pagination />}

      {selectedSurat && (
        <CreateDisposisiModal
          surat={selectedSurat}
          onClose={() => setSelectedSurat(null)}
          onSuccess={() => {
            setSelectedSurat(null);
            fetchSuratMasuk();
          }}
        />
      )}

      {viewDetailSurat && (
        <ModalDetailSuratMasuk
          surat={viewDetailSurat}
          onClose={() => setViewDetailSurat(null)}
        />
      )}
    </div>
  );
};

export default SuratMasukList;