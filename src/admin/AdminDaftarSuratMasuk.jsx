import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Tambahkan useNavigate
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Clock, X, CheckCircle, Eye, Download, Calendar, User, Building2, MessageSquare, Database, Trash2, AlertTriangle, ChevronRightCircle, RefreshCcw, Cigarette, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const AdminDaftarSuratMasuk = () => {
    const [suratData, setSuratData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSurat, setSelectedSurat] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, suratId: null, suratInfo: null });

    // ✅ Inisialisasi navigate
    const navigate = useNavigate();

    // Fetch data dari API
    useEffect(() => {
        fetchAllData(),
            fetchDashboardData();
    }, []);

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
            pending: 'bg-gray-100 text-gray-600',
            processed: 'bg-green-100 text-green-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
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
            closeDeleteModal()
            fetchAllData()
        } catch (error) {
            console.error('Delete error:', error)
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

    // ✅ Batasi data yang ditampilkan hanya 5 item pertama
    const displayedSuratData = suratData.slice(0, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
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
            <div className="bg-white shadow-lg rounded-2xl mb-10">
                <div className="flex items-center space-x-3 mb-3 p-4">
                    <div className="w-2 h-8 bg-gradient-to-b from-[#262628] to-orange-600 rounded-full"></div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Surat Masuk yang Dibuat</h3>
                </div>
                {/* Tabel Surat Masuk */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
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
                            {/* ✅ Gunakan displayedSuratData untuk mapping */}
                            {displayedSuratData.map((surat, index) => (
                                <tr key={surat.id} className=" group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 border border-gray-400 rounded-lg flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-gray-700" />
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
                                                className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 text-xs font-medium text-gray-700 bg-white shadow-lg border border-black/5 rounded-lg transition-all"
                                            >
                                                <Eye className="h-3 w-3 mr-1.5" />
                                                Detail
                                            </button>
                                            {surat.status === 'processed' && (
                                                <button
                                                    onClick={() => handleDownloadPDF(surat.id, surat.nomor_surat)}
                                                    disabled={isDownloading}
                                                    className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 text-xs font-medium text-emerald-700 bg-white shadow-lg border border-black/5 rounded-lg transition-all disabled:opacity-50 "
                                                >
                                                    <Download className="h-3 w-3 mr-1.5" />
                                                    {isDownloading ? `${downloadProgress}%` : 'PDF'}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => openDeleteModal(surat)}
                                                className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 gap-x-1 text-xs font-medium text-red-600 bg-white rounded-lg shadow-lg border-black/5 transition-all "
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* ✅ Tambahkan tombol navigasi jika jumlah surat lebih dari 5 */}
                    {suratData.length > 5 && (
                        <div className="px-6 py-4 flex justify-center">
                            <button
                                onClick={() => navigate('/admin-daftar-surat-masuk')}
                                className="inline-flex gap-x-2 items-center px-4 py-2 bg-white hover:bg-gray-50 cursor-pointer transition-all shadow-lg text-black text-sm font-medium rounded-lg"
                            >
                                Lihat Semua
                                <ChevronRightCircle className='text-black w-4 h-4' />
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
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white shadow-lg rounded-lg hover:bg-gray-50 transition-all"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmDelete(deleteModal.suratId)} // ✅ PERBAIKAN: Teruskan suratId
                                className="px-4 py-2 text-sm font-medium shadow-lg text-white bg-red-500 hover:bg-red-700 rounded-lg transition-all" // ✅ Ganti warna jadi merah untuk delete
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
                                                className="inline-flex text-sm items-center gap-2 bg-[#262628] hover:bg-black cursor-pointer text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform"
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

export default AdminDaftarSuratMasuk;