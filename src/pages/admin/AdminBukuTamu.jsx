import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  QrCode, 
  Users, 
  Calendar, 
  MapPin,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';
import { api } from '../../utils/api';

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children, type = 'info', maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  const typeClasses = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-hidden`}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Icon className={`w-6 h-6 ${typeClasses[type]}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ size = 'default', text = 'Memuat...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Loader2 className={`animate-spin ${sizeClasses[size]} text-blue-600`} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  );
};

// Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Konfirmasi', cancelText = 'Batal', type = 'warning' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex space-x-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-xl transition-colors font-medium ${
              type === 'error' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Success Modal
const SuccessModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Error Modal
const ErrorModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

const AdminBukuTamu = () => {
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('events');
  
  // Loading states for individual actions
  const [actionLoading, setActionLoading] = useState({});
  
  // Pagination states
  const [eventsPagination, setEventsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });
  const [guestsPagination, setGuestsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });
  
  // Search states
  const [eventSearch, setEventSearch] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    nama_acara: '',
    tanggal_acara: '',
    lokasi: '',
    deskripsi: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [guestUrl, setGuestUrl] = useState('');
  
  // Modal states
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  // Helper function to set action loading
  const setActionLoadingState = (action, isLoading) => {
    setActionLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  // Show success modal
  const showSuccess = (title, message) => {
    setSuccessModal({ isOpen: true, title, message });
  };

  // Show error modal
  const showError = (title, message) => {
    setErrorModal({ isOpen: true, title, message });
  };

  // Load events
  const loadEvents = async (page = 1, search = '', status = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      
      const response = await api.get('/admin/buku-tamu', { params });
      setEvents(response.data.data);
      setEventsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading events:', error);
      showError('Gagal Memuat Data', 'Tidak dapat memuat data buku tamu. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Load guests for specific event
  const loadGuests = async (eventId, page = 1, search = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      
      const response = await api.get(`/admin/buku-tamu/${eventId}/tamu`, { params });
      setGuests(response.data.data);
      setCurrentEvent(response.data.buku_tamu);
      setGuestsPagination(response.data.pagination);
    } catch (error) {
      console.error('Error loading guests:', error);
      showError('Gagal Memuat Data Tamu', 'Tidak dapat memuat data tamu. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Create new event
  const createEvent = async (e) => {
    e.preventDefault();
    setActionLoadingState('create', true);
    try {
      const response = await api.post('/admin/buku-tamu', formData);
      setQrCode(response.data.qr_code);
      setGuestUrl(response.data.guest_url);
      showSuccess('Berhasil!', 'Buku tamu berhasil dibuat dan QR code telah dihasilkan.');
      setFormData({ nama_acara: '', tanggal_acara: '', lokasi: '', deskripsi: '' });
      loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      showError('Gagal Membuat Acara', error.response?.data?.error || 'Tidak dapat membuat buku tamu. Silakan coba lagi.');
    } finally {
      setActionLoadingState('create', false);
    }
  };

  // Toggle event status
  const toggleEventStatus = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoadingState(`status-${eventId}`, true);
    try {
      await api.patch(`/admin/buku-tamu/${eventId}/status`, { status: newStatus });
      showSuccess('Status Berubah', `Status berhasil diubah menjadi ${newStatus === 'active' ? 'aktif' : 'tidak aktif'}.`);
      loadEvents(eventsPagination.current_page, eventSearch, statusFilter);
    } catch (error) {
      console.error('Error toggling status:', error);
      showError('Gagal Mengubah Status', 'Tidak dapat mengubah status acara. Silakan coba lagi.');
    } finally {
      setActionLoadingState(`status-${eventId}`, false);
    }
  };

  // Delete event
  const deleteEvent = async (eventId) => {
    setActionLoadingState(`delete-${eventId}`, true);
    try {
      await api.delete(`/admin/buku-tamu/${eventId}`);
      showSuccess('Berhasil Dihapus', 'Buku tamu dan semua data tamu telah berhasil dihapus.');
      loadEvents(eventsPagination.current_page, eventSearch, statusFilter);
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Gagal Menghapus', 'Tidak dapat menghapus buku tamu. Silakan coba lagi.');
    } finally {
      setActionLoadingState(`delete-${eventId}`, false);
      setConfirmModal({ isOpen: false, data: null });
    }
  };

  // Delete guest photo
  const deleteGuestPhoto = async (photoId) => {
    setActionLoadingState(`photo-${photoId}`, true);
    try {
      await api.delete(`/admin/foto-tamu/${photoId}`);
      showSuccess('Foto Dihapus', 'Foto tamu berhasil dihapus.');
      loadGuests(currentEvent.id, guestsPagination.current_page, guestSearch);
    } catch (error) {
      console.error('Error deleting photo:', error);
      showError('Gagal Menghapus Foto', 'Tidak dapat menghapus foto. Silakan coba lagi.');
    } finally {
      setActionLoadingState(`photo-${photoId}`, false);
      setConfirmModal({ isOpen: false, data: null });
    }
  };

  // Download QR Code
  const downloadQRCode = (qrCodeDataUrl, eventName) => {
    const link = document.createElement('a');
    link.download = `qr-code-${eventName.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Download Berhasil', 'QR Code berhasil didownload.');
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Tersalin!', 'Link berhasil disalin ke clipboard.');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Event search effect
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (view === 'events') {
        loadEvents(1, eventSearch, statusFilter);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [eventSearch, statusFilter]);

  // Guest search effect
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (view === 'guests' && currentEvent) {
        loadGuests(currentEvent.id, 1, guestSearch);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [guestSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Buku Tamu
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Kelola acara dan data kehadiran tamu dengan mudah
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setView('events')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  view === 'events'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
                }`}
              >
                Daftar Acara
              </button>
              <button
                onClick={() => setView('create')}
                className={`px-6 py-3 rounded-xl font-semibold inline-flex items-center transition-all duration-200 ${
                  view === 'create'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-200'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Buat Acara Baru
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Events View */}
        {view === 'events' && (
          <div className="space-y-8">
            {/* Modern Search and Filter */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari nama acara atau lokasi..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-6 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900 min-w-[160px]"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>

            {/* Modern Events List */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" text="Memuat data acara..." />
                </div>
              ) : events.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Acara</h3>
                  <p>Mulai dengan membuat acara pertama Anda</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Acara
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Tanggal
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Lokasi
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Tamu
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="px-8 py-6">
                            <div>
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                {event.nama_acara}
                              </div>
                              {event.deskripsi && (
                                <div className="text-sm text-gray-500 line-clamp-2">
                                  {event.deskripsi.substring(0, 80)}
                                  {event.deskripsi.length > 80 && '...'}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-900">
                            {formatDate(event.tanggal_acara)}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {event.lokasi}
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex px-3 py-2 text-xs font-semibold rounded-full ${
                              event.status === 'active' 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {event.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center text-sm text-gray-900">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-semibold">{event.kehadiran_tamu?.[0]?.count || 0}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  loadGuests(event.id);
                                  setView('guests');
                                }}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Lihat
                              </button>
                              <button
                                onClick={() => toggleEventStatus(event.id, event.status)}
                                disabled={actionLoading[`status-${event.id}`]}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 border ${
                                  event.status === 'active' 
                                    ? 'text-orange-700 bg-orange-50 hover:bg-orange-100 border-orange-200' 
                                    : 'text-green-700 bg-green-50 hover:bg-green-100 border-green-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {actionLoading[`status-${event.id}`] ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Edit className="w-4 h-4 mr-1" />
                                )}
                                {event.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                              <button
                                onClick={() => setConfirmModal({
                                  isOpen: true,
                                  data: {
                                    type: 'delete-event',
                                    id: event.id,
                                    name: event.nama_acara
                                  }
                                })}
                                disabled={actionLoading[`delete-${event.id}`]}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {actionLoading[`delete-${event.id}`] ? (
                                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 mr-1" />
                                )}
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Modern Pagination */}
              {events.length > 0 && (
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Menampilkan <span className="font-semibold">{((eventsPagination.current_page - 1) * 10) + 1}</span> - <span className="font-semibold">{Math.min(eventsPagination.current_page * 10, eventsPagination.total_items)}</span> dari <span className="font-semibold">{eventsPagination.total_items}</span> data
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadEvents(eventsPagination.current_page - 1, eventSearch, statusFilter)}
                        disabled={eventsPagination.current_page === 1}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-1">
                        <span className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg">
                          {eventsPagination.current_page}
                        </span>
                        <span className="text-gray-500">dari</span>
                        <span className="px-4 py-2 text-sm font-semibold bg-white rounded-lg">
                          {eventsPagination.total_pages}
                        </span>
                      </div>
                      <button
                        onClick={() => loadEvents(eventsPagination.current_page + 1, eventSearch, statusFilter)}
                        disabled={eventsPagination.current_page === eventsPagination.total_pages}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guests View */}
        {view === 'guests' && currentEvent && (
          <div className="space-y-8">
            {/* Back Button and Event Info */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setView('events')}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Kembali ke Daftar Acara
                </button>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{currentEvent.nama_acara}</h2>
                <div className="flex items-center space-x-8 text-gray-600">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="font-medium">{formatDate(currentEvent.tanggal_acara)}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="font-medium">{currentEvent.lokasi}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Search */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama tamu atau instansi..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Guests List */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" text="Memuat data tamu..." />
                </div>
              ) : guests.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Belum Ada Tamu</h3>
                  <p>Belum ada tamu yang melakukan check-in untuk acara ini</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Tamu
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Instansi
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Kontak
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Check In
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Foto
                        </th>
                        <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                          <td className="px-8 py-6">
                            <div className="text-lg font-semibold text-gray-900">
                              {guest.nama_lengkap}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-900">
                            {guest.instansi || <span className="text-gray-400 italic">-</span>}
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-900">
                            <div className="space-y-1">
                              <div>{guest.email || <span className="text-gray-400 italic">-</span>}</div>
                              <div className="text-gray-500">{guest.no_telepon || <span className="text-gray-400 italic">-</span>}</div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm text-gray-900">
                            <div className="space-y-1">
                              <div className="font-medium">{formatDate(guest.check_in_time)}</div>
                              <div className="text-gray-500">{formatTime(guest.check_in_time)}</div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            {guest.foto_kehadiran_tamu && guest.foto_kehadiran_tamu.length > 0 ? (
                              <div className="flex flex-wrap gap-3">
                                {guest.foto_kehadiran_tamu.map((foto) => (
                                  <div key={foto.id} className="relative group">
                                    <img
                                      src={foto.file_url}
                                      alt={foto.original_name}
                                      className="w-16 h-16 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity shadow-md border-2 border-white"
                                      onClick={() => {
                                        setSelectedImage(foto.file_url);
                                        setShowImageModal(true);
                                      }}
                                    />
                                    <button
                                      onClick={() => setConfirmModal({
                                        isOpen: true,
                                        data: {
                                          type: 'delete-photo',
                                          id: foto.id
                                        }
                                      })}
                                      disabled={actionLoading[`photo-${foto.id}`]}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                                    >
                                      {actionLoading[`photo-${foto.id}`] ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <X className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm italic">Tidak ada foto</span>
                            )}
                          </td>
                          <td className="px-8 py-6">
                            {guest.foto_kehadiran_tamu && guest.foto_kehadiran_tamu.length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedImage(guest.foto_kehadiran_tamu[0].file_url);
                                  setShowImageModal(true);
                                }}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 border border-blue-200"
                              >
                                <Image className="w-4 h-4 mr-1" />
                                Lihat
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {guests.length > 0 && (
                <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Menampilkan <span className="font-semibold">{((guestsPagination.current_page - 1) * 10) + 1}</span> - <span className="font-semibold">{Math.min(guestsPagination.current_page * 10, guestsPagination.total_items)}</span> dari <span className="font-semibold">{guestsPagination.total_items}</span> tamu
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadGuests(currentEvent.id, guestsPagination.current_page - 1, guestSearch)}
                        disabled={guestsPagination.current_page === 1}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center space-x-1">
                        <span className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg">
                          {guestsPagination.current_page}
                        </span>
                        <span className="text-gray-500">dari</span>
                        <span className="px-4 py-2 text-sm font-semibold bg-white rounded-lg">
                          {guestsPagination.total_pages}
                        </span>
                      </div>
                      <button
                        onClick={() => loadGuests(currentEvent.id, guestsPagination.current_page + 1, guestSearch)}
                        disabled={guestsPagination.current_page === guestsPagination.total_pages}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Event View */}
        {view === 'create' && (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Buat Acara Baru</h2>
              
              <form onSubmit={createEvent} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Nama Acara <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_acara}
                      onChange={(e) => setFormData({...formData, nama_acara: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                      placeholder="Masukkan nama acara"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tanggal Acara <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_acara}
                      onChange={(e) => setFormData({...formData, tanggal_acara: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lokasi}
                    onChange={(e) => setFormData({...formData, lokasi: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900"
                    placeholder="Masukkan lokasi acara"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-4 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-gray-900 resize-none"
                    placeholder="Masukkan deskripsi acara (opsional)"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setView('events');
                      setFormData({ nama_acara: '', tanggal_acara: '', lokasi: '', deskripsi: '' });
                      setQrCode('');
                      setGuestUrl('');
                    }}
                    className="px-8 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading['create']}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center font-semibold transition-all duration-200 shadow-lg shadow-blue-200"
                  >
                    {actionLoading['create'] ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Membuat Acara...
                      </>
                    ) : (
                      'Buat Acara'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* QR Code Result */}
            {qrCode && guestUrl && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">QR Code Berhasil Dibuat!</h3>
                    <p className="text-gray-600 text-lg">QR Code untuk acara "<span className="font-semibold">{formData.nama_acara}</span>" telah berhasil dibuat.</p>
                  </div>
                  
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/40">
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="mx-auto mb-6 border-4 border-white rounded-2xl shadow-lg"
                      style={{ maxWidth: '250px', height: 'auto' }}
                    />
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-gray-700">Link untuk Tamu:</p>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <code className="text-sm text-blue-600 break-all font-mono">{guestUrl}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => downloadQRCode(qrCode, formData.nama_acara)}
                      className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 inline-flex items-center font-semibold transition-all duration-200 shadow-lg shadow-green-200"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download QR Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(guestUrl)}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 inline-flex items-center font-semibold transition-all duration-200 shadow-lg shadow-blue-200"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Salin Link
                    </button>
                    <button
                      onClick={() => window.open(guestUrl, '_blank')}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 inline-flex items-center font-semibold transition-all duration-200 shadow-lg shadow-purple-200"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Buka Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => {
                setShowImageModal(false);
                setSelectedImage('');
              }}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors duration-200 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Foto Tamu"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, data: null })}
        onConfirm={() => {
          if (confirmModal.data?.type === 'delete-event') {
            deleteEvent(confirmModal.data.id);
          } else if (confirmModal.data?.type === 'delete-photo') {
            deleteGuestPhoto(confirmModal.data.id);
          }
        }}
        title={
          confirmModal.data?.type === 'delete-event' 
            ? 'Hapus Buku Tamu' 
            : 'Hapus Foto Tamu'
        }
        message={
          confirmModal.data?.type === 'delete-event' 
            ? `Yakin ingin menghapus buku tamu "${confirmModal.data?.name}"? Semua data tamu akan ikut terhapus dan tidak dapat dikembalikan.`
            : 'Yakin ingin menghapus foto ini? Tindakan ini tidak dapat dibatalkan.'
        }
        confirmText="Hapus"
        type="error"
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />
    </div>
  );
};

export default AdminBukuTamu;