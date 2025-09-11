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
  Loader,
  Search,
  X,
  User,
  RefreshCcw,
  Building2,
  UserCircle2
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../assets/img/adminrobot.png'
import toast from 'react-hot-toast';
import { atasanDisposisiService } from '../../services/atasanDisposisiService';

const KabidDashboard = () => {
  const navigate = useNavigate();
  const [allDisposisi, setAllDisposisi] = useState([]); // Store semua data
  const [disposisiList, setDisposisiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchInstansi, setSearchInstansi] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Untuk input field saja
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0,
    total: 0
  });

  // Statistik disposisi
  const [stats, setStats] = useState({
    total: 0,
    belumDibaca: 0,
    diproses: 0,
    selesai: 0
  });

  const { user } = useAuth()

  // Filter dan pagination di client side
  const applyFiltersAndPagination = () => {
    let filteredData = allDisposisi;
    
    // Filter berdasarkan status
    if (filterStatus) {
      filteredData = filteredData.filter(item => item.status_dari_kabid === filterStatus);
    }

    // Filter berdasarkan instansi
    if (searchInstansi.trim()) {
      filteredData = filteredData.filter(item => 
        item.asal_instansi && 
        item.asal_instansi.toLowerCase().includes(searchInstansi.toLowerCase())
      );
    }

    // Apply pagination
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

      const response = await atasanDisposisiService.getAtasanDisposisi();
      const result = response.data;


      let allData = [];
      if (result && Array.isArray(result.data)) {
        allData = result.data;
      } else if (result && Array.isArray(result)) {
        allData = result;
      } else {
        console.warn('Struktur data tidak dikenali:', result);
        allData = [];
      }

      // Store semua data
      setAllDisposisi(allData);

      // Hitung statistik dari data lengkap (tanpa filter)
      const total = allData.length;
      const belumDibaca = allData.filter(item => item.status_dari_kabid === 'belum dibaca').length;
      const diproses = allData.filter(item => item.status_dari_kabid === 'diproses' || item.status_dari_kabid === 'dalam proses').length;
      const selesai = allData.filter(item => item.status_dari_kabid === 'selesai').length;

      setStats({
        total,
        belumDibaca,
        diproses,
        selesai
      });

    } catch (err) {
      console.error('Error fetching disposisi:', err);
      setError(err.message);

      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.error || err.response.data?.message || 'Error tidak diketahui';
        toast.error(`Gagal (${status}): ${message}`);
      } else if (err.request) {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet.');
      } else {
        toast.error('Terjadi kesalahan: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const viewDetail = async (item) => {
    if (item.status === 'belum dibaca' && item.status_dari_kabid === 'belum dibaca') {
      try {
        await api.put(`/disposisi/kabid/baca/${item.id}`, {});

        // Refresh data after marking as read
        await fetchDisposisi();

        navigate(`/kabid/disposisi/detail/${item.id}`, {
          state: { disposisi: { ...item, status: 'dibaca', status_dari_kabid: 'dibaca' } }
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

  const getStatusBadge = (status_dari_kabid) => {
    const statusConfig = {
      'belum dibaca': {
        color: 'bg-red-100 text-red-800 border border-red-200',
        icon: AlertCircle,
        text: 'Belum Dibaca'
      },
      'dibaca': {
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        icon: AlertCircle,
        text: 'Sudah Dibaca'
      },
      'diteruskan': {
        color: 'bg-purple-100 text-purple-800 border border-purple-200',
        icon: Clock,
        text: 'Diteruskan kebawahan'
      },
      'diterima': {
        color: 'bg-green-100 text-green-800 border border-green-200',
        icon: CheckCircle,
        text: 'Diterima'
      },
      'diproses': {
        color: 'bg-blue-100 text-blue-800 border border-blue-200',
        icon: Clock,
        text: 'Dalam Proses'
      },
      'selesai': {
        color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
        icon: CheckCircle,
        text: 'Selesai'
      }
    };

    const config = statusConfig[status_dari_kabid] || statusConfig['belum dibaca'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
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

  // Remove search input handler
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

  // Fetch data hanya sekali saat component mount
  useEffect(() => {
    fetchDisposisi();
  }, []);

  // Apply filters setiap kali filter berubah (tanpa fetch API)
  useEffect(() => {
    if (allDisposisi.length > 0) {
      applyFiltersAndPagination();
    }
  }, [filterStatus, searchInstansi, pagination.offset, allDisposisi]);

  // Stat Card Component
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373] mx-auto mb-3"></div>
          <p className="text-[#6D4C41]">Memuat data disposisi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="text-center">
          <div className="bg-white border-2 border-[#EDE6E3] rounded-2xl p-6 max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Terjadi Kesalahan</h3>
            <p className="text-[#6D4C41] mb-4">{error}</p>
            <button
              onClick={fetchDisposisi}
              className="bg-gradient-to-br from-[#D9534F] to-[#B52B27] hover:from-[#B52B27] hover:to-[#8B0000] text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg border border-[#EDE6E3]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 rounded-2xl" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="container mx-auto">
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

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Disposisi"
            count={stats.total}
            icon={FileText}
            bgColor="bg-white"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
            borderColor="border-[#EDE6E3]"
          />
          <StatCard
            title="Belum Dibaca"
            count={stats.belumDibaca}
            icon={AlertCircle}
            bgColor="bg-white"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#D9534F] to-[#B52B27]"
            borderColor="border-[#EDE6E3]"
          />
          <StatCard
            title="Diproses"
            count={stats.diproses}
            icon={Clock}
            bgColor="bg-white"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
            borderColor="border-[#EDE6E3]"
          />
          <StatCard
            title="Selesai"
            count={stats.selesai}
            icon={CheckCircle}
            bgColor="bg-white"
            textColor="text-[#2E2A27]"
            iconBg="bg-gradient-to-br from-[#2196F3] to-[#0D47A1]"
            borderColor="border-[#EDE6E3]"
          />
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl p-6 border-2 border-[#EDE6E3] shadow-md">
            <div className="flex flex-col lg:flex-row w-full gap-6">
              {/* Search Bar */}
              <div className='w-full lg:w-1/2'>
                <div className="flex items-center space-x-3 mb-4">
                  <Search className="w-5 h-5" style={{ color: '#6D4C41' }} />
                  <span className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Pencarian Instansi</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Cari berdasarkan nama instansi..."
                    className="w-full bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 pr-10 text-[#2E2A27] placeholder-[#6D4C41] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-all duration-200 shadow-sm"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-[#FDFCFB] rounded-r-xl transition-colors"
                    >
                      <X className="w-4 h-4" style={{ color: '#6D4C41' }} />
                    </button>
                  )}
                  {!searchInput && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Search className="w-4 h-4" style={{ color: '#6D4C41' }} />
                    </div>
                  )}
                </div>
                {searchInstansi && (
                  <div className="mt-3">
                    <span className="text-xs font-medium" style={{ color: '#6D4C41' }}>
                      {pagination.total} hasil ditemukan untuk "{searchInstansi}"
                    </span>
                  </div>
                )}
              </div>

              {/* Filter Status */}
              <div className='w-full lg:w-1/2'>
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-5 h-5" style={{ color: '#6D4C41' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <span className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Filter Status</span>
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 pr-10 text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-all duration-200 shadow-sm"
                  >
                    <option value="" className="text-[#6D4C41]">Semua Status</option>
                    <option value="belum dibaca" className="text-[#2E2A27]">Belum Dibaca</option>
                    <option value="diproses" className="text-[#2E2A27]">Diproses</option>
                    <option value="selesai" className="text-[#2E2A27]">Selesai</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4" style={{ color: '#6D4C41' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {(filterStatus || searchInstansi) && (
              <div className="mt-6 pt-6 border-t border-[#EDE6E3]">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium" style={{ color: '#6D4C41' }}>Filter Aktif:</span>
                  {filterStatus && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-sm font-medium border border-[#EDE6E3] shadow-sm" style={{ color: '#6D4C41' }}>
                      <span>Status: {filterStatus}</span>
                      <button
                        onClick={() => handleFilterChange('')}
                        className="hover:text-[#2E2A27]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {searchInstansi && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-sm font-medium border border-[#EDE6E3] shadow-sm" style={{ color: '#6D4C41' }}>
                      <span>Instansi: {searchInstansi}</span>
                      <button
                        onClick={clearSearch}
                        className="hover:text-[#2E2A27]"
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
                    className="text-xs font-medium hover:underline" style={{ color: '#6D4C41' }}
                  >
                    Hapus Semua Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {disposisiList.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
              <div className="text-center py-16 px-6">
                <div className="mx-auto w-24 h-24 bg-[#FDFCFB] rounded-full flex items-center justify-center mb-6 border border-[#EDE6E3]">
                  <FileText className="w-10 h-10" style={{ color: '#6D4C41' }} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>
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
              {disposisiList.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h3 className="text-sm uppercase font-semibold" style={{ color: '#6D4C41' }}>
                            status
                          </h3>
                          {getStatusBadge(item.status_dari_kabid)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" style={{ color: '#6D4C41' }} />
                            <span className="font-semibold" style={{ color: '#6D4C41' }}>Dari:</span>
                            <span className="font-medium" style={{ color: '#2E2A27' }}>{item.asal_instansi}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" style={{ color: '#6D4C41' }} />
                            <span className="font-semibold" style={{ color: '#6D4C41' }}>No. Surat:</span>
                            <span className="font-medium" style={{ color: '#2E2A27' }}>{item.nomor_surat}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4" style={{ color: '#6D4C41' }} />
                            <span className="font-semibold" style={{ color: '#6D4C41' }}>No. Agenda:</span>
                            <span className="font-medium" style={{ color: '#2E2A27' }}>{item.nomor_agenda}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" style={{ color: '#6D4C41' }} />
                            <span className="font-semibold" style={{ color: '#6D4C41' }}>Tgl Surat:</span>
                            <span className="font-medium" style={{ color: '#2E2A27' }}>{item.tanggal_surat}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" style={{ color: '#6D4C41' }} />
                            <span className="font-semibold" style={{ color: '#6D4C41' }}>Diterima Tanggal:</span>
                            <span className="font-medium" style={{ color: '#2E2A27' }}>{item.diterima_tanggal}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FDFCFB] rounded-xl p-4 mb-4 border border-[#EDE6E3] shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-semibold flex items-center" style={{ color: '#6D4C41' }}>
                            <AlertCircle className="w-4 h-4 mr-1" style={{ color: '#6D4C41' }} />
                            Sifat:
                          </span>
                          <p className="text-sm mt-1 ml-5" style={{ color: '#2E2A27' }}>{item.sifat}</p>
                        </div>
                        <div>
                          <span className="text-sm font-semibold flex items-center" style={{ color: '#6D4C41' }}>
                            <CheckCircle className="w-4 h-4 mr-1" style={{ color: '#6D4C41' }} />
                            Dengan Hormat Harap:
                          </span>
                          <p className="text-sm mt-1 ml-5" style={{ color: '#2E2A27' }}>{item.dengan_hormat_harap}</p>
                        </div>
                      </div>
                    </div>

                    {item.surat_masuk?.has_photos && (
                      <div className="flex items-center gap-3 mb-4 p-3 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-full">
                          <Image className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold" style={{ color: '#6D4C41' }}>
                          {item.surat_masuk.photo_count} lampiran foto/dokumen tersedia
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-[#EDE6E3]">
                      <button
                        onClick={() => viewDetail(item)}
                        className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg border border-[#EDE6E3]"
                      >
                        <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Lihat Detail
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {disposisiList.length > 0 && (
          <div className="mt-8">
            <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl p-6 border-2 border-[#EDE6E3] shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <button
                  onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                  disabled={pagination.offset === 0}
                  className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed shadow-sm border border-[#EDE6E3] ${
                    pagination.offset === 0
                      ? 'bg-white text-[#6D4C41] disabled:opacity-50'
                      : 'bg-white text-[#2E2A27] hover:bg-[#FDFCFB] hover:shadow-md'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Sebelumnya</span>
                </button>

                <div className="flex items-center space-x-4">
                  <div className="bg-white px-4 py-2.5 rounded-xl border border-[#EDE6E3] shadow-sm">
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
                  className={`group flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed shadow-sm border border-[#EDE6E3] ${
                    pagination.offset + pagination.limit >= pagination.total
                      ? 'bg-white text-[#6D4C41] disabled:opacity-50'
                      : 'bg-white text-[#2E2A27] hover:bg-[#FDFCFB] hover:shadow-md'
                  }`}
                >
                  <span>Selanjutnya</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KabidDashboard;