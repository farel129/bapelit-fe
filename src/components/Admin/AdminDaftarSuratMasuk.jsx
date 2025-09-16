import { FileText, X, CheckCircle, Eye, Download, Calendar, User, Building2, MessageSquare, Trash2, AlertTriangle, Search, Filter, Loader, Mail, RefreshCcw, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useState } from 'react';
import { useEffect } from 'react';
import LoadingSpinner from '../Ui/LoadingSpinner';
import StatCard from '../Ui/StatCard';

const AdminDaftarSuratMasuk = () => {
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

    // Fetch data dari API
    useEffect(() => {
        fetchAllData();
    }, []);

    // Effect untuk filtering dan searching
    useEffect(() => {
        let filtered = suratData;
        if (statusFilter !== 'all') {
            filtered = filtered.filter(surat => surat.status === statusFilter);
        }
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
            const suratResponse = await api.get('/surat-masuk');
            const disposisiResponse = await api.get('/disposisi/kepala');
            
            const disposisiMapping = {};
            disposisiResponse.data?.data?.forEach(disposisi => {
                if (disposisi.surat_masuk?.id) {
                    disposisiMapping[disposisi.surat_masuk.id] = disposisi.id;
                }
            });
            
            const suratWithDisposisiId = suratResponse.data?.data?.map(surat => ({
                ...surat,
                disposisi_id: disposisiMapping[surat.id] || null
            })) || [];
            
            setSuratData(suratWithDisposisiId);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.response) {
                const errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
                setError(errorMessage);
                toast.error(errorMessage);
            } else if (err.request) {
                setError('Tidak ada respon dari server. Pastikan server backend berjalan.');
                toast.error('Tidak ada respon dari server');
            } else {
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
            'belum dibaca': 'bg-slate-100 text-black',
            'sudah dibaca': 'bg-slate-100 text-green-500'
        };
        return (
            <span className={`px-2 py-1 rounded-lg text-xs ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status === 'belum dibaca' ? 'Belum Dibaca' : status === 'sudah dibaca' ? 'Sudah Dibaca' : status}
            </span>
        );
    };

    const handleDownloadPDF = async (suratId, nomorSurat) => {
        setIsDownloading(true);
        setDownloadProgress(0);
        try {
            const surat = suratData.find(s => s.id === suratId);
            const disposisiId = surat?.disposisi_id;
            
            if (!disposisiId) {
                toast.error('Disposisi tidak ditemukan untuk surat ini');
                return;
            }
            
            const response = await api.get(`/disposisi/download-pdf/${disposisiId}`, {
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
            await api.delete(`/surat-masuk/${id}`);
            toast.success('Surat berhasil dihapus');
            closeDeleteModal();
            fetchAllData();
        } catch (error) {
            console.error('Delete error:', error);
            if (error.response) {
                const errorMessage = error.response.data?.error || error.response.data?.message || 'Gagal menghapus surat';
                toast.error(errorMessage);
            } else if (error.request) {
                toast.error('Tidak ada respon dari server');
            } else {
                toast.error('Terjadi kesalahan saat menghapus surat');
            }
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    // Calculate statistics
    const totalSurat = suratData.length;
    const belumDibaca = suratData.filter(surat => surat.status === 'belum dibaca').length;
    const sudahDibaca = suratData.filter(surat => surat.status === 'sudah dibaca').length;

    const DisposisiCard = ({ surat }) => (
        <div className="bg-white rounded-2xl shadow-lg transition-all duration-300 overflow-hidden">
            <div className="p-4">
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white shadow-lg rounded-xl">
                            <FileText className="h-5 w-5 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#000000] truncate max-w-[170px]">{surat.asal_instansi}</h3>
                            <p className="text-xs text-[#000000] capitalize">{surat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {getStatusBadge(surat.status)}
                        <span className="text-xs text-[#000000] mt-1">{formatDate(surat.created_at)}</span>
                    </div>
                </div>

                {/* Content Card */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-[#000000] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#000000] truncate max-w-[170px]">
                            {surat.perihal || surat.keterangan || 'Tidak ada keterangan'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedSurat(surat)}
                        className="flex-1 bg-white text-[#000000] py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 border border-[#e5e7eb]"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                    </button>

                    {surat.has_disposisi === true && surat.disposisi_id && (
                        <button
                            onClick={() => handleDownloadPDF(surat.id, surat.nomor_surat)}
                            disabled={isDownloading}
                            className="px-3 bg-white text-green-500 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 border border-slate-200"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    )}

                    <button
                        onClick={() => openDeleteModal(surat)}
                        className="px-3 bg-white text-red-500 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col justify-center items-center">
                <AlertCircle className='w-13 h-13 text-[#000000]' />
                <p className='font-bold text-lg text-[#000000]'>Error</p>
                <p className='text-[#000000] mt-1 flex items-center gap-x-2'> 
                    <AlertCircle className='w-4 h-4' /> 
                    server bermasalah
                </p>
                <button
                    onClick={fetchAllData}
                    className="bg-white mt-3 hover:bg-[#f9f9f9] border-2 border-[#e5e7eb] gap-x-2 flex items-center text-[#000000] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#f6339a]"
                >
                    <RefreshCcw className='w-4 h-4 text-[#000000]' />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className='min-h-screen'>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <StatCard
                    title="Total Surat"
                    count={totalSurat}
                    icon={Mail}
                    bgColor="bg-white"
                    textColor="text-black"
                    iconBg="bg-white"
                    iconColor="text-teal-400"
                    borderColor="border-slate-200"
                />
                <StatCard
                    title="Belum Dibaca"
                    count={belumDibaca}
                    icon={Clock}
                    bgColor="bg-white"
                    textColor="text-black"
                    iconBg="bg-gray-500"
                    borderColor="border-slate-200"
                    iconColor="text-white"
                />
                <StatCard
                    title="Sudah Dibaca"
                    count={sudahDibaca}
                    icon={CheckCircle}
                    bgColor="bg-black"
                    textColor="text-white"
                    iconBg="bg-white"
                    iconColor="text-black"
                    borderColor="border-slate-200"
                />
            </div>

            {/* Search and Filter Section */}
            <div className="bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f9f9f9] p-6 rounded-2xl border-2 border-[#e5e7eb] shadow-md mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-grow relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#000000]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan instansi, tujuan, perihal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 bg-white shadow-sm border border-[#e5e7eb] rounded-xl text-sm placeholder-[#6b7280] text-[#000000] focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5 text-[#000000] hover:text-[#6b7280]" />
                            </button>
                        )}
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-[#000000]" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 shadow-sm border border-[#e5e7eb] rounded-xl text-sm bg-white text-[#000000] appearance-none focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-all min-w-[140px]"
                            >
                                <option value="all">Semua Status</option>
                                <option value="belum dibaca">Belum Dibaca</option>
                                <option value="sudah dibaca">Sudah Dibaca</option>
                            </select>
                        </div>
                        
                        {/* Clear Filters Button */}
                        {(searchTerm || statusFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 text-sm font-medium text-[#000000] bg-white border border-[#e5e7eb] rounded-lg hover:bg-[#f9f9f9] transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <X className="h-4 w-4 text-[#000000]" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Results Info */}
                <div className="flex items-center justify-between text-sm text-[#000000] px-2 mt-4">
                    <span>
                        Menampilkan {filteredData.length} dari {suratData.length} surat
                        {searchTerm && (
                            <span className="ml-1">
                                untuk pencarian "{searchTerm}"
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span className="ml-1">
                                dengan status {statusFilter === 'belum dibaca' ? 'Belum Dibaca' : 'Sudah Dibaca'}
                            </span>
                        )}
                    </span>
                </div>
            </div>

            {filteredData.length === 0 && suratData.length > 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm">
                    <p className="text-[#000000] text-lg">Tidak ada hasil yang cocok</p>
                    <button
                        onClick={clearFilters}
                        className="text-[#000000] hover:text-[#6b7280] font-medium text-sm mt-2"
                    >
                        Reset semua filter
                    </button>
                </div>
            ) : suratData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm">
                    <p className="text-[#000000] text-lg">Tidak ada surat masuk</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredData.map((surat) => (
                        <DisposisiCard key={surat.id} surat={surat} />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden border-2 border-[#e5e7eb]">
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-[#000000] rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[#000000]">Konfirmasi Hapus</h3>
                                    <p className="text-sm font-medium text-[#000000]">Tindakan ini tidak dapat dibatalkan</p>
                                </div>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="px-6 pb-2">
                            <div className="bg-[#f9f9f9] rounded-xl p-4 mb-4 border border-[#e5e7eb]">
                                <p className="text-sm font-medium text-[#000000] mb-3">
                                    Apakah Anda yakin ingin menghapus surat dari:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="w-4 h-4 text-[#000000]" />
                                        <span className="font-semibold text-[#000000]">
                                            {deleteModal.suratInfo?.asal_instansi}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-[#000000]" />
                                        <span className="text-[#000000] capitalize">
                                            {deleteModal.suratInfo?.tujuan_jabatan?.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-[#000000]" />
                                        <span className="text-[#000000]">
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
                                className="px-4 py-2.5 text-sm font-semibold text-[#000000] bg-white shadow-sm rounded-xl hover:bg-[#f9f9f9] transition-all border border-[#e5e7eb]"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmDelete(deleteModal.suratId)}
                                className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-[#D9534F] to-[#B52B27] hover:from-[#B52B27] hover:to-[#8B0000] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#e5e7eb]"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Surat */}
            {selectedSurat && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl h-[90vh] overflow-y-auto">
                        {/* Background with glass morphism effect */}
                        <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#e5e7eb]"></div>
                        {/* Content */}
                        <div className="relative h-full overflow-y-auto rounded-2xl">
                            {/* Header */}
                            <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-[#e5e7eb] px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-[#f6339a] to-[#e02c88] rounded-xl shadow-md">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-[#000000]">Detail Surat Masuk</h3>
                                            <p className="text-sm font-medium text-[#000000]">Informasi lengkap dokumen</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSurat(null)}
                                        className="p-2 hover:bg-[#f9f9f9] rounded-xl transition-all duration-200 group border border-[#e5e7eb]"
                                    >
                                        <X className="h-5 w-5 text-[#000000] group-hover:text-[#6b7280]" />
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
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                                                <FileText className="h-4 w-4 text-[#000000]" />
                                                Nomor Surat
                                            </label>
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                                                <p className={`${selectedSurat.nomor_surat ? 'text-[#000000]' : 'text-[#6b7280] italic'}`}>
                                                    {selectedSurat.nomor_surat || 'akan muncul bila sudah diproses jabatan terkait'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                                                <Building2 className="h-4 w-4 text-[#000000]" />
                                                Asal Instansi
                                            </label>
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                                                <p className="text-[#000000]">{selectedSurat.asal_instansi}</p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                                                <User className="h-4 w-4 text-[#000000]" />
                                                Tujuan Jabatan
                                            </label>
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                                                <p className="text-[#000000] capitalize">{selectedSurat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                                                <MessageSquare className="h-4 w-4 text-[#000000]" />
                                                Perihal
                                            </label>
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                                                <p className={`${selectedSurat.perihal ? 'text-[#000000]' : 'text-[#6b7280] italic'}`}>
                                                    {selectedSurat.perihal || 'akan muncul bila sudah diproses jabatan terkait'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                                                <User className="h-4 w-4 text-[#000000]" />
                                                Dibuat oleh
                                            </label>
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                                                <p className="text-[#000000] font-semibold">{selectedSurat.users?.name}</p>
                                                <p className="text-sm text-[#6b7280]">({selectedSurat.users?.jabatan})</p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                                                <Calendar className="h-4 w-4 text-[#000000]" />
                                                Tanggal Dibuat
                                            </label>
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                                                <p className="text-[#000000]">{formatDate(selectedSurat.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Description */}
                                <div className="mb-8">
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-[#000000]">
                                        <FileText className="h-4 w-4 text-[#000000]" />
                                        Keterangan
                                    </label>
                                    <div className="p-6 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
                                        <p className="text-[#000000] leading-relaxed">{selectedSurat.keterangan}</p>
                                    </div>
                                </div>
                                {/* Processing Information */}
                                {selectedSurat.processed_at && (
                                    <div className="mb-8 p-6 bg-gradient-to-r from-[#4CAF50]/10 to-[#f9f9f9] rounded-xl border border-[#4CAF50]/20">
                                        <h4 className="font-bold mb-4 flex items-center gap-2 text-[#000000]">
                                            <CheckCircle className="h-5 w-5 text-[#4CAF50]" />
                                            Informasi Pemrosesan
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block text-[#000000]">Diproses oleh</label>
                                                <p className="text-[#000000] font-semibold">{selectedSurat.processed_user?.name}</p>
                                                <p className="text-sm text-[#6b7280]">{selectedSurat.processed_user?.jabatan}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block text-[#000000]">Waktu Pemrosesan</label>
                                                <p className="text-[#000000]">{formatDate(selectedSurat.processed_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Additional Information */}
                                {(selectedSurat.disposisi_kepada || selectedSurat.catatan) && (
                                    <div className="mb-8 space-y-4">
                                        {selectedSurat.disposisi_kepada && (
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block text-[#000000]">
                                                    Disposisi Kepada
                                                </label>
                                                <p className="text-[#000000] font-semibold">{selectedSurat.disposisi_kepada}</p>
                                            </div>
                                        )}
                                        {selectedSurat.catatan && (
                                            <div className="p-4 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block text-[#000000]">
                                                    Catatan
                                                </label>
                                                <p className="text-[#000000]">{selectedSurat.catatan}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#e5e7eb] px-8 py-6">
                                <div className="flex justify-end gap-3">
                                    {selectedSurat.has_disposisi === true && selectedSurat.disposisi_id && (
                                        <button
                                            onClick={() => handleDownloadPDF(selectedSurat.id, selectedSurat.nomor_surat)}
                                            disabled={isDownloading}
                                            className="inline-flex text-sm items-center gap-2 bg-white text-green-500 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-[#e5e7eb]"
                                        >
                                            <Download className="h-4 w-4" />
                                            {isDownloading ? `Mengunduh... ${downloadProgress}%` : 'Download PDF'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedSurat(null)}
                                        className="inline-flex items-center gap-2 bg-white hover:bg-[#f9f9f9] text-[#000000] hover:text-[#000000] px-6 py-3 rounded-xl font-semibold transition-all border border-[#e5e7eb] shadow-sm hover:shadow-md"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminDaftarSuratMasuk