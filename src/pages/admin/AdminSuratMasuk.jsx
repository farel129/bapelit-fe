import { FileText, X, CheckCircle, Eye, Download, Calendar, User, Building2, MessageSquare, Trash2, AlertTriangle, Search, Filter, Loader, Mail, RefreshCcw, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useState } from 'react';
import { useEffect } from 'react';

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

    // Fetch data dari API
    useEffect(() => {
        fetchAllData();
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
            const suratResponse = await api.get('/admin/surat-masuk/all');
            
            // Fetch mapping disposisi untuk mendapatkan disposisi_id
            const disposisiResponse = await api.get('/kepala/disposisi/all');
            
            // Buat mapping surat_id -> disposisi_id
            const disposisiMapping = {};
            disposisiResponse.data?.data?.forEach(disposisi => {
                if (disposisi.surat_masuk?.id) {
                    disposisiMapping[disposisi.surat_masuk.id] = disposisi.id;
                }
            });
            
            // Tambahkan disposisi_id ke data surat
            const suratWithDisposisiId = suratResponse.data?.data?.map(surat => ({
                ...surat,
                disposisi_id: disposisiMapping[surat.id] || null
            })) || [];
            
            setSuratData(suratWithDisposisiId);
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
            pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            processed: 'bg-green-100 text-green-800 border border-green-200'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status === 'pending' ? 'Pending' : status === 'processed' ? 'Diproses' : status}
            </span>
        );
    };

    const handleDownloadPDF = async (suratId, nomorSurat) => {
        setIsDownloading(true);
        setDownloadProgress(0);
        try {
            // Cari disposisi_id dari suratId
            const surat = suratData.find(s => s.id === suratId);
            const disposisiId = surat?.disposisi_id;
            
            if (!disposisiId) {
                toast.error('Disposisi tidak ditemukan untuk surat ini');
                return;
            }
            
            const response = await api.get(`/disposisi/${disposisiId}/pdf`, {
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
            await api.delete(`/admin/surat-masuk/${id}`)
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

    // Calculate statistics
    const totalSurat = suratData.length;
    const belumDibaca = suratData.filter(surat => surat.status === 'belum dibaca').length;
    const sudahDibaca = suratData.filter(surat => surat.status === 'dibaca').length;

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

    // Card disposisi component
    const DisposisiCard = ({ surat }) => (
        <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="p-6">
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-lg">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#2E2A27] truncate max-w-[200px]">{surat.asal_instansi}</h3>
                            <p className="text-xs text-[#6D4C41] capitalize">{surat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        {getStatusBadge(surat.status)}
                        <span className="text-xs text-[#6D4C41] mt-1">{formatDate(surat.created_at)}</span>
                    </div>
                </div>

                {/* Content Card */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-[#6D4C41] mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-[#2E2A27] line-clamp-2">
                            {surat.perihal || surat.keterangan || 'Tidak ada keterangan'}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#6D4C41] flex-shrink-0" />
                        <p className="text-xs text-[#6D4C41] truncate">
                            {surat.users?.name || 'Tidak diketahui'}
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setSelectedSurat(surat)}
                        className="flex-1 bg-white text-black py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                        <Eye className="w-3.5 h-3.5" />
                        Detail
                    </button>

                    {surat.has_disposisi === true && surat.disposisi_id && (
                        <button
                            onClick={() => handleDownloadPDF(surat.id, surat.nomor_surat)}
                            disabled={isDownloading}
                            className="px-3 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] hover:from-[#2E7D32] hover:to-[#1B5E20] text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 border border-[#EDE6E3]"
                        >
                            <Download className="w-3.5 h-3.5" />
                        </button>
                    )}

                    <button
                        onClick={() => openDeleteModal(surat)}
                        className="px-3 bg-gradient-to-br from-[#D9534F] to-[#B52B27] hover:from-[#B52B27] hover:to-[#8B0000] text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 border border-[#EDE6E3]"
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
                <span className="ml-2 text-[#6D4C41]">Memuat surat masuk...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-screen flex flex-col justify-center items-center">
                <AlertCircle className='w-13 h-13 text-red-400' />
                <p className='font-bold text-lg text-red-400'>Error</p>
                <p className='text-gray-500 mt-1 flex items-center gap-x-2'> <AlertCircle className='w-4 h-4' /> server bermasalah</p>
                <button
                    onClick={fetchAllData}
                    className="bg-white mt-3 hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
                >
                    <RefreshCcw className='w-4 h-4 text-[#2E2A27]' />
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
                    title="Sudah Dibaca"
                    count={sudahDibaca}
                    icon={CheckCircle}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
                    borderColor="border-[#EDE6E3]"
                />
            </div>

            {/* Search and Filter Section */}
            <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-grow relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-[#6D4C41]" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari berdasarkan instansi, tujuan, perihal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 bg-white shadow-sm border border-[#EDE6E3] rounded-xl text-sm placeholder-[#6D4C41] text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                aria-label="Clear search"
                            >
                                <X className="h-5 w-5 text-[#6D4C41] hover:text-[#2E2A27]" />
                            </button>
                        )}
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Status Filter Dropdown */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Filter className="h-4 w-4 text-[#6D4C41]" />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 shadow-sm border border-[#EDE6E3] rounded-xl text-sm bg-white text-[#2E2A27] appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent transition-all min-w-[140px]"
                            >
                                <option value="all">Semua Status</option>
                                <option value="belum dibaca">Belum dibaca</option>
                                <option value="dibaca">Dibaca</option>
                            </select>
                        </div>
                        
                        {/* Clear Filters Button */}
                        {(searchTerm || statusFilter !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 text-sm font-medium text-[#2E2A27] bg-white border border-[#EDE6E3] rounded-lg hover:bg-[#FDFCFB] transition-all flex items-center gap-1.5 shadow-sm"
                            >
                                <X className="h-4 w-4" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Results Info */}
                <div className="flex items-center justify-between text-sm text-[#6D4C41] px-2 mt-4">
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

            {filteredData.length === 0 && suratData.length > 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                    <p className="text-[#2E2A27] text-lg">Tidak ada hasil yang cocok</p>
                    <button
                        onClick={clearFilters}
                        className="text-[#6D4C41] hover:text-[#2E2A27] font-medium text-sm mt-2"
                    >
                        Reset semua filter
                    </button>
                </div>
            ) : suratData.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                    <p className="text-[#2E2A27] text-lg">Tidak ada surat masuk</p>
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
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden border-2 border-[#EDE6E3]">
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold" style={{color: '#2E2A27'}}>Konfirmasi Hapus</h3>
                                    <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Tindakan ini tidak dapat dibatalkan</p>
                                </div>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="px-6 pb-2">
                            <div className="bg-[#FDFCFB] rounded-xl p-4 mb-4 border border-[#EDE6E3]">
                                <p className="text-sm font-medium" style={{color: '#6D4C41'}} mb-3>
                                    Apakah Anda yakin ingin menghapus surat dari:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="w-4 h-4 text-[#6D4C41]" />
                                        <span className="font-semibold text-[#2E2A27]">
                                            {deleteModal.suratInfo?.asal_instansi}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-[#6D4C41]" />
                                        <span className="text-[#2E2A27] capitalize">
                                            {deleteModal.suratInfo?.tujuan_jabatan?.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-[#6D4C41]" />
                                        <span className="text-[#2E2A27]">
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
                                className="px-4 py-2.5 text-sm font-semibold text-[#2E2A27] bg-white shadow-sm rounded-xl hover:bg-[#FDFCFB] transition-all border border-[#EDE6E3]"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmDelete(deleteModal.suratId)}
                                className="px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-br from-[#D9534F] to-[#B52B27] hover:from-[#B52B27] hover:to-[#8B0000] rounded-xl transition-all shadow-sm hover:shadow-md border border-[#EDE6E3]"
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
                        <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#EDE6E3]"></div>
                        {/* Content */}
                        <div className="relative h-full overflow-y-auto rounded-2xl">
                            {/* Header */}
                            <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-[#EDE6E3] px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold" style={{color: '#2E2A27'}}>Detail Surat Masuk</h3>
                                            <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Informasi lengkap dokumen</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSurat(null)}
                                        className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-all duration-200 group border border-[#EDE6E3]"
                                    >
                                        <X className="h-5 w-5 text-[#6D4C41] group-hover:text-[#2E2A27]" />
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
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                                                <FileText className="h-4 w-4 text-[#6D4C41]" />
                                                Nomor Surat
                                            </label>
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border-l-4 border-[#D4A373] border">
                                                <p className={`${selectedSurat.nomor_surat ? 'text-[#2E2A27]' : 'text-[#6D4C41] italic'}`}>
                                                    {selectedSurat.nomor_surat || 'akan muncul bila sudah diproses jabatan terkait'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                                                <Building2 className="h-4 w-4 text-[#6D4C41]" />
                                                Asal Instansi
                                            </label>
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border-l-4 border-[#D4A373] border">
                                                <p className="text-[#2E2A27]">{selectedSurat.asal_instansi}</p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                                                <User className="h-4 w-4 text-[#6D4C41]" />
                                                Tujuan Jabatan
                                            </label>
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border-l-4 border-[#D4A373] border">
                                                <p className="text-[#2E2A27] capitalize">{selectedSurat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                                                <MessageSquare className="h-4 w-4 text-[#6D4C41]" />
                                                Perihal
                                            </label>
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border-l-4 border-[#D4A373] border">
                                                <p className={`${selectedSurat.perihal ? 'text-[#2E2A27]' : 'text-[#6D4C41] italic'}`}>
                                                    {selectedSurat.perihal || 'akan muncul bila sudah diproses jabatan terkait'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                                                <User className="h-4 w-4 text-[#6D4C41]" />
                                                Dibuat oleh
                                            </label>
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border-l-4 border-[#D4A373] border">
                                                <p className="text-[#2E2A27] font-semibold">{selectedSurat.users?.name}</p>
                                                <p className="text-sm" style={{color: '#6D4C41'}}>({selectedSurat.users?.jabatan})</p>
                                            </div>
                                        </div>
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                                                <Calendar className="h-4 w-4 text-[#6D4C41]" />
                                                Tanggal Dibuat
                                            </label>
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border-l-4 border-[#D4A373] border">
                                                <p className="text-[#2E2A27]">{formatDate(selectedSurat.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Description */}
                                <div className="mb-8">
                                    <label className="flex items-center gap-2 text-sm font-semibold mb-3" style={{color: '#6D4C41'}}>
                                        <FileText className="h-4 w-4 text-[#6D4C41]" />
                                        Keterangan
                                    </label>
                                    <div className="p-6 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3]">
                                        <p className="text-[#2E2A27] leading-relaxed">{selectedSurat.keterangan}</p>
                                    </div>
                                </div>
                                {/* Processing Information */}
                                {selectedSurat.processed_at && (
                                    <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-[#FDFCFB] rounded-xl border border-green-200">
                                        <h4 className="font-bold mb-4 flex items-center gap-2" style={{color: '#2E2A27'}}>
                                            <CheckCircle className="h-5 w-5 text-[#4CAF50]" />
                                            Informasi Pemrosesan
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block" style={{color: '#6D4C41'}}>Diproses oleh</label>
                                                <p className="text-[#2E2A27] font-semibold">{selectedSurat.processed_user?.name}</p>
                                                <p className="text-sm" style={{color: '#6D4C41'}}>{selectedSurat.processed_user?.jabatan}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block" style={{color: '#6D4C41'}}>Waktu Pemrosesan</label>
                                                <p className="text-[#2E2A27]">{formatDate(selectedSurat.processed_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Additional Information */}
                                {(selectedSurat.disposisi_kepada || selectedSurat.catatan) && (
                                    <div className="mb-8 space-y-4">
                                        {selectedSurat.disposisi_kepada && (
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3]">
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block" style={{color: '#6D4C41'}}>
                                                    Disposisi Kepada
                                                </label>
                                                <p className="text-[#2E2A27] font-semibold">{selectedSurat.disposisi_kepada}</p>
                                            </div>
                                        )}
                                        {selectedSurat.catatan && (
                                            <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3]">
                                                <label className="text-sm font-semibold uppercase tracking-wide mb-1 block" style={{color: '#6D4C41'}}>
                                                    Catatan
                                                </label>
                                                <p className="text-[#2E2A27]">{selectedSurat.catatan}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#EDE6E3] px-8 py-6">
                                <div className="flex justify-end gap-3">
                                    {selectedSurat.has_disposisi === true && selectedSurat.disposisi_id && (
                                        <button
                                            onClick={() => handleDownloadPDF(selectedSurat.id, selectedSurat.nomor_surat)}
                                            disabled={isDownloading}
                                            className="inline-flex text-sm items-center gap-2 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] hover:from-[#2E7D32] hover:to-[#1B5E20] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed border border-[#EDE6E3]"
                                        >
                                            <Download className="h-4 w-4" />
                                            {isDownloading ? `Mengunduh... ${downloadProgress}%` : 'Download PDF'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedSurat(null)}
                                        className="inline-flex items-center gap-2 bg-white hover:bg-[#FDFCFB] text-[#2E2A27] hover:text-[#2E2A27] px-6 py-3 rounded-xl font-semibold transition-all border border-[#EDE6E3] shadow-sm hover:shadow-md"
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
export default AdminSuratMasuk