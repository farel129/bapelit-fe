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
    UserCircle
} from 'lucide-react';
import { api } from '../../utils/api';

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
                    return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <AlertCircle className="h-3 w-3" /> };
            }
        };

        const config = getStatusConfig(status);

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
                {config.icon}
                {status || 'Unknown'}
            </span>
        );
    };

    const SifatBadge = ({ sifat }) => {
        const getSifatColor = (sifat) => {
            switch (sifat) {
                case 'Sangat Segera': return 'bg-red-600 text-white';
                case 'Segera': return 'bg-orange-600 text-white';
                case 'Biasa': return 'bg-blue-600 text-white';
                case 'Rahasia': return 'bg-purple-600 text-white';
                default: return 'bg-gray-600 text-white';
            }
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSifatColor(sifat)}`}>
                {sifat}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
                    <p className="mt-2 text-gray-600">Memuat detail disposisi...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 text-center shadow-sm">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Error</h2>
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
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-6xl mx-auto">

                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </button>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                    Detail Disposisi
                                </h1>
                                <div className="flex items-center gap-3">
                                    <SifatBadge sifat={disposisi?.sifat} />
                                    <StatusBadge status={disposisi?.status} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-6">

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Informasi Disposisi</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Perihal</label>
                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {disposisi?.perihal || '-'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Nomor Surat</label>
                                        <p className="text-gray-800">{disposisi?.nomor_surat || '-'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Nomor Agenda</label>
                                        <p className="text-gray-800">{disposisi?.nomor_agenda || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Asal Instansi</label>
                                    <p className="text-gray-800">{disposisi?.asal_instansi || '-'}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Surat</label>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            {formatDateOnly(disposisi?.tanggal_surat)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Diterima Tanggal</label>
                                        <p className="text-gray-800 flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-600" />
                                            {formatDateOnly(disposisi?.diterima_tanggal)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Disposisi Kepada</label>
                                    <p className="text-gray-800 flex items-center gap-2">
                                        <User className="h-4 w-4 text-green-600" />
                                        {disposisi?.disposisi_kepada_jabatan || '-'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Instruksi</label>
                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        {disposisi?.dengan_hormat_harap || '-'}
                                    </p>
                                </div>

                                {disposisi?.catatan && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Catatan</label>
                                        <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                            {disposisi.catatan}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {disposisi?.photos && disposisi.photos.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Image className="h-5 w-5 text-green-600" />
                                    Lampiran Surat ({disposisi.photos.length})
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {disposisi.photos.map((photo, index) => (
                                        <div key={photo.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 p-2 bg-gray-100 rounded-lg">
                                                    <Image className="h-5 w-5 text-gray-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-800 truncate">
                                                        {photo.filename || `Gambar ${index + 1}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatFileSize(photo.size)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <a
                                                        href={photo.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                                                        title="Lihat gambar"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                    <a
                                                        href={photo.url}
                                                        download={photo.filename}
                                                        className="p-1.5 text-gray-500 hover:text-green-600 transition-colors"
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-blue-600" />
                                Feedback Disposisi ({feedback.length})
                            </h2>

                            {loadingFeedback ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                    <p className="text-sm text-gray-600 mt-2">Memuat feedback...</p>
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
                                        <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">

                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <p className="font-medium text-gray-800">{item.user_name || 'Unknown'}</p>
                                                    <p className="font-medium text-gray-600 text-sm">{item.user_jabatan || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                    {item.notes || 'Tidak ada catatan'}
                                                </p>
                                            </div>

                                            {item.files && item.files.length > 0 && (
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                                        Lampiran ({item.files.length}):
                                                    </label>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {item.files.map((file) => (
                                                            <div key={file.id} className="flex items-center gap-2 p-2 bg-gray-100 border border-gray-200 rounded">
                                                                <div className="flex-shrink-0 text-gray-600">
                                                                    {getFileIcon(file.type, file.filename)}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-gray-800 truncate">
                                                                        {file.filename}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {formatFileSize(file.size)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <a
                                                                        href={file.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                                        title="Lihat file"
                                                                    >
                                                                        <ExternalLink className="h-3 w-3" />
                                                                    </a>
                                                                    <a
                                                                        href={file.url}
                                                                        download={file.filename}
                                                                        className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                                                                        title="Download"
                                                                    >
                                                                        <Download className="h-3 w-3" />
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
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
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <History className="h-5 w-5 text-red-600" />
                                Riwayat Status
                            </h2>

                            {loadingLogs ? (
                                <div className="text-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600" />
                                    <p className="text-sm text-gray-600 mt-2">Memuat riwayat status...</p>
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
                                                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
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
        </div>
    );
};

export default KepalaDisposisiDetail;