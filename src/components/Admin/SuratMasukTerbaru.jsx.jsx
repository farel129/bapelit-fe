import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, X, CheckCircle, Download, Calendar, User, Building2, MessageSquare, Trash2, AlertTriangle, RefreshCcw, ChevronRightCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';

const SuratMasukTerbaru = () => {
    const [suratData, setSuratData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSurat, setSelectedSurat] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, suratId: null, suratInfo: null });

    const navigate = useNavigate();

    // Fetch data dari API
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');
            const suratResponse = await api.get('/surat-masuk');
            setSuratData(suratResponse.data?.data || []);
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

    // 🔥 WARNA BARU: Sesuai palet dari StatsSuratMasuk
    const getStatusBadge = (status) => {
        const styles = {
            // Belum Dibaca → HITAM (kontras tinggi, urgensi)
            pending: 'bg-black text-white border-2 border-gray-700',
            // Sudah Dibaca → teal BRAND (progress, selesai)
            processed: 'bg-black text-white border-2 border-teal-600'
        };
        return (
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${styles[status] || 'bg-gray-50 text-black border border-slate-200'}`}>
                {status === 'pending' ? 'belum dibaca' : status === 'processed' ? 'sudah dibaca' : status}
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

    // Batasi data yang ditampilkan hanya 5 item pertama
    const displayedSuratData = suratData.slice(0, 5);

    if (loading) {
        return (
            <div className="flex flex-col gap-y-2 items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400"></div>
                <span className="ml-2 text-black">Memuat surat masuk...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center py-12">
                <AlertCircle className='w-12 h-12 text-red-500' />
                <p className='font-bold text-lg text-red-500'>Error</p>
                <p className='text-black mt-1 flex items-center gap-x-2'>
                    <AlertCircle className='w-4 h-4' /> server bermasalah
                </p>
                <button
                    onClick={fetchAllData}
                    className="bg-gradient-to-br from-white/95 via-gray-50/90 to-gray-100/60 hover:bg-gray-50 border-2 border-gray-200 mt-3 text-sm font-semibold text-black shadow-lg py-3 px-6 rounded-xl items-center flex gap-x-2 transition-colors hover:border-gray-300"
                >
                    <RefreshCcw className='w-4 h-4' />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex w-full">
            {/* 🎨 Background & Card Utama - Gunakan palet baru yang lebih modern */}
            <div className="bg-gradient-to-br w-full from-white/95 via-gray-50/90 to-gray-100/60 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-gray-200 shadow-lg">
                <div className="flex items-center space-x-1 p-5">
                    <div className="w-1 h-5 bg-teal-400 rounded-full shadow-sm"></div>
                    <h3 className="text-lg font-semibold text-black tracking-tight">Surat masuk terbaru</h3>
                </div>

                {/* Tabel Surat Masuk */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gradient-to-br from-gray-50/95 to-gray-100/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                    Asal Instansi
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                    Tujuan
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-black uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {displayedSuratData.map((surat, index) => (
                                <tr key={surat.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl flex items-center justify-center shadow-sm">
                                                <Building2 className="h-5 w-5 text-black" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center text-sm font-semibold text-black">
                                                    {surat.asal_instansi}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center">
                                            <span className="text-sm text-black capitalize font-medium">
                                                {surat.tujuan_jabatan?.replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3 truncate bg-white">
                                        {getStatusBadge(surat.status)}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center text-sm text-black">
                                            {formatDate(surat.created_at)}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Detail Button - teal Brand */}
                                            <button
                                                onClick={() => setSelectedSurat(surat)}
                                                className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 gap-x-1 text-sm font-semibold text-teal-400 bg-white rounded-xl shadow-lg transition-all"
                                                title="Lihat Detail"
                                            >
                                                <FileText className="h-3 w-3" />
                                                Detail
                                            </button>

                                            {/* Hapus Button - Tetap Merah karena tindakan permanen */}
                                            <button
                                                onClick={() => openDeleteModal(surat)}
                                                className="inline-flex cursor-pointer hover:-translate-y-0.5 duration-300 items-center px-3 py-2 gap-x-1 text-sm font-semibold text-black bg-white rounded-xl shadow-lg transition-all"
                                                title="Hapus"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Tombol navigasi jika jumlah surat lebih dari 5 */}
                    {suratData.length > 5 && (
                        <div className="px-6 py-6 flex justify-center bg-white border-t-2 border-gray-200">
                            <button
                                onClick={() => navigate('/admin-daftar-surat-masuk')}
                                className="inline-flex gap-x-2 items-center px-6 py-3 bg-black cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl text-white text-sm font-semibold rounded-xl transform hover:-translate-y-1"
                            >
                                Lihat Semua
                                <ChevronRightCircle className='w-4 h-4' />
                            </button>
                        </div>
                    )}

                    {suratData.length === 0 && (
                        <div className="text-center py-16 bg-white">
                            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-gray-100/50 to-gray-200/20 rounded-2xl flex items-center justify-center mb-6 border-2 border-gray-200 shadow-sm">
                                <FileText className="h-12 w-12 text-black" />
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">Belum ada surat masuk</h3>
                            <p className="text-black max-w-sm mx-auto font-medium">
                                Surat masuk yang baru akan tampil di sini. Pastikan sistem sudah terhubung dengan baik.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white backdrop-blur-sm rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border-2 border-gray-200">
                        {/* Header */}
                        <div className="p-6 pb-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-gray-200">
                                    <AlertTriangle className="w-6 h-6 text-teal-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-black">Konfirmasi Hapus</h3>
                                    <p className="text-sm text-black font-medium mt-1">
                                        Tindakan ini tidak dapat dibatalkan
                                    </p>
                                </div>
                            </div>
                        </div>
                        {/* Content */}
                        <div className="px-6 pb-2">
                            <div className="mb-4">
                                <p className="text-sm text-black font-medium mb-3">
                                    Apakah Anda yakin ingin menghapus surat dari:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Building2 className="w-4 h-4 text-black" />
                                        <span className="font-semibold text-black">
                                            {deleteModal.suratInfo?.asal_instansi}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-black" />
                                        <span className="text-black font-medium capitalize">
                                            {deleteModal.suratInfo?.tujuan_jabatan?.replace(/-/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4 text-black" />
                                        <span className="text-black font-medium">
                                            {formatDate(deleteModal.suratInfo?.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="px-6 py-4 flex gap-3 justify-end bg-white">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2.5 text-sm font-semibold text-black bg-gradient-to-br from-white/95 to-gray-50/80 hover:bg-gray-50 shadow-md border-2 border-gray-200 rounded-xl transition-all hover:border-gray-300"
                            >
                                Batal
                            </button>
                            <button
                                onClick={() => handleConfirmDelete(deleteModal.suratId)}
                                className="px-4 py-2.5 text-sm font-semibold shadow-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-red-400 rounded-xl transition-all transform hover:scale-105"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Detail Surat */}
            {selectedSurat && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
                    <div className="relative w-full max-w-2xl h-[90vh] overflow-y-auto">
                        {/* Background with elegant theme */}
                        <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border-2 border-gray-200"></div>

                        {/* Content */}
                        <div className="relative h-full overflow-y-auto rounded-2xl">
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white rounded-xl shadow-md">
                                            <FileText className="h-6 w-6 text-teal-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-black">Detail Surat Masuk</h3>
                                            <p className="text-sm text-black font-medium">Informasi lengkap dokumen</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedSurat(null)}
                                        className="p-2.5 hover:bg-gradient-to-br hover:from-gray-50/80 hover:to-gray-100/30 rounded-xl transition-all duration-200 group border-2 border-transparent hover:border-gray-200"
                                    >
                                        <X className="h-5 w-5 text-black group-hover:text-black" />
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
                                            <label className="flex items-center gap-2 text-sm font-bold text-black mb-3">
                                                <FileText className="h-4 w-4 text-black" />
                                                Nomor Surat
                                            </label>
                                            <div className="p-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl ">
                                                <p className={`${selectedSurat.nomor_surat ? 'text-black font-semibold' : 'text-black italic font-medium'}`}>
                                                    {selectedSurat.nomor_surat || 'akan muncul bila sudah diproses jabatan terkait'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-black mb-3">
                                                <Building2 className="h-4 w-4 text-black" />
                                                Asal Instansi
                                            </label>
                                            <div className="p-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl ">
                                                <p className="text-black font-semibold">{selectedSurat.asal_instansi}</p>
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-black mb-3">
                                                <User className="h-4 w-4 text-black" />
                                                Tujuan Jabatan
                                            </label>
                                            <div className="p-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl ">
                                                <p className="text-black font-semibold capitalize">{selectedSurat.tujuan_jabatan?.replace(/-/g, ' ')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="group">
                                            <label className="flex items-center gap-2 text-sm font-bold text-black mb-3">
                                                <Calendar className="h-4 w-4 text-black" />
                                                Tanggal Dibuat
                                            </label>
                                            <div className="p-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl ">
                                                <p className="text-black font-semibold">{formatDate(selectedSurat.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-4">
                                    <label className="flex items-center gap-2 text-sm font-bold text-black mb-3">
                                        <FileText className="h-4 w-4 text-black" />
                                        Keterangan
                                    </label>
                                    <div className="p-6 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl border-2 border-gray-200 shadow-md">
                                        <p className="text-black leading-relaxed font-medium">{selectedSurat.keterangan}</p>
                                    </div>
                                </div>

                                {/* Processing Information */}
                                {selectedSurat.processed_at && (
                                    <div className="mb-8 p-6 bg-gradient-to-r from-teal-50 to-gray-50 rounded-xl border-2 border-teal-200 shadow-md">
                                        <h4 className="font-bold text-black mb-4 flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-teal-400" />
                                            Informasi Pemrosesan
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-bold text-black uppercase tracking-wide">Diproses oleh</label>
                                                <p className="text-black font-bold">{selectedSurat.processed_user?.name}</p>
                                                <p className="text-sm text-black font-medium">{selectedSurat.processed_user?.jabatan}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-black uppercase tracking-wide">Waktu Pemrosesan</label>
                                                <p className="text-black font-semibold">{formatDate(selectedSurat.processed_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Additional Information */}
                                {(selectedSurat.disposisi_kepada || selectedSurat.catatan) && (
                                    <div className="mb-8 space-y-4">
                                        {selectedSurat.disposisi_kepada && (
                                            <div className="p-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl border-2 border-gray-200 shadow-sm">
                                                <label className="text-sm font-bold text-black uppercase tracking-wide mb-1 block">
                                                    Disposisi Kepada
                                                </label>
                                                <p className="text-black font-bold">{selectedSurat.disposisi_kepada}</p>
                                            </div>
                                        )}

                                        {selectedSurat.catatan && (
                                            <div className="p-4 bg-gradient-to-br from-gray-50/80 to-gray-100/40 rounded-xl border-2 border-gray-200 shadow-sm">
                                                <label className="text-sm font-bold text-black uppercase tracking-wide mb-1 block">
                                                    Catatan
                                                </label>
                                                <p className="text-black font-medium">{selectedSurat.catatan}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-gradient-to-br from-white/95 via-gray-50/85 to-gray-100/50 backdrop-blur-sm border-t-2 border-gray-200 px-8 py-6">
                                <div className="flex justify-end gap-3">
                                    {selectedSurat.status === 'processed' && (
                                        <button
                                            onClick={() => handleDownloadPDF(selectedSurat.id, selectedSurat.nomor_surat)}
                                            disabled={isDownloading}
                                            className="inline-flex text-sm items-center gap-2 bg-gradient-to-r from-teal-400 to-[#d11b8c] hover:from-[#d11b8c] hover:to-[#b01271] cursor-pointer text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 border-2 border-teal-400"
                                        >
                                            <Download className="h-4 w-4" />
                                            {isDownloading ? `Mengunduh... ${downloadProgress}%` : 'Download PDF'}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedSurat(null)}
                                        className="inline-flex items-center gap-2 bg-gradient-to-br from-white/95 to-gray-50/80 hover:bg-gray-50 text-black hover:text-black px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg"
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
    );
};

export default SuratMasukTerbaru;