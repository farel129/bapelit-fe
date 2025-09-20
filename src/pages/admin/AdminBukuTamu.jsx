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
import * as bukuTamuService from '../../services/bukuTamuService';
import LoadingSpinner from '../../components/Ui/LoadingSpinner';
import ErrorModal from '../../components/Admin/ErrorModal';
import SuccessModal from '../../components/Admin/SuccessModal';
import ConfirmationModal from '../../components/Admin/ConfirmationModal';
import GuestView from '../../components/Admin/GuestView';
import CreateBukuTamu from '../../components/Admin/CreateBukuTamu';
import BukuTamuView from '../../components/Admin/BukuTamuView';
import ImageModal from '../../components/Ui/ImageModal';


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
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern browser (HTTPS / localhost)
    navigator.clipboard.writeText(text)
      .then(() => {
        showSuccess('Tersalin!', 'Link berhasil disalin ke clipboard.');
      })
      .catch(err => {
        console.error('Gagal menyalin via clipboard API:', err);
        fallbackCopyTextToClipboard(text);
      });
  } else {
    // Fallback untuk browser lama / non-secure context
    fallbackCopyTextToClipboard(text);
  }
};

const fallbackCopyTextToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";  // Agar tidak scroll halaman
  textArea.style.opacity = "0";       // Invisible
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (successful) {
      showSuccess('Tersalin!', 'Link berhasil disalin ke clipboard.');
    } else {
      showError('Gagal Menyalin', 'Tidak dapat menyalin teks. Silakan salin manual.');
    }
  } catch (err) {
    console.error('Fallback gagal:', err);
    showError('Gagal Menyalin', 'Browser tidak mendukung fitur salin. Silakan salin manual.');
  }

  document.body.removeChild(textArea);
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
    <div className="min-h-screen">
      {/* Modern Header — Tetap dipertahankan */}
      <div className="bg-white shadow-lg lg:border lg:border-slate-200 p-2 rounded-2xl lg:p-4">
        <div className="">
          <div className="flex lg:flex-row flex-col gap-4 justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-teal-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#000000]">Admin Buku Tamu</h1>
                <p className="text-sm font-medium text-[#6b7280]">Kelola acara kantor dan data kehadiran tamu secara digital</p>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-fit">
              <button
                onClick={() => setView('events')}
                className={`px-6 py-3 text-sm rounded-xl font-semibold transition-colors duration-200 ${view === 'events'
                  ? 'bg-black text-white shadow-lg hover:opacity-90'
                  : 'bg-white text-[#000000] hover:bg-gray-50 shadow-md border border-[#e5e7eb]'
                  }`}
              >
                Daftar Acara
              </button>
              <button
                onClick={() => setView('create')}
                className={`px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center transition-colors duration-200 ${view === 'create'
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

      <div className="mt-2">
        {/* Events View — TABEL DENGAN STYLE SURATMASUKLIST */}
        <BukuTamuView
          view={view}
          eventSearch={eventSearch}
          setEventSearch={setEventSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          loading={loading}
          events={events}
          eventsPagination={eventsPagination}
          formatDate={formatDate}
          loadGuests={loadGuests}
          setView={setView}
          toggleEventStatus={toggleEventStatus}
          actionLoading={actionLoading}
          setConfirmModal={setConfirmModal}
          loadEvents={loadEvents}
        />

        {/* Guests View */}
        <GuestView
          view={view}
          currentEvent={currentEvent}
          guestSearch={guestSearch}
          setGuestSearch={setGuestSearch}
          loading={loading}
          guests={guests}
          guestsPagination={guestsPagination}
          actionLoading={actionLoading}
          setConfirmModal={setConfirmModal}
          setSelectedImage={setSelectedImage}
          setView={setView}
          formatDate={formatDate}
          formatTime={formatTime}
        />

        {/* Create Event View  */}
        <CreateBukuTamu
          view={view}
          createEvent={createEvent}
          formData={formData}
          setFormData={setFormData}
          setView={setView}
          setQrCode={setQrCode}
          setGuestUrl={setGuestUrl}
          actionLoading={actionLoading}
          qrCode={qrCode}
          guestUrl={guestUrl}
          downloadQRCode={downloadQRCode}
          copyToClipboard={copyToClipboard}
        />
      </div>

      {/* Image Modal */}
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />

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