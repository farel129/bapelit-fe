import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Building,
  Clock,
  AlertCircle,
  ArrowLeft,
  Check,
  MessageSquare,
  Send,
  Eye,
  Edit,
  Save,
  Trash2,
  Paperclip,
  User,
  Cog,
  Flag,
  X,
  Forward
} from 'lucide-react';
import { api } from '../../utils/api';
import ForwardModal from '../../components/Sekretaris/ForwardModal';
import { formatIndonesianDate } from '../../utils/timeZone';
import toast from 'react-hot-toast';
import { atasanDisposisiService } from '../../services/atasanDisposisiService';

const SekretarisDisposisiDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [disposisi, setDisposisi] = useState(location.state?.disposisi || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  // State untuk feedback
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    notes: '',
    status: 'diproses',
    files: []
  });
  const [feedbackList, setFeedbackList] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  // State untuk feedback dari bawahan
  const [subordinateFeedback, setSubordinateFeedback] = useState(null);
  const [subFeedbackLoading, setSubFeedbackLoading] = useState(false);
  const [subFeedbackError, setSubFeedbackError] = useState(null);
  // State untuk edit feedback - ubah menjadi ID feedback yang sedang diedit
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editFeedbackData, setEditFeedbackData] = useState({
    notes: '',
    status: 'diproses',
    newFiles: [],
    removeFileIds: [],
    existingFiles: []
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchDisposisiDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await atasanDisposisiService.getAtasanDisposisiDetail(id);
      setDisposisi(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisposisiDetail();
  }, [id]);

  // Fetch feedback data
  const fetchFeedbackForDisposisi = async (role = 'sekretaris') => {
    try {
      setFeedbackLoading(true);
      const response = await api.get(`/${role}/feedback/saya`);
      const result = response.data;
      let feedbacks = [];
      if (result && Array.isArray(result.data)) {
        feedbacks = result.data;
      } else if (result && Array.isArray(result)) {
        feedbacks = result;
      }
      // Filter feedback untuk disposisi ini saja
      const filteredFeedback = feedbacks.filter(
        fb => fb.disposisi_id === disposisi.id
      );
      setFeedbackList(filteredFeedback);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      toast.error('Gagal memuat feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };
  // Fetch feedback dari bawahan
  const fetchSubordinateFeedback = useCallback(async (role = 'sekretaris') => {
    // Hanya fetch jika disposisi ada dan sudah diteruskan ke seseorang
    if (!disposisi || !disposisi.diteruskan_kepada_user_id) {
      setSubordinateFeedback(null);
      return;
    }
    try {
      setSubFeedbackLoading(true);
      setSubFeedbackError(null);
      const response = await api.get(`/${role}/disposisi/${id}/feedback-bawahan`);
      const feedbackData = response.data;
      setSubordinateFeedback(feedbackData);
    } catch (err) {
      console.error('Error fetching subordinate feedback:', err);
      // Jika 404, itu berarti belum ada feedback
      if (err.response && err.response.status !== 404) {
        setSubFeedbackError('Gagal memuat feedback dari bawahan: ' + (err.response?.data?.error || err.message));
        toast.error('Gagal memuat feedback dari bawahan');
      } else {
        setSubordinateFeedback(null);
      }
    } finally {
      setSubFeedbackLoading(false);
    }
  }, [disposisi?.diteruskan_kepada_user_id, id]); // Ubah dependency
  // Handle terima disposisi
  const handleAcceptDisposisi = async () => {
    try {
      setAcceptLoading(true);
      setAcceptError(null);
      const response = await api.put(`/sekretaris/disposisi/${id}/terima`);
      if (response.data) {
        // Update disposisi state dengan data yang baru
        const updatedData = response.data.data || response.data;
        setDisposisi(prevDisposisi => ({
          ...prevDisposisi,
          status_dari_sekretaris: updatedData.status_dari_sekretaris || 'diterima'
        }));
        toast.success(response.data.message || 'Disposisi berhasil diterima!');
        fetchDisposisiDetail()
      }
    } catch (err) {
      setAcceptError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!disposisi?.id) return;

    setDownloadLoading(true);
    setDownloadError(null);
    try {
      // Pastikan `api` dikonfigurasi untuk menangani blob response
      // Misalnya dengan menambahkan `responseType: 'blob'` jika menggunakan axios
      const response = await api.get(`/disposisi/${disposisi.id}/pdf`, {
        responseType: 'blob', // Sangat penting untuk mendapatkan file
      });

      // Buat URL objek dari blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      // Buat elemen <a> sementara untuk trigger download
      const link = document.createElement('a');
      link.href = url;
      // Gunakan nomor surat atau ID untuk nama file, sesuai dengan backend
      const filename = `disposisi-${disposisi.nomor_surat || disposisi.id}.pdf`;
      link.setAttribute('download', filename); // Atribut download

      // Tambahkan ke DOM, klik, lalu hapus
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Hapus URL objek setelah beberapa saat untuk membebaskan memori
      window.setTimeout(() => window.URL.revokeObjectURL(url), 100);

      toast.success('PDF berhasil diunduh!');
    } catch (err) {
      console.error('Gagal mengunduh PDF:', err);
      setDownloadError('Gagal mengunduh PDF. Silakan coba lagi.');
      toast.error('Gagal mengunduh PDF.');
    } finally {
      setDownloadLoading(false);
    }
  };


  // Handle forward success
  const handleForwardSuccess = () => {
    // Update disposisi status to 'diteruskan'
    setDisposisi(prevDisposisi => ({
      ...prevDisposisi,
      status_dari_sekretaris: 'diteruskan'
    }));
    toast.success('Disposisi berhasil diteruskan!');
    fetchDisposisiDetail();
  };
  // Handler untuk feedback baru
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFeedbackData(prev => ({
      ...prev,
      files: files.slice(0, 5) // Maksimal 5 file
    }));
  };
  const handleFeedbackSubmit = async (e, role = 'sekretaris') => {
    e.preventDefault();
    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      const formData = new FormData();
      formData.append('notes', feedbackData.notes);
      formData.append('status', feedbackData.status);
      // ✅ TAMBAHKAN INI - Backend memerlukan status_dari_sekretaris
      formData.append('status_dari_sekretaris', feedbackData.status);
      feedbackData.files.forEach(file => {
        formData.append('feedback_files', file);
      });
      const response = await api.post(`/${role}/disposisi/${id}/feedback`, formData);
      setFeedbackSuccess(true);
      setShowFeedbackForm(false);
      setFeedbackData({ notes: '', status: 'diproses', files: [] });
      // Refresh feedback data
      fetchDisposisiDetail();
      fetchFeedbackForDisposisi();
      toast.success('Feedback berhasil dikirim!');
    } catch (err) {
      setFeedbackError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setFeedbackLoading(false);
    }
  };
  // Handler untuk edit feedback
  const handleEditFeedbackChange = (e) => {
    const { name, value } = e.target;
    setEditFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    setEditFeedbackData(prev => ({
      ...prev,
      newFiles: files.slice(0, 5) // Maksimal 5 file
    }));
  };
  const handleRemoveExistingFile = (fileId) => {
    setEditFeedbackData(prev => ({
      ...prev,
      removeFileIds: [...prev.removeFileIds, fileId],
      existingFiles: prev.existingFiles.filter(file => file.id !== fileId)
    }));
  };
  const handleEditFeedbackSubmit = async (e, role = 'sekretaris') => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setFeedbackError(null);
      const formData = new FormData();
      formData.append('notes', editFeedbackData.notes);
      formData.append('status', editFeedbackData.status);
      formData.append('status_dari_sekretaris', editFeedbackData.status);
      // Tambahkan file baru
      editFeedbackData.newFiles.forEach(file => {
        formData.append('new_feedback_files', file);
      });
      // Tambahkan ID file yang akan dihapus
      editFeedbackData.removeFileIds.forEach(fileId => {
        formData.append('remove_file_ids', fileId);
      });
      const response = await api.put(`/${role}/feedback/${editingFeedbackId}`, formData);
      setEditingFeedbackId(null);
      setEditFeedbackData({
        notes: '',
        status: 'diproses',
        newFiles: [],
        removeFileIds: [],
        existingFiles: []
      });
      // Refresh feedback data
      fetchDisposisiDetail();
      fetchFeedbackForDisposisi();
      toast.success('Feedback berhasil diperbarui!');
    } catch (err) {
      setFeedbackError(err.message);
      toast.error(`Error: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };
  const cancelEditFeedback = () => {
    setEditingFeedbackId(null);
    setEditFeedbackData({
      notes: '',
      status: 'diproses',
      newFiles: [],
      removeFileIds: [],
      existingFiles: []
    });
    setFeedbackError(null);
  };
  // Fungsi untuk mengambil detail feedback untuk edit
  const fetchFeedbackForEdit = async (feedbackId, role = 'sekretaris') => {
    try {
      setEditLoading(true);
      const response = await api.get(`/${role}/feedback/${feedbackId}/edit`);
      const feedback = response.data.data;
      setEditFeedbackData({
        notes: feedback.notes || '',
        status: feedback.disposisi?.status || 'diproses',
        newFiles: [],
        removeFileIds: [],
        existingFiles: feedback.files || []
      });
      setEditingFeedbackId(feedbackId);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };
  const openImageModal = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };
  const getStatusConfig = (status) => {
    const statusConfigs = {
      'belum dibaca': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        icon: AlertCircle,
        label: 'Belum Dibaca'
      },
      'dibaca': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        icon: Eye,
        label: 'Sudah Dibaca'
      },
      'diterima': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        icon: Check,
        label: 'Diterima'
      },
      'diproses': {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-200',
        icon: Cog,
        label: 'Diproses'
      },
      'selesai': {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        border: 'border-purple-200',
        icon: Flag,
        label: 'Selesai'
      },
      'diteruskan': {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        icon: Forward,
        label: 'Diteruskan'
      }
    };
    return statusConfigs[status] || statusConfigs['belum dibaca'];
  };
  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const IconComponent = config.icon;
    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${config.bg} ${config.text} border ${config.border} shadow-sm`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {config.label}
      </div>
    );
  };
  const canAcceptDisposisi = () => {
    return disposisi &&
      disposisi.status === 'dibaca' &&
      disposisi.status_dari_sekretaris !== 'diterima' &&
      disposisi.status_dari_sekretaris !== 'diteruskan';
  };
  const canGiveFeedback = () => {
    return disposisi &&
      !disposisi.has_feedback &&
      (disposisi.status_dari_sekretaris === 'diterima' || disposisi.status === 'diproses');
  };
  const canForwardDisposisi = () => {
    return disposisi && (disposisi.status_dari_sekretaris === 'diterima');
  };
  useEffect(() => {
    if (disposisi) {
      fetchFeedbackForDisposisi();
      fetchSubordinateFeedback();
    }
  }, [disposisi?.id]);
  // No data state
  if (!disposisi) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: '#6D4C41' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#2E2A27' }}>Data Tidak Ditemukan</h3>
          <p className="mb-6" style={{ color: '#6D4C41' }}>Disposisi tidak ditemukan atau tidak dapat diakses langsung</p>
          <button
            onClick={() => navigate('/sekretaris')}
            className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg border border-[#EDE6E3]"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen p-4 md:p-6 rounded-2xl" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center mb-6 p-2.5 rounded-xl hover:bg-[#FDFCFB] transition-all duration-200 border border-[#EDE6E3]"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" style={{ color: '#6D4C41' }} />
            <span className="font-semibold" style={{ color: '#6D4C41' }}>Kembali</span>
          </button>
          <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] border-2 border-[#EDE6E3] shadow-md p-6 rounded-2xl">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex-1">
                <h1 className="lg:text-xl text-lg font-bold" style={{ color: '#2E2A27' }}>Detail Disposisi</h1>
                <p className="text-sm font-medium mt-1 mb-3" style={{ color: '#6D4C41' }}>Kelola dan berikan feedback terhadap disposisi yang diterima</p>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloadLoading}
                  className={`group inline-flex items-center px-6 py-3 shadow-lg rounded-xl font-semibold transition-all duration-200 border border-[#EDE6E3] shadow-sm${downloadLoading
                    ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-black opacity-75 cursor-not-allowed'
                    : 'bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-700 hover:to-gray-900 text-black hover:shadow-md hover:-translate-y-0.5'
                    }`}
                >
                  {downloadLoading ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Mengunduh...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Download PDF
                    </>
                  )}
                </button>
              </div>

              {disposisi && (
                <div className="flex flex-col items-center lg:items-end space-y-4">
                  {getStatusBadge(disposisi.status_dari_sekretaris)}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {canAcceptDisposisi() && (
                      <button
                        onClick={handleAcceptDisposisi}
                        disabled={acceptLoading}
                        className={`
                          group inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-[#EDE6E3] shadow-sm
                          ${acceptLoading
                            ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white opacity-75 cursor-not-allowed'
                            : 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white hover:shadow-md hover:-translate-y-0.5'
                          }
                        `}
                      >
                        {acceptLoading ? (
                          <>
                            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Memproses...
                          </>
                        ) : (
                          <>
                            <Check className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                            Terima Disposisi
                          </>
                        )}
                      </button>
                    )}

                    {canForwardDisposisi() && !showForwardModal && !showFeedbackForm && !editingFeedbackId && (
                      <button
                        onClick={() => setShowForwardModal(true)}
                        className="group inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] hover:from-[#2E7D32] hover:to-[#1B5E20] text-white font-semibold hover:shadow-md hover:-translate-y-0.5 shadow-sm transition-all duration-200 border border-[#EDE6E3]"
                      >
                        <Forward className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Teruskan
                      </button>
                    )}
                    {canGiveFeedback() && !showForwardModal && !showFeedbackForm && !editingFeedbackId && (
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="group inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-br from-[#2196F3] to-[#0D47A1] hover:from-[#0D47A1] hover:to-[#002171] text-white font-semibold hover:shadow-md hover:-translate-y-0.5 shadow-sm transition-all duration-200 border border-[#EDE6E3]"
                      >
                        <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Beri Feedback
                      </button>
                    )}
                  </div>
                  {acceptError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span className="font-medium">{acceptError}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        {disposisi && (
          <div className="space-y-8">
            {/* Forward Modal Component */}
            <ForwardModal
              isOpen={showForwardModal}
              onClose={() => setShowForwardModal(false)}
              disposisi={disposisi}
              onSuccess={handleForwardSuccess}
            />
            {/* Form Feedback */}
            {showFeedbackForm && !showForwardModal && !editingFeedbackId && (
              <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-[#EDE6E3] p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#2196F3] to-[#0D47A1] rounded-xl shadow-md mr-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Beri Feedback</h3>
                    <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Berikan tanggapan dan update status disposisi</p>
                  </div>
                </div>
                {feedbackError && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium">{feedbackError}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                      Catatan Feedback *
                    </label>
                    <textarea
                      name="notes"
                      value={feedbackData.notes}
                      onChange={handleFeedbackChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] resize-none text-[#2E2A27] shadow-sm"
                      placeholder="Masukkan catatan feedback Anda..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                      Status Disposisi *
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          value="diproses"
                          checked={feedbackData.status === 'diproses'}
                          onChange={handleFeedbackChange}
                          className="w-4 h-4 text-[#D4A373] border-[#EDE6E3] focus:ring-[#D4A373]"
                        />
                        <span className="ml-3 font-medium" style={{ color: '#6D4C41' }}>Diproses</span>
                      </label>
                      <label className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="status"
                          value="selesai"
                          checked={feedbackData.status === 'selesai'}
                          onChange={handleFeedbackChange}
                          className="w-4 h-4 text-[#D4A373] border-[#EDE6E3] focus:ring-[#D4A373]"
                        />
                        <span className="ml-3 font-medium" style={{ color: '#6D4C41' }}>Selesai</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                      Lampiran File (maks. 5 file)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] shadow-sm"
                    />
                    {feedbackData.files.length > 0 && (
                      <div className="mt-2 text-sm bg-[#FDFCFB] px-3 py-2 rounded-lg border border-[#EDE6E3] shadow-sm" style={{ color: '#6D4C41' }}>
                        <Paperclip className="w-4 h-4 inline mr-2" />
                        {feedbackData.files.length} file dipilih
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-6 py-3 border border-[#EDE6E3] rounded-xl text-[#2E2A27] hover:bg-[#FDFCFB] font-semibold transition-colors shadow-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={feedbackLoading}
                      className={`
                        group inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-[#EDE6E3] shadow-sm
                        ${feedbackLoading
                          ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white opacity-75 cursor-not-allowed'
                          : 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white hover:shadow-md hover:-translate-y-0.5'
                        }
                      `}
                    >
                      {feedbackLoading ? (
                        <>
                          <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                          Kirim Feedback
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            {/* Informasi Surat dan Disposisi */}
            <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-[#EDE6E3] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informasi Surat */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md mr-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Informasi Surat</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Nomor Surat</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{disposisi.nomor_surat || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Asal Instansi</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{disposisi.asal_instansi || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Tanggal Surat</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{new Date(disposisi.tanggal_surat).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Diterima Tanggal</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{new Date(disposisi.diterima_tanggal).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Nomor Agenda</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{disposisi.nomor_agenda || '-'}</p>
                    </div>
                  </div>
                </div>
                {/* Informasi Disposisi */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-xl shadow-md mr-4">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Informasi Disposisi</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <p className="text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Status</p>
                      <div className="inline-block">
                        {getStatusBadge(disposisi.status_dari_sekretaris)}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Sifat</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{disposisi.sifat || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Disposisi Kepada Jabatan</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{disposisi.disposisi_kepada_jabatan}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Diteruskan Kepada</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{disposisi.diteruskan_kepada_nama || disposisi.diteruskan_kepada_jabatan}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                        <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>Tanggal Disposisi</p>
                      </div>
                      <p className="font-semibold" style={{ color: '#2E2A27' }}>{formatIndonesianDate(disposisi.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Content Sections */}
              <div className="mt-8 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                  <h4 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#2E2A27' }}>
                    <MessageSquare className="w-5 h-5 mr-3" style={{ color: '#6D4C41' }} />
                    Dengan hormat harap:
                  </h4>
                  <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-lg shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2E2A27' }}>
                      {disposisi.dengan_hormat_harap}
                    </p>
                  </div>
                </div>
                {disposisi.catatan && (
                  <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                    <h4 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#2E2A27' }}>
                      <User className="w-5 h-5 mr-3" style={{ color: '#6D4C41' }} />
                      Catatan dari Kepala
                    </h4>
                    <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-lg shadow-sm">
                      <p className="leading-relaxed" style={{ color: '#2E2A27' }}>{disposisi.catatan}</p>
                    </div>
                  </div>
                )}
                {disposisi.catatan_kabid && (
                  <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                    <h4 className="text-lg font-bold mb-4 flex items-center" style={{ color: '#2E2A27' }}>
                      <User className="w-5 h-5 mr-3" style={{ color: '#6D4C41' }} />
                      Keterangan dari Kabid
                    </h4>
                    <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-lg shadow-sm">
                      <p className="leading-relaxed" style={{ color: '#2E2A27' }}>{disposisi.catatan_kabid}</p>
                    </div>
                  </div>
                )}
                {disposisi.surat_masuk?.has_photos && (
                  <div className="bg-white rounded-xl border border-[#EDE6E3] p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <FileText className="w-6 h-6 mr-3" style={{ color: '#6D4C41' }} />
                      <h3 className="text-lg font-bold" style={{ color: '#2E2A27' }}>Lampiran</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {disposisi.surat_masuk.photos.map((photo, index) => (
                        <div key={photo.id} className="relative rounded-xl overflow-hidden cursor-pointer border border-[#EDE6E3] hover:scale-105 transition-all duration-300 shadow-sm">
                          <div
                            className=""
                            onClick={() => openImageModal(photo.url)}
                          >
                            <img
                              src={photo.url}
                              alt={`Surat foto ${index + 1}`}
                              className="w-32 h-32 object-cover cursor-pointer transition-all"
                              loading="lazy"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Feedback dari Bawahan */}
            {disposisi.diteruskan_kepada_user_id && (
              <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-[#EDE6E3] p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#2196F3] to-[#0D47A1] rounded-xl shadow-md mr-4">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Feedback dari Bawahan</h3>
                    <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Tanggapan dari bawahan yang dituju disposisi</p>
                  </div>
                </div>
                {subFeedbackLoading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D4A373]"></div>
                  </div>
                ) : subFeedbackError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span className="font-medium">{subFeedbackError}</span>
                    </div>
                  </div>
                ) : !subordinateFeedback ? (
                  <div className="text-center py-10" style={{ color: '#6D4C41' }}>
                    Belum ada feedback dari bawahan atau bawahan belum memberikan feedback.
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                    {/* Header Feedback */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm" style={{ color: '#6D4C41' }}>
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Oleh: {subordinateFeedback.user_jabatan || subordinateFeedback.disposisi?.diteruskan_kepada_jabatan || 'Bawahan'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Dibuat: {new Date(subordinateFeedback.created_at).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Asia/Jakarta'
                            })}
                          </div>
                          {subordinateFeedback.updated_at && subordinateFeedback.updated_at !== subordinateFeedback.created_at && (
                            <div className="flex items-center bg-[#FDFCFB] text-[#6D4C41] px-3 py-1 rounded-lg border border-[#EDE6E3]">
                              <Clock className="w-3 h-3 mr-1" />
                              Diperbarui: {new Date(subordinateFeedback.updated_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Jakarta'
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Tampilan feedback */}
                    <div className="space-y-4">
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Status:</p>
                        {getStatusBadge(disposisi.status_dari_bawahan || 'diproses')}
                      </div>
                      <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-xl shadow-sm">
                        <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2E2A27' }}>{subordinateFeedback.notes}</p>
                      </div>
                      {subordinateFeedback.has_files && (
                        <div>
                          <div className="flex items-center mb-4">
                            <Paperclip className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                            <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>
                              Lampiran ({subordinateFeedback.file_count} file)
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {subordinateFeedback.files.map((file) => (
                              <div key={file.id} className="relative cursor-pointer rounded-xl hover:scale-105 transition-all duration-300 shadow-sm border border-[#EDE6E3] overflow-hidden">
                                <button
                                  onClick={() => openImageModal(file.url)}
                                  className="w-32 h-32 cursor-pointer"
                                >
                                  {file.type && file.type.startsWith('image/') ? (
                                    <img
                                      src={file.url}
                                      alt={file.filename}
                                      className="w-32 h-32 object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#FDFCFB]">
                                      <FileText className="w-8 h-8 text-[#D9534F]" />
                                      <p className='text-[#D9534F] text-xs font-bold text-center break-words'>{file.filename.split('.').pop().toUpperCase()}</p>
                                    </div>
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Feedback yang Telah Dikirim */}
            {feedbackList.length > 0 && (
              <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-[#EDE6E3] p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-xl shadow-md mr-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Feedback yang Telah Dikirim</h3>
                    <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Riwayat tanggapan yang telah Anda berikan</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {feedbackList.map((feedback) => (
                    <div key={feedback.id} className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                      {/* Header Feedback */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm" style={{ color: '#6D4C41' }}>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              Dibuat: {new Date(feedback.created_at).toLocaleString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                timeZone: 'Asia/Jakarta'
                              })}
                            </div>
                            {feedback.updated_at && feedback.updated_at !== feedback.created_at && (
                              <div className="flex items-center bg-[#FDFCFB] text-[#6D4C41] px-3 py-1 rounded-lg border border-[#EDE6E3]">
                                <Clock className="w-3 h-3 mr-1" />
                                Diperbarui: {new Date(feedback.updated_at).toLocaleString('id-ID', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  timeZone: 'Asia/Jakarta'
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                        {!editingFeedbackId && !showFeedbackForm && !showForwardModal && (
                          <button
                            onClick={() => fetchFeedbackForEdit(feedback.id)}
                            disabled={editLoading}
                            className="group inline-flex items-center px-4 py-2 bg-gradient-to-br from-[#2196F3] to-[#0D47A1] hover:from-[#0D47A1] hover:to-[#002171] text-white rounded-xl transition-all duration-200 hover:shadow-md border border-[#EDE6E3]"
                            title="Edit Feedback"
                          >
                            {editLoading ? (
                              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="font-semibold">Edit</span>
                          </button>
                        )}
                      </div>
                      {/* Jika sedang dalam mode edit untuk feedback ini */}
                      {editingFeedbackId === feedback.id ? (
                        <div className="space-y-6">
                          {feedbackError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                              <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="font-medium">{feedbackError}</span>
                              </div>
                            </div>
                          )}
                          <form onSubmit={handleEditFeedbackSubmit} className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                                Catatan Feedback *
                              </label>
                              <textarea
                                name="notes"
                                value={editFeedbackData.notes}
                                onChange={handleEditFeedbackChange}
                                required
                                rows="5"
                                className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] resize-none text-[#2E2A27] shadow-sm"
                                placeholder="Masukkan catatan feedback Anda..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                                Status Disposisi *
                              </label>
                              <div className="flex gap-6">
                                <label className="flex items-center cursor-pointer group">
                                  <input
                                    type="radio"
                                    name="status"
                                    value="diproses"
                                    checked={editFeedbackData.status === 'diproses'}
                                    onChange={handleEditFeedbackChange}
                                    className="w-4 h-4 text-[#D4A373] border-[#EDE6E3] focus:ring-[#D4A373]"
                                  />
                                  <span className="ml-3 font-medium" style={{ color: '#6D4C41' }}>Diproses</span>
                                </label>
                                <label className="flex items-center cursor-pointer group">
                                  <input
                                    type="radio"
                                    name="status"
                                    value="selesai"
                                    checked={editFeedbackData.status === 'selesai'}
                                    onChange={handleEditFeedbackChange}
                                    className="w-4 h-4 text-[#D4A373] border-[#EDE6E3] focus:ring-[#D4A373]"
                                  />
                                  <span className="ml-3 font-medium" style={{ color: '#6D4C41' }}>Selesai</span>
                                </label>
                              </div>
                            </div>
                            {/* File yang sudah ada */}
                            {editFeedbackData.existingFiles.length > 0 && (
                              <div>
                                <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                                  File yang sudah ada
                                </label>
                                <div className="space-y-3">
                                  {editFeedbackData.existingFiles.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between bg-[#FDFCFB] p-4 rounded-xl border border-[#EDE6E3] shadow-sm">
                                      <div className="flex items-center">
                                        <div className="p-2 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-lg mr-3">
                                          <FileText className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-medium" style={{ color: '#2E2A27' }}>{file.filename}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExistingFile(file.id)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>
                                Tambah File Baru (maks. 5 file)
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={handleEditFileChange}
                                accept="image/*,application/pdf"
                                className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] shadow-sm"
                              />
                              {editFeedbackData.newFiles.length > 0 && (
                                <div className="mt-2 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm" style={{ color: '#2E7D32' }}>
                                  <Paperclip className="w-4 h-4 inline mr-2" />
                                  {editFeedbackData.newFiles.length} file baru dipilih
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end space-x-4 pt-4 border-t border-[#EDE6E3]">
                              <button
                                type="button"
                                onClick={cancelEditFeedback}
                                className="px-6 py-3 border border-[#EDE6E3] rounded-xl text-[#2E2A27] hover:bg-[#FDFCFB] font-semibold transition-colors shadow-sm flex items-center"
                              >
                                <X className="w-4 h-4 inline mr-2" />
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={editLoading}
                                className={`
                                  group inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-[#EDE6E3] shadow-sm
                                  ${editLoading
                                    ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white opacity-75 cursor-not-allowed'
                                    : 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white hover:shadow-md hover:-translate-y-0.5'
                                  }
                                `}
                              >
                                {editLoading ? (
                                  <>
                                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Memperbarui...
                                  </>
                                ) : (
                                  <>
                                    <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                    Perbarui Feedback
                                  </>
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        /* Tampilan normal feedback */
                        <div className="space-y-4">
                          <div className="mb-4">
                            <p className="text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Status:</p>
                            {getStatusBadge(feedback.disposisi?.status || 'diproses')}
                          </div>
                          <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-xl shadow-sm">
                            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: '#2E2A27' }}>{feedback.notes}</p>
                          </div>
                          {feedback.has_files && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Paperclip className="w-4 h-4 mr-2" style={{ color: '#6D4C41' }} />
                                <p className="text-sm font-semibold" style={{ color: '#6D4C41' }}>
                                  Lampiran ({feedback.file_count} file)
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {feedback.files.map((file) => (
                                  <div key={file.id} className="relative cursor-pointer rounded-xl hover:scale-105 transition-all duration-300 shadow-sm border border-[#EDE6E3] overflow-hidden">
                                    <button
                                      onClick={() => openImageModal(file.url)}
                                      className="w-32 h-32 cursor-pointer"
                                    >
                                      {file.type && file.type.startsWith('image/') ? (
                                        <img
                                          src={file.url}
                                          alt={file.filename}
                                          className="w-32 h-32 object-cover"
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#FDFCFB]">
                                          <FileText className="w-8 h-8 text-[#D9534F]" />
                                          <p className='text-[#D9534F] font-bold'>PDF</p>
                                        </div>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export default SekretarisDisposisiDetail;