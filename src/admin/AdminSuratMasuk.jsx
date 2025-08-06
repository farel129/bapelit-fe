import React, { useState, useEffect } from 'react';
import { FileText, X, CheckCircle, Eye, Download, Calendar, User, Building2, MessageSquare, Trash2, AlertTriangle, Search, Filter, Loader, Mail, RefreshCcw, Cigarette, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import Admin from '../assets/img/admindaftarsurat.png';

const AdminSuratMasuk = () => {
    const [suratData, setSuratData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSurat, setSelectedSurat] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, suratId: null, suratInfo: null });
    // State untuk pencarian dan filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dashboardData, setDashboardData] = useState(null);

    // Fetch data dari API
    useEffect(() => {
        fetchAllData();
        fetchDashboardData();
    }, []);

    // Effect untuk filtering dan searching
    useEffect(() => {
        let filtered = suratData;
        // Filter berdasarkan status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(surat => surat.status === statusFilter);
        }
        // Filter berdasarkan pencarian
        if (searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(surat =>
                surat.asal_instansi?.toLowerCase().includes(searchLower) ||
                surat.tujuan_jabatan?.toLowerCase().includes(searchLower) ||
                surat.perihal?.toLowerCase().includes(searchLower) ||
                surat.nomor_surat?.toLowerCase().includes(searchLower) ||
                surat.users?.name?.toLowerCase().includes(searchLower) ||
                surat.keterangan?.toLowerCase().includes(searchLower)
            );
        }
        setFilteredData(filtered);
    }, [suratData, searchTerm, statusFilter]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');
            // Fetch semua surat masuk menggunakan axios
            const suratResponse = await api.get('/surat-masuk/all');
            setSuratData(suratResponse.data?.data || []);
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

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard')
            setDashboardData(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

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
            pending: 'bg-gray-100 text-gray-800',
            processed: 'bg-green-100 text-gray-800' // Changed for better visual distinction
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status === 'pending' ? 'Pending' : status === 'processed' ? 'Diproses' : status}
            </span>
        );
    };

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

    const openDeleteModal = (surat) => {
        setDeleteModal({
            isOpen: true,
            suratId: surat.id,
            suratInfo: {
                asal_instansi: surat.asal_instansi,
                tujuan_jabatan: surat.tujuan_jabatan,
                created_at: surat.created_at
            }
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, suratId: null, suratInfo: null });
    };

    const handleConfirmDelete = async (id) => {
        try {
            await api.delete(`/surat/${id}`)
            toast.success('Surat berhasil dihapus')
            closeDeleteModal() // Tutup modal terlebih dahulu
            fetchAllData() // Refresh data surat
        } catch (error) {
            console.error('Delete error:', error)
            // Error handling yang lebih spesifik
            if (error.response) {
                const errorMessage = error.response.data?.error || error.response.data?.message || 'Gagal menghapus surat';
                toast.error(errorMessage);
            } else if (error.request) {
                toast.error('Tidak ada respon dari server');
            } else {
                toast.error('Terjadi kesalahan saat menghapus surat');
            }
        }
    }

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center space-y-2 min-h-screen">
                <Loader className=' animate-spin w-8 h-8' />
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
            <div className="bg-white rounded-2xl mb-6">
                <div className="flex justify-between bg-gradient-to-tl from-gray-50 via-white to-gray-50 shadow-lg border border-black/5 p-5 rounded-2xl mb-6 overflow-hidden">
                    <div className='flex flex-col gap-y-2 '>
                        <h1 className="text-xl font-bold text-[#262628]">Daftar Surat Masuk</h1>
                        <div className='flex relative'>
                            <div className="inline-flex items-center rounded-full justify-center w-10 h-10 bg-gray-300 shadow-lg">
                                <Mail className="w-4 h-4 text-[#262628]" />
                            </div>
                            <div className="inline-flex absolute ml-7 items-center rounded-full justify-center w-10 h-10 bg-[#fff] shadow-lg">
                                <FileText className="w-4 h-4 text-[#262628]" />
                            </div>
                        </div>
                        {/* Enhanced Search and Filter Section */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                            {/* Search Input - Full width on mobile, auto on larger screens */}
                            <div className="flex-grow relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari berdasarkan instansi, tujuan, perihal..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-3 bg-white shadow-sm border border-gray-200 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>

                            {/* Filter Controls - Wrapped in a flex container */}
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Status Filter Dropdown */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Filter className="h-4 w-4 text-gray-500" />
                                    </div>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-3 shadow-sm border border-gray-200 rounded-full text-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-w-[140px]"
                                    >
                                        <option value="all">Semua Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="processed">Diproses</option>
                                    </select>
                                </div>

                                {/* Clear Filters Button */}
                                {(searchTerm || statusFilter !== 'all') && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        <X className="h-4 w-4" />
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Info */}
                        <div className="flex items-center justify-between text-sm text-gray-600 px-2">
                            <span>
                                Menampilkan {filteredData.length} dari {suratData.length} surat
                                {searchTerm && (
                                    <span className="ml-1">
                                        untuk pencarian "{searchTerm}"
                                    </span>
                                )}
                                {statusFilter !== 'all' && (
                                    <span className="ml-1">
                                        dengan status {statusFilter === 'pending' ? 'pending' : 'diproses'}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <div className='flex gap-x-3'>
                        <div className='w-50 h-full relative flex items-center'>
                            <div className='w-50 h-50 bg-white absolute rounded-full border-40 border-gray-100'></div>
                            <div className='w-10 self-start h-10 bg-[#999999] absolute rounded-full animate-bounce flex justify-center items-center'><FileText className='text-white w-6 h-6' /></div>
                            <img src={Admin} alt="" className='z-10 absolute object-cover top-0 h-60 -scale-x-100' />
                        </div>
                    </div>
                </div>

                {/* Tabel Surat Masuk */}
                <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-black/5">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-white">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Asal Instansi
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tujuan
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {filteredData.map((surat, index) => (
                                <tr key={surat.id} className="hover:bg-gray-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-white shadow-lg border border-black/5 rounded-xl flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center text-xs font-semibold text-gray-900">
                                                    {surat.asal_instansi}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center">
                                            <span className="text-xs text-gray-900 capitalize font-medium">
                                                {surat.tujuan_jabatan?.replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        {getStatusBadge(surat.status)}
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center text-xs text-gray-500">
                                            {formatDate(surat.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedSurat(surat)}
                                                className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 text-xs font-medium text-gray-700 bg-white shadow-sm border border-gray-200 rounded-lg transition-all hover:bg-gray-50"
                                            >
                                                <Eye className="h-3 w-3 mr-1.5" />
                                                Detail
                                            </button>
                                            {surat.status === 'processed' && (
                                                <button
                                                    onClick={() => handleDownloadPDF(surat.id, surat.nomor_surat)}
                                                    disabled={isDownloading}
                                                    className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 text-xs font-medium text-emerald-700 bg-white shadow-sm border border-gray-200 rounded-lg transition-all hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <Download className="h-3 w-3 mr-1.5" />
                                                    {isDownloading ? `${downloadProgress}%` : 'PDF'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openDeleteModal(surat)}
                                                className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 text-xs font-medium text-red-600 bg-white shadow-sm border border-gray-200 rounded-lg hover:text-red-800 hover:bg-red-50 transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1.5" />
                                                hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredData.length === 0 && suratData.length > 0 && (
                        <div className="text-center py-16">
                            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Search className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada hasil yang cocok</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-4">
                                Coba ubah kata kunci pencarian atau filter status untuk menemukan surat yang Anda cari.
                            </p>
                            <button
                                onClick={clearFilters}
                                className="text-gray-600 hover:text-gray-700 font-medium text-sm"
                            >
                                Reset semua filter
                            </button>
                        </div>
                    )}
                    {suratData.length === 0 && (
                        <div className="text-center py-16">
                            <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FileText className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada surat masuk</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                Surat masuk yang baru akan tampil di sini. Pastikan sistem sudah terhubung dengan baik.
                            </p>
                        </div>
                    )}
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="px-6 pb-2">
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-gray-700 mb-3">
                                    Apakah Anda yakin ingin menghapus surat dari:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium text-gray-900">
                                            {deleteModal.suratInfo?.asal_instansi}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700 capitalize">
                                            {deleteModal.suratInfo?.tujuan_jabatan?.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700">
                                            {formatDate(deleteModal.suratInfo?.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-4 flex gap-3 justify-end">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white shadow-sm rounded-lg hover:bg-gray-50 transition-all border border-gray-200"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmDelete(deleteModal.suratId)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-700 rounded-lg transition-all shadow-sm"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
                                            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
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
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Diproses oleh</label>
                                                    <p className="text-gray-900 font-medium">{selectedSurat.processed_user?.name}</p>
                                                    <p className="text-gray-900">{selectedSurat.processed_user?.jabatan}</p>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Waktu Pemrosesan</label>
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
                                                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1 block">
                                                        Disposisi Kepada
                                                    </label>
                                                    <p className="text-gray-900 font-medium">{selectedSurat.disposisi_kepada}</p>
                                                </div>
                                            )}
                                            {selectedSurat.catatan && (
                                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                                    <label className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1 block">
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
                                                className="inline-flex text-sm items-center gap-2 bg-[#262628] hover:bg-black cursor-pointer text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Download className="h-4 w-4" />
                                                {isDownloading ? `Mengunduh... ${downloadProgress}%` : 'Download PDF'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedSurat(null)}
                                            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 px-6 py-3 rounded-xl font-medium transition-all"
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

export default AdminSuratMasuk;