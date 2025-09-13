import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    FileText,
    Calendar,
    Building,
    User,
    AlertCircle,
    Loader2,
    Download,
    Eye,
    MessageSquare,
    CheckCircle,
    Clock,
    File,
    Image,
    ExternalLink,
    History,
    UserCircle,
    Loader
} from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../../components/Ui/LoadingSpinner';

const KepalaDisposisiDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [disposisi, setDisposisi] = useState(null);
    const [feedback, setFeedback] = useState([]);
    const [statusLogs, setStatusLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFeedback, setLoadingFeedback] = useState(true);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [error, setError] = useState(null);
    const [feedbackError, setFeedbackError] = useState(null);
    const [logsError, setLogsError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchDisposisiDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/disposisi/kepala/${id}`);
            setDisposisi(response.data.data);
        } catch (err) {
            console.error('Error fetching disposisi detail:', err);
            setError(err.response?.data?.error || 'Gagal memuat detail disposisi');
        } finally {
            setLoading(false);
        }
    };

    const fetchStatusLogs = async () => {
        try {
            setLoadingLogs(true);
            setLogsError(null);
            const response = await api.get(`/disposisi/logs/${id}`);
            setStatusLogs(response.data.data || []);
        } catch (err) {
            console.error('Error fetching status logs:', err);
            setLogsError(err.response?.data?.error || 'Gagal memuat riwayat status');
            setStatusLogs([]);
        } finally {
            setLoadingLogs(false);
        }
    };

    const fetchFeedback = async () => {
        try {
            setLoadingFeedback(true);
            setFeedbackError(null);
            const response = await api.get('/feedback-disposisi/kepala');

            const relatedFeedback = response.data.data.filter(feedback => {
                return feedback.disposisi_id === id || feedback.disposisi_id === parseInt(id);
            });

            setFeedback(relatedFeedback);
        } catch (err) {
            console.error('Error fetching feedback:', err);
            setFeedbackError(err.response?.data?.error || 'Gagal memuat feedback');
        } finally {
            setLoadingFeedback(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDisposisiDetail();
            fetchFeedback();
            fetchStatusLogs();
        }
    }, [id]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (fileType, filename) => {
        if (!fileType && !filename) return <File className="h-5 w-5" />;

        const type = fileType?.toLowerCase() || filename?.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) {
            return <Image className="h-5 w-5" />;
        }
        return <File className="h-5 w-5" />;
    };

    const StatusBadge = ({ status }) => {
        const getStatusConfig = (status) => {
            switch (status?.toLowerCase()) {
                case 'diterima':
                case 'dibaca':
                    return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <Eye className="h-3 w-3" /> };
                case 'diproses':
                case 'dalam proses':
                    return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <Clock className="h-3 w-3" /> };
                case 'selesai':
                    return { color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle className="h-3 w-3" /> };
                case 'diteruskan':
                    return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: <ExternalLink className="h-3 w-3" /> };
                case 'baru':
                case 'belum dibaca':
                    return { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="h-3 w-3" /> };
                default:
                    return { color: 'bg-gray-100 text-black border-gray-200', icon: <AlertCircle className="h-3 w-3" /> };
            }
        };

        const config = getStatusConfig(status);

        return (
            <span className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border ${config.color}`}>
                {config.icon}
                {status || 'Unknown'}
            </span>
        );
    };

    const SifatBadge = ({ sifat }) => {
        const getSifatColor = (sifat) => {
            switch (sifat) {
                case 'Sangat Segera': return 'bg-red-500 text-white';
                case 'Segera': return 'bg-orange-500 text-white';
                case 'Biasa': return 'bg-blue-500 text-white';
                case 'Rahasia': return 'bg-purple-500 text-white';
                default: return 'bg-gray-500 text-white';
            }
        };

        return (
            <span className='inline-flex items-center px-4 py-2 bg-white border-pink-400 border text-black rounded-full text-sm font-medium'>
                {sifat}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner text='Memuat detail disposisi' />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-black mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white rounded-3xl shadow-lg p-5">
            <div className="">

                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-black mb-2 flex items-center gap-2">
                                <FileText className="h-6 w-6 text-pink-400" />
                                Detail Disposisi
                            </h1>
                            <div className="flex items-center gap-3">
                                <SifatBadge sifat={disposisi?.sifat} />
                                <StatusBadge status={disposisi?.status} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">

                    <div className="lg:col-span-2 space-y-4">

                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4">
                            <h2 className="text-lg font-semibold text-black mb-4">Informasi Disposisi</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Perihal</label>
                                    <p className="text-black bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {disposisi?.perihal || '-'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Nomor Surat</label>
                                        <p className="text-black">{disposisi?.nomor_surat || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Nomor Agenda</label>
                                        <p className="text-black">{disposisi?.nomor_agenda || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Asal Instansi</label>
                                    <p className="text-black">{disposisi?.asal_instansi || '-'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Surat</label>
                                        <p className="text-black flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-pink-400" />
                                            {formatDateOnly(disposisi?.tanggal_surat)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Diterima Tanggal</label>
                                        <p className="text-black flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-pink-400" />
                                            {formatDateOnly(disposisi?.diterima_tanggal)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Disposisi Kepada</label>
                                    <p className="text-black flex items-center gap-2">
                                        <User className="h-4 w-4 text-pink-400" />
                                        {disposisi?.disposisi_kepada_jabatan || '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Instruksi</label>
                                    <p className="text-black bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {disposisi?.dengan_hormat_harap || '-'}
                                    </p>
                                </div>

                                {disposisi?.catatan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Catatan</label>
                                        <p className="text-black bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            {disposisi.catatan}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {disposisi?.photos && disposisi.photos.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                    <Image className="h-5 w-5 text-pink-400" />
                                    Lampiran Surat ({disposisi.photos.length})
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    {disposisi.photos.map((photo, index) => {
                                        const type = photo.type?.toLowerCase() || photo.filename?.split('.').pop()?.toLowerCase();
                                        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(type);

                                        return (
                                            <div
                                                key={photo.id}
                                                className="cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                                onClick={() => {
                                                    if (isImage) {
                                                        setSelectedImage(photo.url);
                                                    } else {
                                                        // Non-gambar: buka di tab baru
                                                        window.open(photo.url, '_blank', 'noopener,noreferrer');
                                                    }
                                                }}
                                            >
                                                <div className="w-full h-40 bg-white border-slate-200 shadow-lg flex items-center justify-center">
                                                    {isImage ? (
                                                        <img
                                                            src={photo.url}
                                                            alt={`Thumbnail ${index + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/160x160?text=No+Image';
                                                                e.target.className = "w-full h-full object-cover";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="text-pink-400 flex flex-col justify-center items-center">
                                                            <FileText className='w-9 h-9' />
                                                            <p className='font-bold text-lg mt-2 text-center'>File</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="bg-neutral-50 rounded-2xl shadow-lg border border-slate-200 p-4">
                            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                Feedback Disposisi
                            </h2>

                            {loadingFeedback ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner text='Memuat feedback'/>
                                </div>
                            ) : feedbackError ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-red-800 font-medium">Error</p>
                                    </div>
                                    <p className="text-red-700 text-sm mt-1">{feedbackError}</p>
                                </div>
                            ) : feedback.length === 0 ? (
                                <div className="text-center py-8">
                                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Belum ada feedback untuk disposisi ini</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {feedback.map((item) => (
                                        <div key={item.id} className="">

                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-medium text-black">{item.user_name || 'Unknown'}</p>
                                                    <p className="font-medium text-gray-600 text-sm">{item.user_jabatan || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-black bg-white p-3 rounded-lg border border-gray-200">
                                                    {item.notes || 'Tidak ada catatan'}
                                                </p>
                                            </div>

                                            {item.files && item.files.length > 0 && (
                                                <div className="mt-4">
                                                    <label className="block text-xs font-medium text-gray-600 mb-3">
                                                        Lampiran ({item.files.length})
                                                    </label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                        {item.files.map((file) => {
                                                            // ✅ Bersihkan spasi di URL (solusi cepat & aman)
                                                            const cleanUrl = file.url?.trim(); // ← Tambahkan ini!

                                                            // 🔧 Deteksi gambar lebih robust
                                                            let type;
                                                            if (file.type && file.type.startsWith('image/')) {
                                                                type = file.type.split('/')[1];
                                                            } else {
                                                                type = file.filename?.split('.').pop()?.toLowerCase();
                                                            }

                                                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(type);

                                                            return (
                                                                <div
                                                                    key={file.id}
                                                                    className="cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 aspect-square flex items-center justify-center bg-gray-50"
                                                                    onClick={() => {
                                                                        if (isImage) {
                                                                            setSelectedImage(cleanUrl); // ← Gunakan cleanUrl!
                                                                        } else {
                                                                            window.open(cleanUrl, '_blank', 'noopener,noreferrer');
                                                                        }
                                                                    }}
                                                                    title={isImage ? "Klik untuk memperbesar gambar" : "Klik untuk membuka file"}
                                                                >
                                                                    <div className="w-full h-full bg-white flex items-center justify-center">
                                                                        {isImage ? (
                                                                            <img
                                                                                src={cleanUrl} // ← Gunakan cleanUrl!
                                                                                alt={`Feedback file ${file.filename}`}
                                                                                className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                                                                onError={(e) => {
                                                                                    console.error('Gagal muat gambar:', cleanUrl);
                                                                                    e.target.src = 'https://via.placeholder.com/160x160/ffcccc/333333?text=🖼️+GAGAL+MUAT';
                                                                                    e.target.className = "w-full h-full object-cover";
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <div className="text-gray-500 flex flex-col justify-center items-center">
                                                                                <FileText className='w-6 h-6' />
                                                                                <p className='font-semibold mt-2'>File</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
                            <h2 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                <History className="h-5 w-5 text-pink-600" />
                                Riwayat Status
                            </h2>

                            {loadingLogs ? (
                                <div className="text-center py-8">
                                    <LoadingSpinner text='Memuat logs' />
                                </div>
                            ) : logsError ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-red-800 font-medium">Error</p>
                                    </div>
                                    <p className="text-red-700 text-sm mt-1">{logsError}</p>
                                </div>
                            ) : statusLogs.length === 0 ? (
                                <div className="text-center py-8">
                                    <History className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Belum ada riwayat status</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {statusLogs.map((log, index) => (
                                        <div key={log.id} className="relative pb-6 last:pb-0">
                                            {index !== statusLogs.length - 1 && (
                                                <div className="absolute left-3 top-8 h-full w-0.5 bg-gray-200"></div>
                                            )}

                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 relative">
                                                    <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center shadow-sm">
                                                        <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-neutral-50 rounded-xl p-3 border border-pink-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <StatusBadge status={log.status} />
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>

                                                        {log.keterangan && (
                                                            <p className="text-sm text-gray-700 mb-2">
                                                                {log.keterangan}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatDate(log.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal Gambar Fullscreen */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
                    <div className="relative max-w-4xl mx-auto max-h-full w-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 transition-colors"
                            aria-label="Tutup modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <img
                            src={selectedImage}
                            alt="Preview besar"
                            className="max-w-full mx-auto max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x600?text=Gambar+Tidak+Dapat+Ditampilkan';
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default KepalaDisposisiDetail;