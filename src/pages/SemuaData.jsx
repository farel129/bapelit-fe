import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, X, CheckCircle, Eye, Download, Calendar, User, Building2, MessageSquare, Database, Sparkles, TrendingUp, Loader, Cigarette, RefreshCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const SemuaData = () => {
  const [suratData, setSuratData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Fetch data dari API
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch semua surat masuk menggunakan axios
      const suratResponse = await api.get('/surat-masuk/all');

      // Fetch statistik menggunakan axios
      const statsResponse = await api.get('/surat-masuk/stats');

      setSuratData(suratResponse.data?.data || []);
      setStats(statsResponse.data?.stats || {});

    } catch (err) {
      console.error('Error fetching data:', err);

      if (err.response) {
        // Server responded with error status
        const errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        setError('Tidak ada respon dari server. Pastikan server backend berjalan.');
        toast.error('Tidak ada respon dari server');
      } else {
        // Something else happened
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
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-gray-800',
      processed: 'bg-green-100 text-gray-800'
    };

    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {status === 'pending' ? 'Pending' : status === 'processed' ? 'Diproses' : status}
      </span>
    );
  };

  // Data untuk chart jabatan
  const jabatanChartData = Object.entries(stats?.byJabatan || {}).map(([jabatan, count]) => ({
    jabatan: jabatan.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    jumlah: count
  }));

  // Data untuk pie chart status
  const statusChartData = [
    { name: 'Pending', value: stats?.pending || 0, color: '#fff085' },
    { name: 'Diproses', value: stats?.processed || 0, color: '#7bf1a8' }
  ];

  const handleDownloadPDF = async (suratId, nomorSurat) => {
    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const response = await api.get(`/surat/${suratId}/pdf`, {
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

      // Create blob URL and download
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

  if (loading) {
    return (
      <div className="flex flex-col space-y-2 justify-center bggre items-center h-screen">
        <Loader className='w-8 h-8 animate-spin' />
        <p>Memuat</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <Cigarette className='w-13 h-13 text-red-400' />
        <p className='font-bold text-2xl text-red-400'>Error</p>
        <p className='text-gray-500 mt-1 flex items-center gap-x-2'> <AlertCircle className='w-4 h-4' /> server bermasalah</p>
        <button
          onClick={fetchAllData}
          className=" bg-white mt-3 hover:bg-gray-50 text-sm font-semibold text-black shadow-lg border border-black/5 py-3 px-6 rounded-xl items-center flex gap-x-2"
        >
          <RefreshCcw className='w-4 h-4 text-black' />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        <div className='bg-gradient-to-tl from-gray-50 via-white to-gray-50 p-5 rounded-3xl shadow-lg border border-black/5'>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className='flex gap-x-2 items-center'>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#fff] rounded-2xl shadow-lg border border-black/5">
                <Database className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold  text-black mb-1">Semua Data</h1>
                <p className="text-sm text-gray-500">Menu ini menampilkan semua data surat dari semua jabatan</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400 font-medium">Data Analytics</span>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-8 my-6">
          {/* Bar Chart - Surat per Jabatan */}
          <div className="group relative bg-white backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-50"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 animate-bounce bg-emerald-100 rounded-xl shadow-lg">
                    <TrendingUp className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="text-lg font-medium text-black ">Surat per Jabatan</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-inner border border-gray-100">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={jabatanChartData} margin={{ top: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                    <XAxis
                      dataKey="jabatan"
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(20px)'
                      }}
                    />
                    <Bar
                      dataKey="jumlah"
                      fill="url(#barGradient)"
                      radius={[12, 12, 0, 0]}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#51a2ff" />
                        <stop offset="100%" stopColor="#fff" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-3 max-h-48 overflow-y-auto">
                {jabatanChartData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-black to-gray-600 shadow-sm flex-shrink-0"></div>
                      <span className="text-sm font-medium text-black truncate">{entry.jabatan}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-black">{entry.jumlah}</span>
                      <span className="text-xs text-gray-500 ml-1">surat</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie Chart - Status Distribution */}
          <div className="group relative bg-white backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-50"></div>
            <div className="relative p-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-fuchsia-100 animate-bounce rounded-xl shadow-lg">
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  <h3 className="text-lg font-medium text-black ">Distribusi Status</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-gray-100">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={3}
                      dataKey="value"
                      className="drop-shadow-lg"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="hover:opacity-80 transition-opacity duration-200"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(20px)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                {statusChartData.map((entry, index) => (
                  <div key={index} className="flex items-center p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-100 hover:bg-white/80 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center space-x-3 w-full">
                      <div
                        className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-black block truncate">{entry.name}</span>
                        <span className="text-xs text-gray-500">{entry.value} items</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Surat Masuk */}
        <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-white opacity-50"></div>
          <div className="relative">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-black flex items-center ">
                  <div className="p-3 bg-indigo-100 animate-bounce rounded-2xl mr-4 shadow-lg">
                    <FileText className="w-4 h-4 text-black" />
                  </div>
                  Daftar Surat Masuk
                </h2>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 font-medium">
                    Total: <span className="text-black font-semibold">{suratData.length}</span> surat
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase r">
                      Asal Instansi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase r">
                      Tujuan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase r">
                      Perihal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase r">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase r">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase r">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {suratData.map((surat, index) => (
                    <tr key={surat.id} className="group hover:bg-gradient-to-r hover:from-gray-25 hover:to-white transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-sm">
                            <Building2 className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-xs font-semibold text-black">
                              {surat.asal_instansi}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center">
                          <span className="text-xs text-black capitalize font-medium">
                            {surat.tujuan_jabatan?.replace(/-/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs text-black max-w-xs">
                          <p className="line-clamp-2">{surat.perihal || surat.keterangan || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {getStatusBadge(surat.status)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(surat.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setSelectedSurat(surat)}
                            className="group inline-flex items-center px-4 py-2 bg-white hover:bg-gray-100 text-black text-xs font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <Eye className="h-3 w-3 mr-2" />
                            Detail
                          </button>
                          {surat.status === 'processed' && (
                            <button
                              onClick={() => handleDownloadPDF(surat.id, surat.nomor_surat)}
                              disabled={isDownloading}
                              className="group inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-black text-xs font-medium rounded-xl shadow-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                              <Download className="h-3 w-3 mr-2" />
                              {isDownloading ? `${downloadProgress}%` : 'PDF'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {suratData.length === 0 && (
                <div className="text-center py-20">
                  <div className="mx-auto h-24 w-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <FileText className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-light text-black mb-2">Belum ada surat masuk</h3>
                  <p className="text-gray-500 max-w-sm mx-auto">
                    Surat masuk yang baru akan tampil di sini. Pastikan sistem sudah terhubung dengan baik.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detail Surat */}
      {
        selectedSurat && (
          <div className="fixed inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl h-[90vh] overflow-y-auto">
              {/* Background with glass morphism effect */}
              <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20"></div>

              {/* Content */}
              <div className="relative h-full overflow-y-auto rounded-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-gray-100 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-500 rounded-xl">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Detail Surat Masuk</h3>
                        <p className="text-xs text-gray-600">Informasi lengkap dokumen</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedSurat(null)}
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200 group"
                    >
                      <X className="h-5 w-5 text-gray-500 group-hover:text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Content Body */}
                <div className="px-8 py-6">
                  {/* Status Badge */}
                  <div className="mb-8">
                    {getStatusBadge(selectedSurat.status)}
                  </div>

                  {/* Main Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          Nomor Surat
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-500">
                          <p className={`${selectedSurat.nomor_surat ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                            {selectedSurat.nomor_surat || 'akan muncul bila sudah diproses jabatan terkait'}
                          </p>
                        </div>
                      </div>

                      <div className="group">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          Asal Instansi
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-500">
                          <p className="text-gray-900">{selectedSurat.asal_instansi}</p>
                        </div>
                      </div>

                      <div className="group">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          Tujuan Jabatan
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-500">
                          <p className="text-gray-900 capitalize">{selectedSurat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          Perihal
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-500">
                          <p className={`${selectedSurat.perihal ? 'text-gray-900' : 'text-gray-500 italic'}`}>
                            {selectedSurat.perihal || 'akan muncul bila sudah diproses jabatan terkait'}
                          </p>
                        </div>
                      </div>

                      <div className="group">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                          <User className="h-4 w-4 text-gray-500" />
                          Dibuat oleh
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-500">
                          <p className="text-gray-900 font-medium">{selectedSurat.users?.name}</p>
                          <p className="text-xs text-gray-600">({selectedSurat.users?.jabatan})</p>
                        </div>
                      </div>

                      <div className="group">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Tanggal Dibuat
                        </label>
                        <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-gray-500">
                          <p className="text-gray-900">{formatDate(selectedSurat.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 mb-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      Keterangan
                    </label>
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border">
                      <p className="text-gray-900 leading-relaxed">{selectedSurat.keterangan}</p>
                    </div>
                  </div>

                  {/* Processing Information */}
                  {selectedSurat.processed_at && (
                    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 to-gray-50 rounded-xl border border-emerald-200">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        Informasi Pemrosesan
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-600 uppercase ">Diproses oleh</label>
                          <p className="text-gray-900 font-medium">{selectedSurat.processed_user?.name}</p>
                          <p className="text-gray-900">{selectedSurat.processed_user?.jabatan}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600 uppercase ">Waktu Pemrosesan</label>
                          <p className="text-gray-900">{formatDate(selectedSurat.processed_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {(selectedSurat.disposisi_kepada || selectedSurat.catatan) && (
                    <div className="mb-8 space-y-4">
                      {selectedSurat.disposisi_kepada && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <label className="text-xs font-medium text-gray-700 uppercase  mb-1 block">
                            Disposisi Kepada
                          </label>
                          <p className="text-gray-900 font-medium">{selectedSurat.disposisi_kepada}</p>
                        </div>
                      )}

                      {selectedSurat.catatan && (
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                          <label className="text-xs font-medium text-gray-700 uppercase  mb-1 block">
                            Catatan
                          </label>
                          <p className="text-gray-900">{selectedSurat.catatan}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 px-8 py-6">
                  <div className="flex justify-end gap-3">
                    {selectedSurat.status === 'processed' && (
                      <button
                        onClick={() => handleDownloadPDF(selectedSurat.id, selectedSurat.nomor_surat)}
                        disabled={isDownloading}
                        className="inline-flex text-sm items-center gap-2 bg-[#262628] hover:bg-black cursor-pointer text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform"
                      >
                        <Download className="h-4 w-4" />
                        {isDownloading ? `Mengunduh... ${downloadProgress}%` : 'Download PDF'}
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedSurat(null)}
                      className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl font-medium transition-all duration-200"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default SemuaData;