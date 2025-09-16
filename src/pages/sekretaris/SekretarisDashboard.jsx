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
  Search,
  X,
  Building2,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../../assets/img/adminrobot.png';
import toast from 'react-hot-toast';
import { atasanDisposisiService } from '../../services/atasanDisposisiService';
import LoadingSpinner from '../../components/Ui/LoadingSpinner';
import StatCard from '../../components/Ui/StatCard';

const SekretarisDashboard = () => {
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

  const { user } = useAuth();

  // Filter dan pagination di client side
  const applyFiltersAndPagination = () => {
    let filteredData = allDisposisi;

    // Filter berdasarkan status
    if (filterStatus) {
      filteredData = filteredData.filter(item => item.status_dari_sekretaris === filterStatus);
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
      const belumDibaca = allData.filter(item => item.status_dari_sekretaris === 'belum dibaca').length;
      const diproses = allData.filter(item =>
        item.status_dari_sekretaris === 'diproses' || item.status_dari_sekretaris === 'dalam proses'
      ).length;
      const selesai = allData.filter(item => item.status_dari_sekretaris === 'selesai').length;

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
    if (item.status === 'belum dibaca' && item.status_dari_sekretaris === 'belum dibaca') {
      try {
        await api.put(`/disposisi/sekretaris/baca/${item.id}`, {});

        // Refresh data after marking as read
        await fetchDisposisi();

        navigate(`/sekretaris/disposisi/detail/${item.id}`, {
          state: { disposisi: { ...item, status: 'dibaca', status_dari_sekretaris: 'dibaca' } }
        });
      } catch (error) {
        console.error('Error marking as read:', error);
        navigate(`/sekretaris/disposisi/detail/${item.id}`, {
          state: { disposisi: item }
        });
      }
    } else {
      navigate(`/sekretaris/disposisi/detail/${item.id}`, {
        state: { disposisi: item }
      });
    }
  };

  const getStatusBadge = (status_dari_sekretaris) => {
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

    const config = statusConfig[status_dari_sekretaris] || statusConfig['belum dibaca'];
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


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen p-5 rounded-3xl bg-white shadow-lg">
      <div className="container mx-auto">
        {/* Header — SAMA SEPERTI KABIDDASHBOARD */}
        <div className="relative mb-6">
          <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-[#EDE6E3]/50 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between relative z-10">
              <div className='flex items-center gap-x-5'>
                <img src={Avatar} alt="" className='absolute h-50 w-50 right-0 top-0 object-cover' />
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

        {/* Stat Cards — SAMA SEPERTI KABIDDASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
          <StatCard
            title="Total Disposisi"
            count={stats.total}
            icon={FileText}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-white"
            borderColor="border-slate-200"
          />
          <StatCard
            title="Belum Dibaca"
            count={stats.belumDibaca}
            icon={AlertCircle}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-neutral-400"
            iconColor="text-white"
            borderColor="border-slate-200"
          />
          <StatCard
            title="Diproses"
            count={stats.diproses}
            icon={Clock}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-pink-400"
            iconColor="text-white"
            borderColor="border-pink-400"
          />
          <StatCard
            title="Selesai"
            count={stats.selesai}
            icon={CheckCircle}
            bgColor="bg-black"
            textColor="text-white"
            iconBg="bg-white"
            iconColor="text-pink-400"
            borderColor="border-slate-200"
          />
        </div>

        {/* Search and Filter Section — SAMA SEPERTI KABIDDASHBOARD */}
        <div className="mb-4 p-6 shadow-lg rounded-2xl border-2 border-[#EDE6E3] bg-white">
          <div className="mb-3">
            <div className="flex flex-col lg:flex-row gap-2">

              {/* Search Bar — SAMA SEPERTI KABIDDASHBOARD */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6D4C41]" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan instansi..."
                    value={searchInput}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] placeholder-[#6D4C41] shadow-sm"
                  />
                  {searchInput && (
                    <button
                      onClick={clearSearch}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-[#FDFCFB] rounded-r-xl transition-colors"
                    >
                      <X className="h-5 w-5 text-[#6D4C41]" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Status — SAMA SEPERTI KABIDDASHBOARD */}
              <div className="w-full lg:w-48">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D4C41] z-10" />
                  <select
                    value={filterStatus}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] shadow-sm appearance-none"
                  >
                    <option value="">Semua Status</option>
                    <option value="belum dibaca">Belum Dibaca</option>
                    <option value="diproses">Diproses</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              {/* Reset Button — SAMA SEPERTI KABIDDASHBOARD */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilterStatus('');
                    setSearchInstansi('');
                    setSearchInput('');
                    setPagination(prev => ({ ...prev, offset: 0 }));
                  }}
                  className="px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] transition-all flex items-center gap-2 text-[#2E2A27] font-semibold shadow-sm hover:shadow-md"
                >
                  <Filter className="h-4 w-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters Display — SAMA SEPERTI KABIDDASHBOARD */}
          {(filterStatus || searchInstansi) && (
            <div className="mt-4 pt-4 border-t border-[#EDE6E3]">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-[#6D4C41]">Filter Aktif:</span>
                {filterStatus && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-sm font-medium border border-[#EDE6E3] shadow-sm">
                    <span>Status: {filterStatus}</span>
                    <button onClick={() => handleFilterChange('')} className="hover:text-[#2E2A27]">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {searchInstansi && (
                  <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full text-sm font-medium border border-[#EDE6E3] shadow-sm">
                    <span>Instansi: "{searchInstansi}"</span>
                    <button onClick={clearSearch} className="hover:text-[#2E2A27]">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Data List — DISAMAKAN 100% DENGAN TABEL KABIDDASHBOARD */}
        {disposisiList.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm text-center py-16 px-6">
            <FileText className="h-12 w-12 text-[#6D4C41] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#2E2A27]">
              {searchInstansi || filterStatus ? 'Tidak Ada Hasil' : 'Tidak Ada Disposisi'}
            </h3>
            <p className="text-[#6D4C41] mt-2">
              {searchInstansi || filterStatus
                ? 'Tidak ditemukan disposisi yang sesuai dengan kriteria pencarian'
                : 'Belum ada disposisi yang tersedia untuk saat ini'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border-2 border-[#EDE6E3] shadow-sm bg-white">
            <table className="min-w-full divide-y divide-[#EDE6E3]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Nomor Surat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Asal Instansi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">No. Agenda</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Tanggal Surat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Sifat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE6E3]">
                {disposisiList.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FDFCFB] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2A27]">
                      {item.nomor_surat || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2A27]">
                      {item.asal_instansi || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2A27]">
                      {item.nomor_agenda || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2A27]">
                      {item.tanggal_surat || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${item.sifat === 'Sangat Segera' ? 'bg-red-100 text-red-800 border-red-200' :
                          item.sifat === 'Segera' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            item.sifat === 'Rahasia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              item.sifat === 'Biasa' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                'bg-gray-100 text-gray-800 border-gray-200'
                        }`}>
                        {item.sifat || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status_dari_sekretaris)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => viewDetail(item)}
                          className="flex items-center justify-center gap-x-1 text-black text-sm shadow-lg font-medium bg-white px-3 py-2 border border-slate-200 rounded-xl hover:-translate-y-1 transition-all"
                        >
                          <Eye className="w-4 h-4" /> Lihat
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Component — SAMA SEPERTI KABIDDASHBOARD */}
        {disposisiList.length > 0 && (
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border-2 border-[#EDE6E3] mt-8">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#2E2A27]">
                Menampilkan {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} dari {pagination.total} data
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                disabled={pagination.offset === 0}
                className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft className="h-4 w-4 text-[#2E2A27]" />
              </button>

              <span className="px-3 py-2 text-[#2E2A27] font-medium bg-[#FDFCFB] rounded-xl border border-[#EDE6E3]">
                Halaman {Math.floor(pagination.offset / pagination.limit) + 1}
              </span>

              <button
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight className="h-4 w-4 text-[#2E2A27]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SekretarisDashboard;