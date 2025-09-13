import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, MapPin, Calendar, FileText, User, Building, Briefcase, MessageSquare, CheckCircle, AlertCircle, Loader, Lock, TrendingUp, Plus, UserCircle2 } from 'lucide-react';
import { guestBookAPI } from '../../utils/api';
import LoadingSpinner from '../../components/Ui/LoadingSpinner';

// Modal Component
const Modal = ({ isOpen, onClose, children, title, type = 'default' }) => {
    if (!isOpen) return null;
    const modalTypes = {
        success: 'border-green-500 bg-green-50',
        error: 'border-red-500 bg-red-50',
        warning: 'border-yellow-500 bg-yellow-50',
        default: 'border-gray-200 bg-white'
    };
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl ${modalTypes[type]} border-2 transform transition-all duration-300 scale-100`}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {type === 'success' && <CheckCircle className="text-green-600" size={24} />}
                        {type === 'error' && <AlertCircle className="text-red-600" size={24} />}
                        {type === 'warning' && <AlertCircle className="text-yellow-600" size={24} />}
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Device Submission Hook
const useDeviceSubmission = () => {
    const STORAGE_KEY = 'guestbook_submissions';
    const [submissionState, setSubmissionState] = useState(() => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                const stored = sessionStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    return new Map(parsed);
                }
            }
        } catch (error) {
            console.warn('Failed to load submission state:', error);
        }
        return new Map();
    });

    useEffect(() => {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                const serialized = JSON.stringify([...submissionState]);
                sessionStorage.setItem(STORAGE_KEY, serialized);
            }
        } catch (error) {
            console.warn('Failed to save submission state:', error);
        }
    }, [submissionState]);

    const checkSubmission = (qrToken, deviceId) => {
        const key = `${qrToken}_${deviceId}`;
        return submissionState.get(key) || null;
    };

    const markSubmitted = (qrToken, deviceId, data) => {
        const key = `${qrToken}_${deviceId}`;
        const submissionInfo = {
            submitted: true,
            data: data,
            timestamp: new Date().toISOString()
        };
        setSubmissionState(prev => new Map(prev).set(key, submissionInfo));
        return submissionInfo;
    };

    return { checkSubmission, markSubmitted };
};

// File Preview Component
const FilePreview = ({ files, onRemove, disabled = false }) => {
    if (files.length === 0) return null;
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {files.map((file, index) => (
                <div key={file.id} className="relative group">
                    <img
                        src={file.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    {!disabled && (
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {(file.file.size / 1024 / 1024).toFixed(1)}MB
                    </div>
                </div>
            ))}
        </div>
    );
};

// Already Submitted Component
const AlreadySubmitted = ({ eventData, submissionData }) => {
    return (
        <div className="min-h-screen bg-gradient-to-bl from-gray-100 via-white to-gray-100">
            <div className="container mx-auto px-2 py-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-4">
                        <CheckCircle className="text-white" size={32} />
                    </div>
                    <h1 className="md:text-4xl text-3xl font-bold text-black mb-2">Buku Tamu Digital</h1>
                    <p className="text-gray-600">Kehadiran Anda sudah tercatat</p>
                </div>
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg md:p-8 p-4 border border-gray-200">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                                <Lock className="text-pink-500" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-black mb-2">Terima Kasih!</h2>
                            <p className="text-gray-600 mb-6">Anda sudah mengisi buku tamu untuk acara ini. Setiap perangkat hanya dapat mengisi sekali.</p>
                            <div className="bg-pink-50 rounded-xl p-6 text-left">
                                <h3 className="text-lg font-semibold text-black mb-4">Detail Kehadiran Anda:</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="text-pink-500" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-600">Nama</p>
                                            <p className="font-semibold">{submissionData.nama_lengkap}</p>
                                        </div>
                                    </div>
                                    {submissionData.instansi && (
                                        <div className="flex items-center gap-3">
                                            <Building className="text-pink-500" size={18} />
                                            <div>
                                                <p className="text-sm text-gray-600">Instansi</p>
                                                <p className="font-semibold">{submissionData.instansi}</p>
                                            </div>
                                        </div>
                                    )}
                                    {submissionData.jabatan && (
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="text-pink-500" size={18} />
                                            <div>
                                                <p className="text-sm text-gray-600">Jabatan</p>
                                                <p className="font-semibold">{submissionData.jabatan}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-pink-500" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-600">Waktu Submit</p>
                                            <p className="font-semibold">{new Date(submissionData.submitted_at).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-gray-100 rounded-xl">
                                <h4 className="font-semibold text-black mb-2">Informasi Acara</h4>
                                <p className="text-lg font-bold text-pink-600">{eventData.nama_acara}</p>
                                <p className="text-gray-600">{eventData.lokasi}</p>
                                <p className="text-gray-600">
                                    {new Date(eventData.tanggal_acara).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Stat Card Component (dari StatsSuratMasuk)
const StatCard = ({ title, count, icon: Icon, subtitle, trend, bgColor = 'bg-white', borderColor = 'border-gray-200', titleColor = 'text-gray-400', countColor = 'text-black', bgIcon = 'bg-pink-500', iconColor = 'text-white' }) => (
    <div className={`${bgColor} p-4 rounded-xl shadow-lg border-2 ${borderColor} hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-pink-500">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-xs font-medium">+{trend}%</span>
                        </div>
                    )}
                </div>
                <p className={`text-3xl font-bold ${countColor} leading-tight`}>{count}</p>
                {subtitle && (
                    <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
                )}
            </div>
            <div className={`${bgIcon} p-3 self-end rounded-xl shadow-lg transition-all duration-300`}>
                <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
        </div>
    </div>
);

// Main Component
const PublikBukuTamu = () => {
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'default', title: '', message: '' });
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [submissionData, setSubmissionData] = useState(null);
    const [deviceId, setDeviceId] = useState(null);

    const { checkSubmission, markSubmitted } = useDeviceSubmission();

    const [formData, setFormData] = useState({
        nama_lengkap: '',
        instansi: '',
        jabatan: '',
        keperluan: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    const getQRTokenFromURL = () => {
        const path = window.location.pathname;
        const matches = path.match(/\/guest\/([^\/]+)/);
        return matches ? matches[1] : 'sample-qr-token';
    };

    const qrToken = getQRTokenFromURL();

    const generateDeviceId = () => {
        try {
            let deviceId = localStorage.getItem('guest_device_id');
            if (deviceId) {
                return deviceId;
            }

            const screen = window.screen;
            const navigator = window.navigator;
            const fingerprint = [
                navigator.userAgent,
                navigator.language,
                screen.width,
                screen.height,
                screen.colorDepth,
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                navigator.hardwareConcurrency || 'unknown',
                navigator.platform
            ].join('|');

            let hash = 0;
            for (let i = 0; i < fingerprint.length; i++) {
                const char = fingerprint.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }

            const today = new Date().toISOString().split('T')[0];
            const todayHash = today.split('-').join('');
            deviceId = `device_${Math.abs(hash).toString(36)}_${todayHash}`;

            localStorage.setItem('guest_device_id', deviceId);
            return deviceId;
        } catch (error) {
            let deviceId = localStorage.getItem('guest_device_id_fallback');
            if (!deviceId) {
                deviceId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                localStorage.setItem('guest_device_id_fallback', deviceId);
            }
            return deviceId;
        }
    };

    useEffect(() => {
        const id = generateDeviceId();
        setDeviceId(id);
    }, []);

    const fetchEventData = async () => {
        if (!qrToken || !deviceId) {
            if (!qrToken) {
                showModal('error', 'Token Tidak Valid', 'QR Code atau link yang Anda gunakan tidak valid.');
            }
            setLoading(false);
            return;
        }
        try {
            const response = await guestBookAPI.checkDeviceSubmission(qrToken, deviceId);
            setEventData(response.event);
            if (response.hasSubmitted) {
                setAlreadySubmitted(true);
                setSubmissionData(response.submission);
            }
        } catch (error) {
            try {
                const eventResponse = await guestBookAPI.getEventInfo(qrToken);
                setEventData(eventResponse.event);
            } catch (fallbackError) {
                showModal('error', 'Acara Tidak Ditemukan',
                    error.message || 'Acara tidak ditemukan atau sudah tidak aktif.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (deviceId) {
            fetchEventData();
        }
    }, [deviceId]);

    const showModal = (type, title, message) => {
        setModal({ isOpen: true, type, title, message });
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: 'default', title: '', message: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024;
        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Hanya file JPEG, JPG, dan PNG yang diperbolehkan.' };
        }
        if (file.size > maxSize) {
            return { valid: false, error: 'Ukuran file maksimal 5MB.' };
        }
        return { valid: true };
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            showModal('error', 'Terlalu Banyak File', 'Maksimal 5 foto yang dapat diunggah.');
            return;
        }
        const validFiles = [];
        const newPreviews = [];
        let processedFiles = 0;
        files.forEach((file, index) => {
            const validation = validateFile(file);
            if (!validation.valid) {
                showModal('error', 'File Tidak Valid', validation.error);
                return;
            }
            validFiles.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push({
                    id: `${Date.now()}-${index}`,
                    file,
                    preview: e.target.result
                });
                processedFiles++;
                if (processedFiles === validFiles.length) {
                    setPreviewFiles(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });
        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setPreviewFiles([]);
        const fileInput = document.getElementById('photo-upload');
        if (fileInput) fileInput.value = '';
    };

    const handleSubmit = async () => {
        if (!formData.nama_lengkap.trim()) {
            showModal('error', 'Data Tidak Lengkap', 'Nama lengkap harus diisi.');
            return;
        }
        if (!deviceId) {
            showModal('error', 'System Error', 'Device ID tidak tersedia. Silakan refresh halaman.');
            return;
        }
        setSubmitting(true);
        setUploadProgress(0);
        try {
            const submitData = new FormData();
            submitData.append('nama_lengkap', formData.nama_lengkap);
            submitData.append('instansi', formData.instansi);
            submitData.append('jabatan', formData.jabatan);
            submitData.append('keperluan', formData.keperluan);
            submitData.append('device_id', deviceId);
            selectedFiles.forEach(file => {
                submitData.append('photos', file);
            });

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => prev >= 90 ? 90 : prev + 10);
            }, 200);
            const response = await guestBookAPI.submitAttendance(qrToken, submitData);
            clearInterval(progressInterval);
            setUploadProgress(100);

            const submissionInfo = {
                nama_lengkap: formData.nama_lengkap,
                instansi: formData.instansi,
                jabatan: formData.jabatan,
                keperluan: formData.keperluan,
                submitted_at: new Date().toISOString(),
                photo_count: selectedFiles.length
            };

            setTimeout(() => {
                showModal('success', 'Berhasil!',
                    `Kehadiran Anda berhasil dicatat. ${selectedFiles.length > 0 ? `${response.photo_count || selectedFiles.length} foto berhasil diunggah.` : ''}`
                );
                setTimeout(() => {
                    setAlreadySubmitted(true);
                    setSubmissionData(submissionInfo);
                }, 2000);
            }, 500);
        } catch (error) {
            setUploadProgress(0);
            if (error.response?.status === 409) {
                showModal('warning', 'Sudah Pernah Mengisi',
                    error.response.data.error || 'Anda sudah mengisi buku tamu untuk acara ini.');
                if (error.response.data.existing_submission) {
                    setAlreadySubmitted(true);
                    setSubmissionData({
                        nama_lengkap: error.response.data.existing_submission.nama_lengkap,
                        submitted_at: error.response.data.existing_submission.submitted_at,
                        instansi: '',
                        jabatan: '',
                        keperluan: '',
                        photo_count: 0
                    });
                }
            } else {
                showModal('error', 'Gagal Menyimpan',
                    error.response?.data?.error || 'Terjadi kesalahan saat menyimpan data.'
                );
            }
        } finally {
            setTimeout(() => {
                setSubmitting(false);
            }, 1000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 bg-gradient-to-bl from-gray-100 via-white to-gray-100 h-screen">
                <LoadingSpinner text='Memuat...' />
            </div>
        );
    }

    if (!eventData) {
        return (
            <div className="min-h-screen bg-gradient-to-bl from-gray-100 via-white to-gray-100 flex items-center justify-center p-4">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg">
                    <AlertCircle className="text-pink-500 mx-auto mb-4" size={64} />
                    <h1 className="text-lg font-bold text-black mb-2">Acara Tidak Ditemukan</h1>
                    <p className="text-black">QR Code atau link yang Anda gunakan tidak valid.</p>
                </div>
            </div>
        );
    }

    if (alreadySubmitted && submissionData) {
        return <AlreadySubmitted eventData={eventData} submissionData={submissionData} />;
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-bl from-gray-100 via-white to-gray-100">
                <div className="container mx-auto px-2 py-10">
                    {/* Event Info Card */}
                    <div className="max-w-2xl mx-auto mb-4">
                        <div className='flex flex-col space-y-4 justify-center items-center mb-8'>
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-full mb-4">
                                <UserCircle2 className="text-white" size={32} />
                            </div>

                            <h1 className="md:text-4xl text-3xl text-center font-bold text-black mb-2">Form Kehadiran Tamu</h1>
                            <p className="text-gray-600 text-center">Silahkan isi form untuk pencatatan kehadiran tamu</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg md:p-8 p-4 border border-gray-200">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-black mb-4">{eventData.nama_acara}</h2>
                                <div className="grid md:grid-cols-3 gap-2 md:gap-6 text-left">
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                        <Calendar className="text-pink-500 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-black">Tanggal</p>
                                            <p className="text-gray-600">
                                                {new Date(eventData.tanggal_acara).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                        <MapPin className="text-pink-500 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-black">Lokasi</p>
                                            <p className="text-gray-600">{eventData.lokasi}</p>
                                        </div>
                                    </div>
                                    {eventData.deskripsi && (
                                        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                            <FileText className="text-pink-500 mt-1 flex-shrink-0" size={20} />
                                            <div>
                                                <p className="font-semibold text-black">Deskripsi</p>
                                                <p className="text-gray-600">{eventData.deskripsi}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 border border-gray-200">
                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <User className="text-pink-500" size={18} />
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        value={formData.nama_lengkap}
                                        onChange={handleInputChange}
                                        required
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Building className="text-pink-500" size={18} />
                                        Instansi/Organisasi
                                    </label>
                                    <input
                                        type="text"
                                        name="instansi"
                                        value={formData.instansi}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Nama instansi atau organisasi"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Briefcase className="text-pink-500" size={18} />
                                        Jabatan/Posisi
                                    </label>
                                    <input
                                        type="text"
                                        name="jabatan"
                                        value={formData.jabatan}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Jabatan atau posisi Anda"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MessageSquare className="text-pink-500" size={18} />
                                        Keperluan/Tujuan
                                    </label>
                                    <textarea
                                        name="keperluan"
                                        value={formData.keperluan}
                                        onChange={handleInputChange}
                                        rows={3}
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 resize-none ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Jelaskan keperluan atau tujuan kunjungan Anda"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Camera className="text-pink-500" size={18} />
                                            Foto (Opsional)
                                        </label>
                                        {previewFiles.length > 0 && !submitting && (
                                            <button
                                                type="button"
                                                onClick={clearAllFiles}
                                                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                                            >
                                                <X size={14} />
                                                Hapus Semua
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center w-full">
                                            <label
                                                htmlFor="photo-upload"
                                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:border-pink-400 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB per file, 5 files)</p>
                                                    {previewFiles.length > 0 && (
                                                        <p className="text-xs text-pink-600 mt-1">{previewFiles.length} file terpilih</p>
                                                    )}
                                                </div>
                                                <input
                                                    id="photo-upload"
                                                    type="file"
                                                    multiple
                                                    accept="image/jpeg,image/jpg,image/png"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                    disabled={submitting}
                                                />
                                            </label>
                                        </div>
                                        <FilePreview
                                            files={previewFiles}
                                            onRemove={removeFile}
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                {submitting && uploadProgress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Upload Progress</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting || !formData.nama_lengkap.trim()}
                                        className="w-full bg-black text-white font-semibold py-4 px-6 rounded-xl hover:opacity-90 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                    >
                                        {submitting ? (
                                            <LoadingSpinner size="sm" text="Menyimpan data..." />
                                        ) : (
                                            <>
                                                <CheckCircle size={20} />
                                                Catat Kehadiran
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="text-center text-sm text-gray-500 pt-2">
                                    <p>Data yang Anda masukkan akan disimpan dengan aman dan hanya digunakan untuk keperluan acara ini.</p>
                                    <p className="mt-1 font-semibold text-pink-600 flex items-center justify-center gap-1">
                                        <AlertCircle size={16} />
                                        Form ini hanya dapat diisi sekali per perangkat
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={closeModal}
                title={modal.title}
                type={modal.type}
            >
                <p className="text-gray-700 leading-relaxed mb-4">{modal.message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={closeModal}
                        className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default PublikBukuTamu;