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
  ExternalLink,
  Loader,
} from 'lucide-react';
import { api } from '../../utils/api';
import * as bukuTamuService from '../../services/bukuTamuService';
import LoadingSpinner from '../../components/Ui/LoadingSpinner';

// === Komponen Modal (Dipertahankan, tidak diubah) ===
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
            <h3 className="text-lg font-semibold text-[#000000]">{title}</h3>
          </div>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};


const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Konfirmasi', cancelText = 'Batal', type = 'warning' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
      <div className="space-y-4">
        <p className="text-[#6b7280]">{message}</p>
        <div className="flex space-x-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              type === 'error' ? 'hover:bg-red-800' : 'hover:bg-gray-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

const SuccessModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="success">
      <div className="space-y-4">
        <p className="text-[#6b7280]">{message}</p>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

const ErrorModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div className="space-y-4">
        <p className="text-[#6b7280]">{message}</p>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
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
  const [actionLoading, setActionLoading] = useState({});
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
  const [eventSearch, setEventSearch] = useState('');
  const [guestSearch, setGuestSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    nama_acara: '',
    tanggal_acara: '',
    lokasi: '',
    deskripsi: ''
  });
  const [qrCode, setQrCode] = useState('');
  const [guestUrl, setGuestUrl] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, title: '', message: '' });
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });

  const setActionLoadingState = (action, isLoading) => {
    setActionLoading(prev => ({ ...prev, [action]: isLoading }));
  };

  const showSuccess = (title, message) => {
    setSuccessModal({ isOpen: true, title, message });
  };

  const showError = (title, message) => {
    setErrorModal({ isOpen: true, title, message });
  };

  const loadEvents = async (page = 1, search = '', status = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      const data = await bukuTamuService.fetchEvents(params);
      setEvents(data.data);
      setEventsPagination(data.pagination);
    } catch (error) {
      console.error('Error loading events:', error);
      showError('Gagal Memuat Data', 'Tidak dapat memuat data buku tamu. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const loadGuests = async (eventId, page = 1, search = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      const data = await bukuTamuService.fetchGuests(eventId, params);
      setGuests(data.data);
      setCurrentEvent(data.buku_tamu);
      setGuestsPagination(data.pagination);
    } catch (error) {
      console.error('Error loading guests:', error);
      showError('Gagal Memuat Data Tamu', 'Tidak dapat memuat data tamu. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (e) => {
    e.preventDefault();
    setActionLoadingState('create', true);
    try {
      const data = await bukuTamuService.createEvent(formData);
      setQrCode(data.qr_code);
      setGuestUrl(data.guest_url);
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

  const toggleEventStatus = async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoadingState(`status-${eventId}`, true);
    try {
      await bukuTamuService.updateEventStatus(eventId, newStatus);
      showSuccess('Status Berubah', `Status berhasil diubah menjadi ${newStatus === 'active' ? 'aktif' : 'tidak aktif'}.`);
      loadEvents(eventsPagination.current_page, eventSearch, statusFilter);
    } catch (error) {
      console.error('Error toggling status:', error);
      showError('Gagal Mengubah Status', 'Tidak dapat mengubah status acara. Silakan coba lagi.');
    } finally {
      setActionLoadingState(`status-${eventId}`, false);
    }
  };

  const deleteEvent = async (eventId) => {
    setActionLoadingState(`delete-${eventId}`, true);
    try {
      await bukuTamuService.deleteEvent(eventId);
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

  const deleteGuestPhoto = async (photoId) => {
    setActionLoadingState(`photo-${photoId}`, true);
    try {
      await bukuTamuService.deleteGuestPhoto(photoId);
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

  const downloadQRCode = (qrCodeDataUrl, eventName) => {
    const link = document.createElement('a');
    link.download = `qr-code-${eventName.replace(/\s+/g, '-')}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('Download Berhasil', 'QR Code berhasil didownload.');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showSuccess('Tersalin!', 'Link berhasil disalin ke clipboard.');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (view === 'events') {
        loadEvents(1, eventSearch, statusFilter);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [eventSearch, statusFilter]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (view === 'guests' && currentEvent) {
        loadGuests(currentEvent.id, 1, guestSearch);
      }
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [guestSearch]);

  return (
    <div className="min-h-screen bg-white p-5 rounded-3xl shadow-lg">
      {/* Modern Header — Tetap dipertahankan */}
      <div className="bg-white shadow-lg border border-slate-200 rounded-2xl">
        <div className="max-w-7xl mx-auto p-5 py-7">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#000000]">Admin Buku Tamu</h1>
                <p className="text-sm font-medium text-[#6b7280]">Kelola acara kantor dan data kehadiran tamu secara digital</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setView('events')}
                className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ${
                  view === 'events'
                    ? 'bg-black text-white shadow-lg hover:opacity-90'
                    : 'bg-white text-[#000000] hover:bg-gray-50 shadow-md border border-[#e5e7eb]'
                }`}
              >
                Daftar Acara
              </button>
              <button
                onClick={() => setView('create')}
                className={`px-6 py-3 rounded-xl font-semibold inline-flex items-center transition-colors duration-200 ${
                  view === 'create'
                    ? 'bg-black text-white shadow-lg hover:opacity-90'
                    : 'bg-white text-[#000000] hover:bg-gray-50 shadow-md border border-[#e5e7eb]'
                }`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Buat Acara Baru
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {/* Events View — TABEL DENGAN STYLE SURATMASUKLIST */}
        {view === 'events' && (
          <div className="space-y-4">
            {/* Modern Search and Filter — Tetap dipertahankan */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Cari nama acara atau lokasi..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-[#000000] placeholder-[#6b7280]"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:border-white text-[#000000] min-w-[160px]"
                >
                  <option value="">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" text="Memuat data acara..." />
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                  <Calendar className="h-12 w-12 text-black mx-auto mb-4" />
                  <p className="text-black text-lg font-semibold">
                    {eventsPagination.total_items === 0 ? 'Belum ada acara' : 'Tidak ada acara yang sesuai filter'}
                  </p>
                  <p className="text-black mt-1">
                    {eventsPagination.total_items === 0 ? 'Mulai dengan membuat acara pertama Anda.' : 'Coba ubah filter pencarian'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#EDE6E3] bg-white rounded-2xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Acara</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tanggal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Lokasi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tamu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE6E3]">
                      {events.map((event) => (
                        <tr key={event.id} className="hover:bg-[#FDFCFB] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            <div className="font-semibold">{event.nama_acara}</div>
                            {event.deskripsi && (
                              <div className="text-sm text-black max-w-xs truncate" title={event.deskripsi}>
                                {event.deskripsi.length > 50 ? `${event.deskripsi.substring(0, 50)}...` : event.deskripsi}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {formatDate(event.tanggal_acara)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-black mr-2 opacity-70" />
                              {event.lokasi || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              event.status === 'active'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-slate-100 text-yellow-800 border border-slate-200'
                            }`}>
                              {event.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <span className="font-medium">{event.kehadiran_tamu?.[0]?.count || 0}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => {
                                  loadGuests(event.id);
                                  setView('guests');
                                }}
                                className="flex items-center justify-center gap-x-1 text-teal-400 hover:text-teal-700 text-sm font-medium bg-white px-3 py-2 border border-[#EDE6E3] rounded-xl hover:shadow-sm transition-all"
                              >
                                <Eye className="w-4 h-4" /> Lihat
                              </button>

                              <button
                                onClick={() => toggleEventStatus(event.id, event.status)}
                                disabled={actionLoading[`status-${event.id}`]}
                                className={`flex items-center justify-center gap-x-1 text-sm font-medium px-3 py-2 rounded-xl transition-all border ${
                                  event.status === 'active'
                                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100'
                                    : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                                } disabled:opacity-50`}
                              >
                                {actionLoading[`status-${event.id}`] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Edit className="w-4 h-4" />
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
                                className="flex items-center justify-center gap-x-1 text-sm font-medium bg-black text-white px-3 py-2 rounded-xl hover:opacity-90 transition-all border border-slate-500 disabled:opacity-50"
                              >
                                {actionLoading[`delete-${event.id}`] ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
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

              {/* Pagination — Disesuaikan gaya SuratMasukList */}
              {events.length > 0 && (
                <div className="px-6 py-4 bg-white border-t border-[#EDE6E3] flex items-center justify-between">
                  <div className="text-sm font-medium text-black">
                    Menampilkan {((eventsPagination.current_page - 1) * 10) + 1} - {Math.min(eventsPagination.current_page * 10, eventsPagination.total_items)} dari {eventsPagination.total_items} data
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadEvents(eventsPagination.current_page - 1, eventSearch, statusFilter)}
                      disabled={eventsPagination.current_page === 1}
                      className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="px-3 py-2 bg-white text-black rounded-xl font-semibold border border-[#EDE6E3]">
                        {eventsPagination.current_page}
                      </span>
                      <span className="text-sm text-black">dari</span>
                      <span className="px-3 py-2 bg-white text-black rounded-xl font-semibold border border-[#EDE6E3]">
                        {eventsPagination.total_pages}
                      </span>
                    </div>

                    <button
                      onClick={() => loadEvents(eventsPagination.current_page + 1, eventSearch, statusFilter)}
                      disabled={eventsPagination.current_page === eventsPagination.total_pages}
                      className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Guests View — TABEL TAMU DENGAN STYLE SURATMASUKLIST */}
        {view === 'guests' && currentEvent && (
          <div className="space-y-4">
            {/* Back Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('events')}
                className="flex items-center text-black hover:text-gray-700 font-medium transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Kembali ke Daftar Acara
              </button>
            </div>

            {/* Event Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
              <h2 className="text-xl font-semibold text-neutral-500 mb-4">Nama acara: <span className='text-black'>{currentEvent.nama_acara}</span></h2>
              <div className="flex flex-wrap gap-4 text-sm text-black">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-teal-400 mr-2" />
                  {formatDate(currentEvent.tanggal_acara)}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-teal-400 mr-2" />
                  {currentEvent.lokasi}
                </div>
              </div>
            </div>

            {/* Guest Search */}
            <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                <input
                  type="text"
                  placeholder="Cari nama tamu atau instansi..."
                  value={guestSearch}
                  onChange={(e) => setGuestSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-white focus:border-white text-black placeholder-black shadow-sm"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center">
                  <LoadingSpinner size="lg" text="Memuat data tamu..." />
                </div>
              ) : guests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                  <Users className="h-12 w-12 text-black mx-auto mb-4" />
                  <p className="text-black text-lg font-semibold">
                    {guestsPagination.total_items === 0 ? 'Belum ada tamu' : 'Tidak ada tamu yang sesuai filter'}
                  </p>
                  <p className="text-black mt-1">
                    {guestsPagination.total_items === 0 ? 'Belum ada tamu yang melakukan check-in untuk acara ini.' : 'Coba ubah filter pencarian'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#EDE6E3] bg-white rounded-2xl">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tamu</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Instansi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Jabatan / Status / Pekerjaan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Check In</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Foto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDE6E3]">
                      {guests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-[#FDFCFB] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                            {guest.nama_lengkap}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            {guest.instansi || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            <div className="space-y-1">
                              <div>{guest.email || '-'}</div>
                              <div className="text-gray-600">{guest.jabatan || '-'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                            <div className="space-y-1">
                              <div className="font-medium">{formatDate(guest.check_in_time)}</div>
                              <div className="text-gray-600">{formatTime(guest.check_in_time)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {guest.foto_kehadiran_tamu && guest.foto_kehadiran_tamu.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {guest.foto_kehadiran_tamu.map((foto) => (
                                  <div key={foto.id} className="relative group">
                                    <img
                                      src={foto.file_url}
                                      alt={foto.original_name}
                                      className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-[#EDE6E3]"
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
                                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                                    >
                                      {actionLoading[`photo-${foto.id}`] ? (
                                        <Loader2 className="w-2 h-2 animate-spin" />
                                      ) : (
                                        <X className="w-2 h-2" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm italic">Tidak ada foto</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {guest.foto_kehadiran_tamu && guest.foto_kehadiran_tamu.length > 0 ? (
                              <button
                                onClick={() => {
                                  setSelectedImage(guest.foto_kehadiran_tamu[0].file_url);
                                  setShowImageModal(true);
                                }}
                                className="flex items-center justify-center gap-x-1 text-teal-400 hover:text-teal-700 text-sm font-medium bg-white px-3 py-2 border border-[#EDE6E3] rounded-xl hover:shadow-sm transition-all"
                              >
                                <Image className="w-4 h-4" /> Lihat
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm italic">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination — Disesuaikan gaya SuratMasukList */}
              {guests.length > 0 && (
                <div className="px-6 py-4 bg-white border-t border-[#EDE6E3] flex items-center justify-between">
                  <div className="text-sm font-medium text-black">
                    Menampilkan {((guestsPagination.current_page - 1) * 10) + 1} - {Math.min(guestsPagination.current_page * 10, guestsPagination.total_items)} dari {guestsPagination.total_items} tamu
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadGuests(currentEvent.id, guestsPagination.current_page - 1, guestSearch)}
                      disabled={guestsPagination.current_page === 1}
                      className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex items-center gap-1">
                      <span className="px-3 py-2 bg-white text-black rounded-xl font-semibold border border-[#EDE6E3]">
                        {guestsPagination.current_page}
                      </span>
                      <span className="text-sm text-black">dari</span>
                      <span className="px-3 py-2 bg-white text-black rounded-xl font-semibold border border-[#EDE6E3]">
                        {guestsPagination.total_pages}
                      </span>
                    </div>

                    <button
                      onClick={() => loadGuests(currentEvent.id, guestsPagination.current_page + 1, guestSearch)}
                      disabled={guestsPagination.current_page === guestsPagination.total_pages}
                      className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Event View — Tidak diubah */}
        {view === 'create' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-4xl mx-auto">
              <div className='flex gap-x-2 items-center mb-8'>
                <div className='bg-white text-teal-400 p-3 flex justify-center items-center shadow-lg border border-slate-200 rounded-xl'>
                  <Plus className='w-7 h-7' />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#000000]">Buat Acara Baru</h2>
                  <p className='text-sm text-[#6b7280]'>Isi form untuk membuat buku tamu dan dapatkan QRcode</p>
                </div>
              </div>
              <form onSubmit={createEvent} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-semibold text-[#000000] mb-3">
                      Nama Acara <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nama_acara}
                      onChange={(e) => setFormData({ ...formData, nama_acara: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000]"
                      placeholder="Masukkan nama acara"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#000000] mb-3">
                      Tanggal Acara <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_acara}
                      onChange={(e) => setFormData({ ...formData, tanggal_acara: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-3">
                    Lokasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000]"
                    placeholder="Masukkan lokasi acara"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#000000] mb-3">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000] resize-none"
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
                    className="px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading['create']}
                    className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
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

            {/* QR Code Result — Tetap dipertahankan */}
            {qrCode && guestUrl && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-16 h-16 bg-[#f6339a] rounded-full flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#000000] mb-2">QR Code Berhasil Dibuat!</h3>
                    <p className="text-[#6b7280] text-lg">QR Code untuk acara "<span className="font-semibold">{formData.nama_acara}</span>" telah berhasil dibuat.</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/40">
                    <img
                      src={qrCode}
                      alt="QR Code"
                      className="mx-auto mb-6 border-4 border-white rounded-2xl shadow-lg"
                      style={{ maxWidth: '250px', height: 'auto' }}
                    />
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-[#000000]">Link untuk Tamu:</p>
                      <div className="bg-gray-50 p-4 rounded-xl border border-[#e5e7eb]">
                        <code className="text-sm text-[#000000] break-all font-mono">{guestUrl}</code>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => downloadQRCode(qrCode, formData.nama_acara)}
                      className="px-8 py-4 bg-black hover:opacity-90 text-white rounded-xl hover:shadow-lg inline-flex items-center font-medium transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download QR Code
                    </button>
                    <button
                      onClick={() => copyToClipboard(guestUrl)}
                      className="px-8 py-4 bg-black hover:opacity-90 text-white rounded-xl hover:shadow-lg inline-flex items-center font-medium transition-all duration-200 shadow-sm"
                    >
                      <Copy className="w-5 h-5 mr-2" />
                      Salin Link
                    </button>
                    <button
                      onClick={() => window.open(guestUrl, '_blank')}
                      className="px-8 py-4 bg-black hover:opacity-90 text-white rounded-xl hover:shadow-lg inline-flex items-center font-medium transition-all duration-200 shadow-sm"
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

      {/* Image Modal — Tetap dipertahankan */}
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

      {/* Confirmation Modal — Tetap dipertahankan */}
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

      {/* Success Modal — Tetap dipertahankan */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ isOpen: false, title: '', message: '' })}
        title={successModal.title}
        message={successModal.message}
      />

      {/* Error Modal — Tetap dipertahankan */}
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