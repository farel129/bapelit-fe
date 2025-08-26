import React, { useState, useEffect } from 'react';
import { staffDisposisiService } from '../../services/staffDisposisiService';
import { DisposisiCard } from '../../components/Staff/DisposisiCard';
import { FileText, AlertCircle, Clock, CheckCircle, Search, X, User, UserCircle2, Building2 } from 'lucide-react';
import Avatar from '../../assets/img/adminrobot.png'
import { useAuth } from '../../contexts/AuthContext';

const StaffDashboard = () => {
  const [allDisposisi, setAllDisposisi] = useState([]);
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchInstansi, setSearchInstansi] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });

  const [stats, setStats] = useState({
    total: 0,
    belumDibaca: 0,
    diproses: 0,
    selesai: 0
  });

  const { user } = useAuth()

  const applyFiltersAndPagination = () => {
    let filteredData = allDisposisi;

    if (filterStatus) {
      filteredData = filteredData.filter(item => item.status_dari_bawahan === filterStatus);
    }

    if (searchInstansi.trim()) {
      filteredData = filteredData.filter(item =>
        item.asal_instansi &&
        item.asal_instansi.toLowerCase().includes(searchInstansi.toLowerCase())
      );
    }

    const startIndex = pagination.offset;
    const endIndex = startIndex + pagination.limit;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    setDisposisiList(paginatedData);
    setPagination(prev => ({
      ...prev,
      total: filteredData.length
    }));
  };

  const fetchDisposisi = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await staffDisposisiService.getDaftarDisposisi({});

      let allData = [];
      if (response && Array.isArray(response.data)) {
        allData = response.data;
      } else if (response && Array.isArray(response)) {
        allData = response;
      } else {
        console.warn('Struktur data tidak dikenali:', response);
        allData = [];
      }

      setAllDisposisi(allData);

      const total = allData.length;
      const belumDibaca = allData.filter(item => item.status_dari_bawahan === 'belum dibaca').length;
      const diproses = allData.filter(item =>
        item.status_dari_bawahan === 'diproses' || item.status_dari_bawahan === 'diproses'
      ).length;
      const selesai = allData.filter(item => item.status_dari_bawahan === 'selesai').length;

      setStats({
        total,
        belumDibaca,
        diproses,
        selesai
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newOffset) => {
    setPagination(prev => ({ ...prev, offset: newOffset }));
  };

  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleSearchChange = (newSearch) => {
    setSearchInstansi(newSearch);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleSearchInput = (value) => {
    setSearchInput(value);
    setSearchInstansi(value);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const clearSearch = () => {
    setSearchInstansi('');
    setSearchInput('');
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  useEffect(() => {
    fetchDisposisi();
  }, []);

  useEffect(() => {
    if (allDisposisi.length > 0) {
      applyFiltersAndPagination();
    }
  }, [filterStatus, searchInstansi, pagination.offset, allDisposisi]);

  const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor }) => (
    <div className={`group relative ${bgColor} p-6 rounded-2xl shadow-sm border ${borderColor} hover:shadow-xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm overflow-hidden`}>
      {/* Modern gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Subtle animated background */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-100/20 to-purple-100/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

      <div className="relative flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2 group-hover:scale-105 transition-transform duration-300`}>{count}</p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300`}>
          <Icon className={`w-6 h-6 text-white`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373] mx-auto mb-3"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-[#D4A373]/30 mx-auto"></div>
          </div>
          <p className="text-[#6D4C41] animate-pulse">Memuat data disposisi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="text-center">
          <div className="bg-white/80 backdrop-blur-sm border-2 border-[#EDE6E3] rounded-2xl p-6 max-w-md mx-auto shadow-xl">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Terjadi Kesalahan</h3>
            <p className="text-[#6D4C41] mb-4">{error}</p>
            <button
              onClick={fetchDisposisi}
              className="bg-gradient-to-br from-[#D9534F] to-[#B52B27] hover:from-[#B52B27] hover:to-[#8B0000] text-white px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 border border-[#EDE6E3]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 rounded-2xl relative overflow-hidden" style={{ backgroundColor: '#FDFCFB' }}>
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-100/10 to-purple-100/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-orange-100/10 to-pink-100/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10">
        {/* Modern Header Section */}
        <div className="relative mb-4">
          <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-[#EDE6E3]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl overflow-hidden">
            {/* Animated background patterns */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between relative z-10">
              <div className='flex items-center gap-x-5'>
                <img src={Avatar} alt="" className='absolute h-50 w-50 right-0 top-0 object-cover opacity-80 hover:opacity-100 transition-opacity duration-300' />
                <div className='space-y-2'>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#2E2A27] to-[#6D4C41] bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <div className='flex items-center gap-x-2 group'>
                    <UserCircle2 className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' />
                    <p className='text-sm font-medium'>{user?.name}</p>
                  </div>
                  <div className='flex items-center gap-x-2 mb-5 group'>
                    <Building2 className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' />
                    <p className='text-sm font-medium'>{user?.jabatan}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-medium" style={{ color: '#6D4C41' }}>
                    <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                    <span>Live Updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
          <StatCard
            title="Total Disposisi"
            count={stats.total}
            icon={FileText}
            bgColor="bg-white/80 backdrop-blur-sm"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
            borderColor="border-white/50"
          />
          <StatCard
            title="Belum Dibaca"
            count={stats.belumDibaca}
            icon={AlertCircle}
            bgColor="bg-white/80 backdrop-blur-sm"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#D9534F] to-[#B52B27]"
            borderColor="border-white/50"
          />
          <StatCard
            title="Diproses"
            count={stats.diproses}
            icon={Clock}
            bgColor="bg-white/80 backdrop-blur-sm"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
            borderColor="border-white/50"
          />
          <StatCard
            title="Selesai"
            count={stats.selesai}
            icon={CheckCircle}
            bgColor="bg-white/80 backdrop-blur-sm"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#2196F3] to-[#0D47A1]"
            borderColor="border-white/50"
          />
        </div>

        {/* Modern Search and Filter Section */}
        <div className="mb-4">
          <div className="bg-gradient-to-br from-white/90 via-white/80 to-[#EDE6E3]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 opacity-50"></div>

            <div className="flex flex-col lg:flex-row w-full gap-6 relative z-10">
              {/* Enhanced Search Bar */}
              <div className='w-full lg:w-1/2'>
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="w-5 h-5 animate-pulse" style={{ color: '#6D4C41' }} />
                  <span className="text-sm font-semibold bg-gradient-to-r from-[#6D4C41] to-[#2E2A27] bg-clip-text text-transparent">Pencarian Instansi</span>
                </div>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Cari berdasarkan nama instansi..."
                    className="w-full bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl px-4 py-3 pr-10 text-[#2E2A27] placeholder-[#6D4C41] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-all duration-300 shadow-sm hover:shadow-md group-hover:bg-white"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-[#FDFCFB]/50 rounded-r-xl transition-all duration-300 group"
                    >
                      <X className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" style={{ color: '#6D4C41' }} />
                    </button>
                  )}
                  {!searchInput && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" style={{ color: '#6D4C41' }} />
                    </div>
                  )}
                </div>
                {searchInstansi && (
                  <div className="mt-3">
                    <span className="text-xs font-medium animate-pulse" style={{ color: '#6D4C41' }}>
                      {pagination.total} hasil ditemukan untuk "{searchInstansi}"
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Filter Status */}
              <div className='w-full lg:w-1/2'>
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-5 h-5 animate-pulse" style={{ color: '#6D4C41' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <span className="text-sm font-semibold bg-gradient-to-r from-[#6D4C41] to-[#2E2A27] bg-clip-text text-transparent">Filter Status</span>
                </div>
                <div className="relative group">
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full appearance-none bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl px-4 py-3 pr-10 text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-all duration-300 shadow-sm hover:shadow-md group-hover:bg-white"
                  >
                    <option value="" className="text-[#6D4C41]">Semua Status</option>
                    <option value="belum dibaca" className="text-[#2E2A27]">Belum Dibaca</option>
                    <option value="diproses" className="text-[#2E2A27]">Diproses</option>
                    <option value="selesai" className="text-[#2E2A27]">Selesai</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" style={{ color: '#6D4C41' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Active Filters Display */}
            {(filterStatus || searchInstansi) && (
              <div className="mt-6 pt-6 border-t border-white/30 relative z-10">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium bg-gradient-to-r from-[#6D4C41] to-[#2E2A27] bg-clip-text text-transparent">Filter Aktif:</span>
                  {filterStatus && (
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" style={{ color: '#6D4C41' }}>
                      <span>Status: {filterStatus}</span>
                      <button
                        onClick={() => handleFilterChange('')}
                        className="hover:text-[#2E2A27] transition-colors duration-300 hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {searchInstansi && (
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium border border-white/50 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" style={{ color: '#6D4C41' }}>
                      <span>Instansi: {searchInstansi}</span>
                      <button
                        onClick={clearSearch}
                        className="hover:text-[#2E2A27] transition-colors duration-300 hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setFilterStatus('');
                      setSearchInstansi('');
                      setSearchInput('');
                      setPagination(prev => ({ ...prev, offset: 0 }));
                    }}
                    className="text-xs font-medium hover:underline transition-all duration-300 hover:scale-105" style={{ color: '#6D4C41' }}
                  >
                    Hapus Semua Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Content Section */}
        <div className="space-y-6">
          {disposisiList.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl relative overflow-hidden">
              {/* Animated empty state background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 to-purple-50/20 opacity-50"></div>

              <div className="text-center py-16 px-6 relative z-10">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#FDFCFB] to-white rounded-full flex items-center justify-center mb-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110">
                  <FileText className="w-10 h-10 animate-pulse" style={{ color: '#6D4C41' }} />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-[#2E2A27] to-[#6D4C41] bg-clip-text text-transparent">
                  {searchInstansi || filterStatus ? 'Tidak Ada Hasil' : 'Tidak Ada Disposisi'}
                </h3>
                <p className="text-[#6D4C41] mt-2">
                  {searchInstansi || filterStatus
                    ? 'Tidak ditemukan disposisi yang sesuai dengan kriteria pencarian'
                    : 'Belum ada disposisi yang tersedia untuk saat ini'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {disposisiList.map((disposisi, index) => (
                <div
                  key={disposisi.id}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <DisposisiCard
                    disposisi={disposisi}
                    onRefresh={fetchDisposisi}
                    searchHighlight={searchInstansi}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ultra Modern Pagination */}
        {disposisiList.length > 0 && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-white/90 via-white/80 to-[#EDE6E3]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
                <button
                  onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm ${pagination.offset === 0
                    ? 'bg-white/60 text-[#6D4C41] disabled:opacity-50'
                    : 'bg-white/90 text-[#2E2A27] hover:bg-white hover:scale-105'
                    }`}
                >
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center space-x-4">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/50 shadow-md hover:shadow-lg transition-all duration-300">
                    <span className="text-sm font-semibold" style={{ color: '#6D4C41' }}>
                      <span className="text-[#2E2A27]">{pagination.offset + 1}</span>
                      {' '}-{' '}
                      <span className="text-[#2E2A27]">{Math.min(pagination.offset + pagination.limit, pagination.total)}</span>
                      {' '}dari{' '}
                      <span className="text-[#2E2A27]">{pagination.total}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:cursor-not-allowed shadow-sm border border-white/50 hover:shadow-xl hover:-translate-y-1 backdrop-blur-sm ${pagination.offset + pagination.limit >= pagination.total
                    ? 'bg-white/60 text-[#6D4C41] disabled:opacity-50'
                    : 'bg-white/90 text-[#2E2A27] hover:bg-white hover:scale-105'
                    }`}
                >
                  <span>Selanjutnya</span>
                  <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StaffDashboard;