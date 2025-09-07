import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, MapPin, Calendar, FileText, User, Building, Briefcase, MessageSquare, CheckCircle, AlertCircle, Loader, Lock } from 'lucide-react';
import { guestBookAPI } from '../../utils/api';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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

// Loading Spinner Component
const LoadingSpinner = ({ size = 'md', text = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className="flex items-center justify-center gap-3">
            <Loader className={`${sizes[size]} animate-spin text-blue-600`} />
            {text && <span className="text-gray-600">{text}</span>}
        </div>
    );
};

// Device Submission Hook
// GANTI: Custom hook lama dengan yang ini
const useDeviceSubmission = () => {
    const STORAGE_KEY = 'guestbook_submissions';

    // Initialize state dari sessionStorage (persistent across refresh)
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

    // Save ke sessionStorage setiap kali state berubah
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
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-4">
                        <CheckCircle className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Buku Tamu Digital</h1>
                    <p className="text-gray-600">Kehadiran Anda sudah tercatat</p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <Lock className="text-green-600" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Terima Kasih!</h2>
                            <p className="text-gray-600 mb-6">Anda sudah mengisi buku tamu untuk acara ini. Setiap perangkat hanya dapat mengisi sekali.</p>

                            <div className="bg-green-50 rounded-xl p-6 text-left">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Kehadiran Anda:</h3>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="text-green-600" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-600">Nama</p>
                                            <p className="font-semibold">{submissionData.nama_lengkap}</p>
                                        </div>
                                    </div>

                                    {submissionData.instansi && (
                                        <div className="flex items-center gap-3">
                                            <Building className="text-green-600" size={18} />
                                            <div>
                                                <p className="text-sm text-gray-600">Instansi</p>
                                                <p className="font-semibold">{submissionData.instansi}</p>
                                            </div>
                                        </div>
                                    )}

                                    {submissionData.jabatan && (
                                        <div className="flex items-center gap-3">
                                            <Briefcase className="text-green-600" size={18} />
                                            <div>
                                                <p className="text-sm text-gray-600">Jabatan</p>
                                                <p className="font-semibold">{submissionData.jabatan}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-green-600" size={18} />
                                        <div>
                                            <p className="text-sm text-gray-600">Waktu Submit</p>
                                            <p className="font-semibold">{new Date(submissionData.submitted_at).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                <h4 className="font-semibold text-gray-800 mb-2">Informasi Acara</h4>
                                <p className="text-lg font-bold text-blue-800">{eventData.nama_acara}</p>
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

// Main Component
const PublikBukuTamu = () => {
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, type: 'default', title: '', message: '' });
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [submissionData, setSubmissionData] = useState(null);
    const [deviceId, setDeviceId] = useState(null);

    // Use custom hook for device submission
    const { checkSubmission, markSubmitted } = useDeviceSubmission();

    // Form state
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        instansi: '',
        jabatan: '',
        keperluan: ''
    });

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewFiles, setPreviewFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Get QR token from URL
    const getQRTokenFromURL = () => {
        const path = window.location.pathname;
        const matches = path.match(/\/guest\/([^\/]+)/);
        return matches ? matches[1] : 'sample-qr-token'; // Default for demo
    };

    const qrToken = getQRTokenFromURL();

    // Generate safe device ID
    const generateDeviceId = () => {
        try {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(2, 15);
            const userAgent = navigator.userAgent.slice(0, 20);

            return btoa(`${timestamp}-${random}-${userAgent}`).substring(0, 32);
        } catch (error) {
            console.warn('Device ID generation fallback:', error);
            return `device-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
        }
    };

    // Initialize device ID
    useEffect(() => {
        const id = generateDeviceId();
        setDeviceId(id);
    }, []);

    // Fetch event data
    // GANTI: Function fetchEventData dengan yang ini
    const fetchEventData = async () => {
        if (!qrToken) {
            showModal('error', 'Token Tidak Valid', 'QR Code atau link yang Anda gunakan tidak valid.');
            setLoading(false);
            return;
        }

        try {
            const response = await guestBookAPI.getEventInfo(qrToken);
            setEventData(response.event);

            // PENTING: Check submission status setelah mendapat device ID
            if (deviceId) {
                const submissionStatus = checkSubmission(qrToken, deviceId);
                if (submissionStatus && submissionStatus.submitted) {
                    console.log('Found existing submission for device:', deviceId);
                    setAlreadySubmitted(true);
                    setSubmissionData(submissionStatus.data);
                }
            }
        } catch (error) {
            console.error('Fetch event data error:', error);
            showModal('error', 'Acara Tidak Ditemukan',
                error.response?.data?.error || 'Acara tidak ditemukan atau sudah tidak aktif.');
        } finally {
            setLoading(false);
        }
    };

    // Effect untuk fetch data setelah deviceId tersedia
    useEffect(() => {
        if (deviceId) {
            fetchEventData();
        }
    }, [deviceId]);

    // Utility function to show modal
    const showModal = (type, title, message) => {
        setModal({ isOpen: true, type, title, message });
    };

    const closeModal = () => {
        setModal({ isOpen: false, type: 'default', title: '', message: '' });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validate single file
    const validateFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Hanya file JPEG, JPG, dan PNG yang diperbolehkan.' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'Ukuran file maksimal 5MB.' };
        }

        return { valid: true };
    };

    // Handle file selection
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

            // Create preview
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

    // Remove selected file
    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Clear all files
    const clearAllFiles = () => {
        setSelectedFiles([]);
        setPreviewFiles([]);
        const fileInput = document.getElementById('photo-upload');
        if (fileInput) fileInput.value = '';
    };

    // Submit form
    // GANTI: Function handleSubmit dengan yang ini  
const handleSubmit = async () => {
  // Triple check - pastikan belum pernah submit
  if (deviceId) {
    const submissionStatus = checkSubmission(qrToken, deviceId);
    if (submissionStatus && submissionStatus.submitted) {
      console.log('Preventing duplicate submission');
      showModal('warning', 'Sudah Terisi', 'Anda sudah mengisi buku tamu untuk acara ini sebelumnya.');
      setAlreadySubmitted(true);
      setSubmissionData(submissionStatus.data);
      return;
    }
  }

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

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    const response = await guestBookAPI.submitAttendance(qrToken, submitData);
    
    clearInterval(progressInterval);
    setUploadProgress(100);

    // PENTING: Mark sebagai submitted DI SINI
    const submissionInfo = {
      nama_lengkap: formData.nama_lengkap,
      instansi: formData.instansi,
      jabatan: formData.jabatan,
      keperluan: formData.keperluan,
      submitted_at: new Date().toISOString(),
      photo_count: selectedFiles.length
    };

    // Save ke storage dan state
    markSubmitted(qrToken, deviceId, submissionInfo);

    setTimeout(() => {
      showModal('success', 'Berhasil!', 
        `Kehadiran Anda berhasil dicatat. ${selectedFiles.length > 0 ? `${response.photo_count || selectedFiles.length} foto berhasil diunggah.` : ''} Form ini tidak dapat diisi ulang dari perangkat ini.`
      );

      // Set to already submitted state
      setTimeout(() => {
        setAlreadySubmitted(true);
        setSubmissionData(submissionInfo);
      }, 2000);

    }, 500);

  } catch (error) {
    console.error('Submit error:', error);
    setUploadProgress(0);
    showModal('error', 'Gagal Menyimpan', 
      error.response?.data?.error || 'Terjadi kesalahan saat menyimpan data.'
    );
  } finally {
    setTimeout(() => {
      setSubmitting(false);
    }, 1000);
  }
};

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center bg-white rounded-3xl p-8 shadow-xl">
                    <LoadingSpinner size="lg" text="Memuat informasi acara..." />
                </div>
            </div>
        );
    }

    // Error state
    if (!eventData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-3xl shadow-xl">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={64} />
                    <h1 className="text-2xl font-bold text-red-800 mb-2">Acara Tidak Ditemukan</h1>
                    <p className="text-red-600">QR Code atau link yang Anda gunakan tidak valid.</p>
                </div>
            </div>
        );
    }

    // Already submitted state
    if (alreadySubmitted && submissionData) {
        return <AlreadySubmitted eventData={eventData} submissionData={submissionData} />;
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                            <FileText className="text-white" size={32} />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Buku Tamu Digital</h1>
                        <p className="text-gray-600">Silakan isi data kehadiran Anda dengan lengkap</p>
                        <div className="mt-2 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm">
                            <Lock size={16} />
                            <span>Form hanya dapat diisi sekali per perangkat</span>
                        </div>
                    </div>

                    {/* Event Info Card */}
                    <div className="max-w-4xl mx-auto mb-8">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">{eventData.nama_acara}</h2>

                                <div className="grid md:grid-cols-3 gap-6 text-left">
                                    <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                                        <Calendar className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800">Tanggal</p>
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

                                    <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                                        <MapPin className="text-red-600 mt-1 flex-shrink-0" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800">Lokasi</p>
                                            <p className="text-gray-600">{eventData.lokasi}</p>
                                        </div>
                                    </div>

                                    {eventData.deskripsi && (
                                        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                                            <FileText className="text-green-600 mt-1 flex-shrink-0" size={20} />
                                            <div>
                                                <p className="font-semibold text-gray-800">Deskripsi</p>
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
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 backdrop-blur-sm">
                            <div className="space-y-6">
                                {/* Form Fields */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <User className="text-blue-600" size={18} />
                                        Nama Lengkap *
                                    </label>
                                    <input
                                        type="text"
                                        name="nama_lengkap"
                                        value={formData.nama_lengkap}
                                        onChange={handleInputChange}
                                        required
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Masukkan nama lengkap Anda"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Building className="text-purple-600" size={18} />
                                        Instansi/Organisasi
                                    </label>
                                    <input
                                        type="text"
                                        name="instansi"
                                        value={formData.instansi}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Nama instansi atau organisasi"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Briefcase className="text-green-600" size={18} />
                                        Jabatan/Posisi
                                    </label>
                                    <input
                                        type="text"
                                        name="jabatan"
                                        value={formData.jabatan}
                                        onChange={handleInputChange}
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Jabatan atau posisi Anda"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MessageSquare className="text-orange-600" size={18} />
                                        Keperluan/Tujuan
                                    </label>
                                    <textarea
                                        name="keperluan"
                                        value={formData.keperluan}
                                        onChange={handleInputChange}
                                        rows={3}
                                        disabled={submitting}
                                        className={`w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${submitting ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        placeholder="Jelaskan keperluan atau tujuan kunjungan Anda"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <Camera className="text-pink-600" size={18} />
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
                                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 hover:border-blue-400 ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB per file, 5 files)</p>
                                                    {previewFiles.length > 0 && (
                                                        <p className="text-xs text-blue-600 mt-1">{previewFiles.length} file terpilih</p>
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

                                        {/* File Previews */}
                                        <FilePreview
                                            files={previewFiles}
                                            onRemove={removeFile}
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                {/* Upload Progress */}
                                {submitting && uploadProgress > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Upload Progress</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting || !formData.nama_lengkap.trim()}
                                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

                                {/* Info Text */}
                                <div className="text-center text-sm text-gray-500 pt-2">
                                    <p>Data yang Anda masukkan akan disimpan dengan aman dan hanya digunakan untuk keperluan acara ini.</p>
                                    <p className="mt-1 font-semibold text-yellow-600 flex items-center justify-center gap-1">
                                        <AlertCircle size={16} />
                                        Form ini hanya dapat diisi sekali per perangkat
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
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