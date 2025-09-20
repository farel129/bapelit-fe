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
  Search,
  X,
  Building2,
  UserCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutDashboard
} from 'lucide-react';
import { staffDisposisiService } from '../../services/staffDisposisiService';
import Avatar from '../../assets/img/adminrobot.png';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/Ui/LoadingSpinner';
import StatCard from '../../components/Ui/StatCard';

const StaffDashboard = () => {
  const navigate = useNavigate();
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

  const { user } = useAuth();

  // === LOGIKA ASLI — TIDAK DIUBAH SATU PUN ===
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

  // Fungsi navigasi detail — hanya di sini!
  const handleViewDetail = (id) => {
    navigate(`/staff/disposisi/${id}`);
  };

  useEffect(() => {
    fetchDisposisi();
  }, []);

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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-gray-900">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-2">{error}</p>
            <button
              onClick={fetchDisposisi}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-full font-medium transition shadow"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ STATUS BADGE — DISAMAKAN DENGAN GAYA SURAT MASUK
  const getStatusBadge = (status_dari_bawahan) => {
    const statusConfig = {
      'belum dibaca': {
        color: 'bg-green-100 text-green-800',
        icon: AlertCircle,
        text: 'Belum Dibaca'
      },
      'dibaca': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
        text: 'Sudah Dibaca'
      },
      'diproses': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        text: 'Dalam Proses'
      },
      'selesai': {
        color: 'bg-gray-100 text-gray-800',
        icon: CheckCircle,
        text: 'Selesai'
      }
    };

    const config = statusConfig[status_dari_bawahan] || statusConfig['belum dibaca'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  // ✅ SIFAT BADGE — DISAMAKAN DENGAN GAYA SURAT MASUK
  const SifatBadge = ({ sifat }) => {
    const getSifatColor = (sifat) => {
      switch (sifat) {
        case 'Sangat Segera': return 'bg-red-100 text-red-800';
        case 'Segera': return 'bg-orange-100 text-orange-800';
        case 'Rahasia': return 'bg-purple-100 text-purple-800';
        case 'Biasa': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSifatColor(sifat)}`}>
        {sifat || '-'}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <main className="p-4">

        <div className="relative bg-gradient-to-bl from-teal-500 via-teal-300 to-teal-400 rounded-2xl p-5 border border-slate-200 shadow-lg mb-2">
          <div className='flex justify-between items-center gap-x-5'>
            <div className='space-y-2'>
              <h1 className="text-2xl font-bold text-white">Dashboard Staff</h1>
              <div className='flex items-center gap-x-2'>
                <UserCircle2 className='w-5 h-5 text-white' />
                <p className='text-sm font-medium text-white'>{user?.name}</p>
              </div>
              <div className='flex items-center gap-x-2'>
                <Building2 className='w-5 h-5 text-white' />
                <p className='text-sm font-medium text-white'>{user?.jabatan}</p>
              </div>
            </div>
            <LayoutDashboard className='text-white w-20 h-20' />
          </div>
        </div>

        {/* ✅ Stat Cards — DISAMAKAN DENGAN GAYA SURAT MASUK */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
          <StatCard
            title="Total Disposisi"
            count={stats.total}
            icon={FileText}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-teal-400"
            borderColor="border-slate-200"
            iconColor="text-white"
          />
          <StatCard
            title="Belum Dibaca"
            count={stats.belumDibaca}
            icon={AlertCircle}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-green-100"
            borderColor="border-slate-200"
            iconColor="text-green-800"
          />
          <StatCard
            title="Diproses"
            count={stats.diproses}
            icon={Clock}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-yellow-100"
            borderColor="border-slate-200"
            iconColor="text-yellow-800"
          />
          <StatCard
            title="Selesai"
            count={stats.selesai}
            icon={CheckCircle}
            bgColor="bg-black"
            textColor="text-white"
            iconBg="bg-white"
            borderColor="border-slate-200"
            iconColor="text-teal-400"
          />
        </div>

        {/* ✅ Search and Filter Section — DISAMAKAN DENGAN GAYA SURAT MASUK */}
        <div className="mb-2 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan instansi..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              {searchInput && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="">Semua Status</option>
                <option value="belum dibaca">Belum Dibaca</option>
                <option value="diproses">Diproses</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setFilterStatus('');
                setSearchInstansi('');
                setSearchInput('');
                setPagination(prev => ({ ...prev, offset: 0 }));
              }}
              className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition flex items-center gap-2"
            >
              <Filter className="h-4 w-4" /> Reset
            </button>

          </div>

          {/* Active Filters Display */}
          {(filterStatus || searchInstansi) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Filter Aktif:</span>
                {filterStatus && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>Status: {filterStatus}</span>
                    <button onClick={() => handleFilterChange('')} className="hover:text-gray-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {searchInstansi && (
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span>Instansi: "{searchInstansi}"</span>
                    <button onClick={clearSearch} className="hover:text-gray-700">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Disposisi List — CARD LAYOUT (SEPERTI SURAT MASUK) */}
        {disposisiList.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-2">
              <FileText className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchInstansi || filterStatus ? 'Tidak Ada Hasil' : 'Tidak Ada Disposisi'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchInstansi || filterStatus
                ? 'Tidak ditemukan disposisi yang sesuai dengan kriteria pencarian'
                : 'Belum ada disposisi yang tersedia untuk saat ini'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            {disposisiList.map((item) => (
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
                      {item.tanggal_surat || '-'}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                        <Building className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Nomor Agenda</p>
                        <p className="text-gray-800">{item.nomor_agenda || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mt-0.5">
                        <AlertCircle className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Sifat</p>
                        <SifatBadge sifat={item.sifat} />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div>
                        <p className="text-gray-500 font-medium">Status</p>
                        {getStatusBadge(item.status_dari_bawahan)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="space-y-2 pt-3 border-t border-gray-50/50">
                  <button
                    onClick={() => handleViewDetail(item.id)}
                    className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-sm font-medium shadow transition-colors duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Detail
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ✅ Pagination Component — DISAMAKAN DENGAN GAYA SURAT MASUK */}
        {disposisiList.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mt-6">
            <div className="text-sm text-gray-700">
              Menampilkan {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} dari {pagination.total} data
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
                disabled={pagination.offset === 0}
                className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-3 py-1 text-gray-800 font-medium bg-gray-100 rounded-full border border-gray-300">
                Halaman {Math.floor(pagination.offset / pagination.limit) + 1}
              </span>

              <button
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                disabled={pagination.offset + pagination.limit >= pagination.total}
                className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StaffDashboard;