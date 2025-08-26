import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { staffDisposisiService } from '../../services/staffDisposisiService';
import { FileText, Edit, Trash2, X, ArrowLeft, Check, MessageSquare, Paperclip, Calendar, Building, User, AlertCircle, Eye, Cog, Flag, Send, Save, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';

const StaffDisposisiDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [disposisi, setDisposisi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState(null);
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
      const response = await staffDisposisiService.getDisposisiDetail(id);
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

  useEffect(() => {
    if (disposisi) {
      fetchFeedbackForDisposisi();
    }
  }, [disposisi]);

  const fetchFeedbackForDisposisi = async () => {
    try {
      console.log('🔍 Starting fetchFeedbackForDisposisi for disposisi:', disposisi?.id);
      setFeedbackLoading(true);
      const response = await staffDisposisiService.getMyFeedback();
      console.log('✅ Raw feedback response:', response);
      // Filter feedback untuk disposisi ini saja
      const filteredFeedback = response.data.filter(
        fb => fb.disposisi_id === disposisi.id
      );
      console.log('✅ Filtered feedback:', filteredFeedback);
      setFeedbackList(filteredFeedback);
    } catch (err) {
      console.error('❌ Error fetching feedback:', err);
      console.error('❌ Error message:', err.message);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Fungsi untuk mengambil detail feedback untuk edit
  const fetchFeedbackForEdit = async (feedbackId) => {
    try {
      setEditLoading(true);
      const response = await staffDisposisiService.getFeedbackForEdit(feedbackId);
      const feedback = response.data;
      setEditFeedbackData({
        notes: feedback.notes || '',
        status: feedback.disposisi?.status_dari_bawahan || 'diproses',
        newFiles: [],
        removeFileIds: [],
        existingFiles: feedback.files || []
      });
      setEditingFeedbackId(feedbackId);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAcceptDisposisi = async () => {
    try {
      setAcceptLoading(true);
      setAcceptError(null);
      const response = await staffDisposisiService.terimaDisposisi(id);
      setDisposisi(prev => ({
        ...prev,
        status_dari_bawahan: 'diterima'
      }));
      alert('Disposisi berhasil diterima!');
    } catch (err) {
      setAcceptError(err.message);
      alert(`Error: ${err.message}`);
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setFeedbackLoading(true);
      setFeedbackError(null);
      const formData = new FormData();
      formData.append('notes', feedbackData.notes);
      formData.append('status', feedbackData.status);
      formData.append('status_dari_bawahan', feedbackData.status);
      feedbackData.files.forEach(file => {
        formData.append('feedback_files', file);
      });
      const response = await staffDisposisiService.submitFeedback(id, formData);
      setFeedbackSuccess(true);
      setShowFeedbackForm(false);
      setFeedbackData({ notes: '', status: 'diproses', files: [] });
      // Refresh data disposisi
      fetchDisposisiDetail();
      fetchFeedbackForDisposisi();
      alert('Feedback berhasil dikirim!');
    } catch (err) {
      setFeedbackError(err.message);
      alert(`Error: ${err.message}`);
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

  const handleEditFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setFeedbackError(null);
      const formData = new FormData();
      formData.append('notes', editFeedbackData.notes);
      formData.append('status', editFeedbackData.status);
      formData.append('status_dari_bawahan', editFeedbackData.status);
      // Tambahkan file baru
      editFeedbackData.newFiles.forEach(file => {
        formData.append('new_feedback_files', file);
      });
      // Tambahkan ID file yang akan dihapus
      editFeedbackData.removeFileIds.forEach(fileId => {
        formData.append('remove_file_ids', fileId);
      });
      const response = await staffDisposisiService.updateFeedback(editingFeedbackId, formData);
      setEditingFeedbackId(null);
      setEditFeedbackData({
        notes: '',
        status: 'diproses',
        newFiles: [],
        removeFileIds: [],
        existingFiles: []
      });
      // Refresh data
      fetchDisposisiDetail();
      fetchFeedbackForDisposisi();
      alert('Feedback berhasil diperbarui!');
    } catch (err) {
      setFeedbackError(err.message);
      alert(`Error: ${err.message}`);
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

  const openImageModal = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const getStatusConfig = (status) => {
    const statusConfigs = {
      'belum dibaca': {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        text: 'text-red-800',
        icon: AlertCircle,
        label: 'Belum Dibaca',
        ring: 'ring-red-200'
      },
      'dibaca': {
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-100',
        text: 'text-amber-800',
        icon: Eye,
        label: 'Sudah Dibaca',
        ring: 'ring-amber-200'
      },
      'diterima': {
        bg: 'bg-gradient-to-r from-emerald-50 to-green-100',
        text: 'text-emerald-800',
        icon: Check,
        label: 'Diterima',
        ring: 'ring-emerald-200'
      },
      'diproses': {
        bg: 'bg-gradient-to-r from-blue-50 to-indigo-100',
        text: 'text-blue-800',
        icon: Cog,
        label: 'Diproses',
        ring: 'ring-blue-200'
      },
      'selesai': {
        bg: 'bg-gradient-to-r from-purple-50 to-violet-100',
        text: 'text-purple-800',
        icon: Flag,
        label: 'Selesai',
        ring: 'ring-purple-200'
      }
    };
    return statusConfigs[status] || statusConfigs['belum dibaca'];
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const IconComponent = config.icon;
    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${config.bg} ${config.text} ring-1 ${config.ring} shadow-sm`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {config.label}
      </div>
    );
  };

  const canAcceptDisposisi = () => {
    return disposisi && disposisi.status_dari_bawahan === 'dibaca';
  };

  const canGiveFeedback = () => {
    return disposisi &&
      !disposisi.has_feedback && // Hide feedback button if has_feedback is true
      (disposisi.status_dari_bawahan === 'diterima' || disposisi.status_dari_bawahan === 'diproses');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D4A373]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFCFB' }}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-[#D9534F] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#2E2A27] mb-2">Error</h3>
          <p className="text-[#6D4C41] mb-6">{error}</p>
          <button
            onClick={fetchDisposisiDetail}
            className="bg-white text-[#2E2A27] px-4 py-2 rounded-lg hover:bg-[#EDE6E3] transition-colors border border-[#EDE6E3] shadow-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="p-4 md:p-6">
        {/* Header Section */}
        <div className="mb-7">
          <button
            onClick={() => navigate(-1)}
            className="group inline-flex items-center text-[#6D4C41] hover:text-[#2E2A27] mb-6 p-2 rounded-lg hover:bg-white transition-all duration-200 border border-[#EDE6E3] shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Kembali</span>
          </button>
          <div className="bg-gradient-to-bl from-white via-white to-[#FDFCFB] border border-[#EDE6E3] shadow-lg p-6 rounded-3xl">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
              <div className="flex-1">
                <h1 className="lg:text-lg text-base font-bold text-[#2E2A27] mb-2">Detail Disposisi</h1>
                <p className="text-[#6D4C41]">Kelola dan berikan feedback terhadap disposisi yang diterima</p>
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
                  {getStatusBadge(disposisi.status_dari_bawahan)}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {canAcceptDisposisi() && (
                      <button
                        onClick={handleAcceptDisposisi}
                        disabled={acceptLoading}
                        className={`
                          group inline-flex items-center px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 border border-[#EDE6E3]
                          ${acceptLoading
                            ? 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] opacity-75 cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] hover:shadow-xl hover:scale-105'
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
                    {canGiveFeedback() && !showFeedbackForm && !editingFeedbackId && (
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="group inline-flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4A373] to-[#6D4C41] text-white font-semibold hover:from-[#6D4C41] hover:to-[#2E2A27] hover:shadow-xl hover:scale-105 shadow-lg transition-all duration-200 border border-[#EDE6E3]"
                      >
                        <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Beri Feedback
                      </button>
                    )}
                  </div>
                  {acceptError && (
                    <div className="bg-[#FDFCFB] border border-[#EDE6E3] text-[#D9534F] px-4 py-3 rounded-xl shadow-sm">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="text-sm">{acceptError}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {disposisi && (
          <div className="space-y-7">
            {/* Form Feedback */}
            {showFeedbackForm && !editingFeedbackId && (
              <div className="bg-gradient-to-bl from-white via-white to-[#FDFCFB] rounded-3xl shadow-lg border border-[#EDE6E3] p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white rounded-xl mr-4 border border-[#EDE6E3] shadow-sm">
                    <MessageSquare className="w-6 h-6 text-[#6D4C41]" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-bold text-[#2E2A27]">Beri Feedback</h3>
                    <p className="text-[#6D4C41]">Berikan tanggapan dan update status disposisi</p>
                  </div>
                </div>
                {feedbackError && (
                  <div className="mb-6 bg-[#FDFCFB] border border-[#EDE6E3] text-[#D9534F] px-4 py-3 rounded-xl">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
                      Catatan Feedback *
                    </label>
                    <textarea
                      name="notes"
                      value={feedbackData.notes}
                      onChange={handleFeedbackChange}
                      required
                      rows="5"
                      className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent resize-none text-[#2E2A27] shadow-sm"
                      placeholder="Masukkan catatan feedback Anda..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
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
                        <span className="ml-3 text-[#6D4C41] group-hover:text-[#2E2A27] font-medium">Diproses</span>
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
                        <span className="ml-3 text-[#6D4C41] group-hover:text-[#2E2A27] font-medium">Selesai</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
                      Lampiran File (maks. 5 file)
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                      className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent shadow-sm"
                    />
                    {feedbackData.files.length > 0 && (
                      <div className="mt-2 text-sm text-[#6D4C41] bg-white px-3 py-2 rounded-lg border border-[#EDE6E3] shadow-sm">
                        <Paperclip className="w-4 h-4 inline mr-2" />
                        {feedbackData.files.length} file dipilih
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackForm(false)}
                      className="px-6 py-3 border border-[#EDE6E3] rounded-xl text-[#6D4C41] hover:bg-white font-medium transition-colors bg-white shadow-sm"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={feedbackLoading}
                      className={`
                        group inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 border border-[#EDE6E3]
                        ${feedbackLoading
                          ? 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] opacity-75 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] hover:shadow-xl hover:scale-105'
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
            <div className="bg-gradient-to-bl from-white via-white to-[#FDFCFB] rounded-3xl shadow-lg border border-[#EDE6E3] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informasi Surat */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-white rounded-xl mr-4 border border-[#EDE6E3] shadow-sm">
                      <FileText className="w-6 h-6 text-[#6D4C41]" />
                    </div>
                    <h3 className="text-base lg:text-lg font-bold text-[#2E2A27]">Informasi Surat</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Nomor Surat</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{disposisi.nomor_surat || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Building className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Asal Instansi</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{disposisi.asal_instansi || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Tanggal Surat</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{new Date(disposisi.tanggal_surat).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Diterima Tanggal</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{new Date(disposisi.diterima_tanggal).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <FileText className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Nomor Agenda</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{disposisi.nomor_agenda || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Informasi Disposisi */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-white rounded-xl mr-4 border border-[#EDE6E3] shadow-sm">
                      <MessageSquare className="w-6 h-6 text-[#6D4C41]" />
                    </div>
                    <h3 className="text-base lg:text-lg font-bold text-[#2E2A27]">Informasi Disposisi</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <p className="text-sm font-medium text-[#6D4C41] mb-2">Status</p>
                      <div className="inline-block">
                        {getStatusBadge(disposisi.status_dari_bawahan)}
                      </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Sifat</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{disposisi.sifat || '-'}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Dari Jabatan</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{disposisi.disposisi_kepada_jabatan}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <User className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Diteruskan Kepada</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{disposisi.diteruskan_kepada_nama || disposisi.diteruskan_kepada_jabatan}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-[#EDE6E3] shadow-sm">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-[#6D4C41] mr-2" />
                        <p className="text-sm font-medium text-[#6D4C41]">Tanggal Disposisi</p>
                      </div>
                      <p className="font-semibold text-[#2E2A27]">{new Date(disposisi.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="mt-8 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                  <h4 className="text-base font-bold text-[#2E2A27] mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-3 text-[#6D4C41]" />
                    Dengan hormat harap:
                  </h4>
                  <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-[#2E2A27] leading-relaxed">
                      {disposisi.dengan_hormat_harap}
                    </p>
                  </div>
                </div>
                {disposisi.catatan && (
                  <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                    <h4 className="text-base font-bold text-[#2E2A27] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-3 text-[#6D4C41]" />
                      Catatan dari Kepala
                    </h4>
                    <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-lg">
                      <p className="text-[#2E2A27] leading-relaxed">{disposisi.catatan}</p>
                    </div>
                  </div>
                )}
                {disposisi.catatan_kabid && (
                  <div className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                    <h4 className="text-base font-bold text-[#2E2A27] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-3 text-[#6D4C41]" />
                      Keterangan dari Kabid
                    </h4>
                    <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-lg">
                      <p className="text-[#2E2A27] leading-relaxed">{disposisi.catatan_kabid}</p>
                    </div>
                  </div>
                )}
                {disposisi.surat_masuk?.has_photos && (
                  <div className="bg-white rounded-xl border border-[#EDE6E3] p-6 shadow-sm">
                    <div className="flex items-center mb-4">
                      <FileText className="w-6 h-6 text-[#6D4C41] mr-3" />
                      <h3 className="text-base font-bold text-[#2E2A27]">Lampiran</h3>
                    </div>
                    <div className="flex flex-wrap gap-x-3">
                      {disposisi.surat_masuk.photos.map((photo, index) => (
                        <div key={photo.id} className="relative rounded-xl overflow-hidden cursor-pointer border-[#EDE6E3] border hover:scale-105 transition-all duration-300 shadow-sm">
                          <div
                            className=""
                            onClick={() => openImageModal(photo.url)}
                          >
                            <img
                              src={photo.url}
                              alt={`Surat foto ${index + 1}`}
                              className="w-30 h-30 object-cover cursor-pointer transition-all"
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

            {/* Feedback yang Telah Dikirim */}
            {feedbackList.length > 0 && (
              <div className="bg-gradient-to-bl from-white via-white to-[#FDFCFB] rounded-3xl shadow-lg border border-[#EDE6E3] p-6">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white rounded-xl mr-4 border border-[#EDE6E3] shadow-sm">
                    <MessageSquare className="w-6 h-6 text-[#6D4C41]" />
                  </div>
                  <div>
                    <h3 className="text-base lg:text-lg font-bold text-[#2E2A27]">Feedback yang Telah Dikirim</h3>
                    <p className="text-[#6D4C41]">Riwayat tanggapan yang telah Anda berikan</p>
                  </div>
                </div>
                <div className="space-y-6">
                  {feedbackList.map((feedback) => (
                    <div key={feedback.id} className="bg-white rounded-xl p-6 border border-[#EDE6E3] shadow-sm">
                      {/* Header Feedback */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-[#6D4C41]">
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
                              <div className="flex items-center bg-[#FDFCFB] text-[#6D4C41] px-3 py-1 rounded-lg border border-[#EDE6E3] shadow-sm">
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
                        {!editingFeedbackId && !showFeedbackForm && (
                          <button
                            onClick={() => fetchFeedbackForEdit(feedback.id)}
                            disabled={editLoading}
                            className="group inline-flex items-center px-4 py-2 bg-white hover:bg-[#FDFCFB] text-[#6D4C41] rounded-xl transition-all duration-200 hover:shadow-md border border-[#EDE6E3] shadow-sm"
                            title="Edit Feedback"
                          >
                            {editLoading ? (
                              <div className="w-4 h-4 mr-2 border-2 border-[#6D4C41] border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            )}
                            <span className="font-medium">Edit</span>
                          </button>
                        )}
                      </div>

                      {/* Jika sedang dalam mode edit untuk feedback ini */}
                      {editingFeedbackId === feedback.id ? (
                        <div className="space-y-6">
                          {feedbackError && (
                            <div className="bg-[#FDFCFB] border border-[#EDE6E3] text-[#D9534F] px-4 py-3 rounded-xl">
                              <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span>{feedbackError}</span>
                              </div>
                            </div>
                          )}
                          <form onSubmit={handleEditFeedbackSubmit} className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
                                Catatan Feedback *
                              </label>
                              <textarea
                                name="notes"
                                value={editFeedbackData.notes}
                                onChange={handleEditFeedbackChange}
                                required
                                rows="5"
                                className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent resize-none text-[#2E2A27] shadow-sm"
                                placeholder="Masukkan catatan feedback Anda..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
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
                                  <span className="ml-3 text-[#6D4C41] group-hover:text-[#2E2A27] font-medium">Diproses</span>
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
                                  <span className="ml-3 text-[#6D4C41] group-hover:text-[#2E2A27] font-medium">Selesai</span>
                                </label>
                              </div>
                            </div>

                            {/* File yang sudah ada */}
                            {editFeedbackData.existingFiles.length > 0 && (
                              <div>
                                <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
                                  File yang sudah ada
                                </label>
                                <div className="space-y-3">
                                  {editFeedbackData.existingFiles.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#EDE6E3] shadow-sm">
                                      <div className="flex items-center">
                                        <div className="p-2 bg-[#FDFCFB] rounded-lg mr-3 border border-[#EDE6E3] shadow-sm">
                                          <FileText className="w-4 h-4 text-[#6D4C41]" />
                                        </div>
                                        <span className="text-[#6D4C41] font-medium">{file.filename}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveExistingFile(file.id)}
                                        className="p-2 text-[#D9534F] hover:text-[#B52B27] hover:bg-[#D9534F]/10 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-semibold text-[#6D4C41] mb-3">
                                Tambah File Baru (maks. 5 file)
                              </label>
                              <input
                                type="file"
                                multiple
                                onChange={handleEditFileChange}
                                accept="image/*,application/pdf"
                                className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent shadow-sm"
                              />
                              {editFeedbackData.newFiles.length > 0 && (
                                <div className="mt-2 text-sm text-[#4CAF50] bg-[#4CAF50]/10 px-3 py-2 rounded-lg border border-[#4CAF50]/20 shadow-sm">
                                  <Paperclip className="w-4 h-4 inline mr-2" />
                                  {editFeedbackData.newFiles.length} file baru dipilih
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end space-x-4 pt-4 border-t border-[#EDE6E3]">
                              <button
                                type="button"
                                onClick={cancelEditFeedback}
                                className="px-6 py-3 border border-[#EDE6E3] rounded-xl text-[#6D4C41] hover:bg-white font-medium transition-colors bg-white shadow-sm"
                              >
                                <X className="w-4 h-4 inline mr-2" />
                                Batal
                              </button>
                              <button
                                type="submit"
                                disabled={editLoading}
                                className={`
                                  group inline-flex items-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all duration-200 border border-[#EDE6E3]
                                  ${editLoading
                                    ? 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] opacity-75 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] hover:shadow-xl hover:scale-105'
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
                            <p className="text-sm font-medium text-[#6D4C41] mb-2">Status:</p>
                            {getStatusBadge(feedback.disposisi?.status_dari_bawahan || 'diproses')}
                          </div>
                          <div className="bg-[#FDFCFB] border border-[#EDE6E3] p-4 rounded-xl mb-4">
                            <p className="text-[#2E2A27] whitespace-pre-wrap leading-relaxed">{feedback.notes}</p>
                          </div>
                          {feedback.has_files && (
                            <div>
                              <div className="flex items-center mb-4">
                                <Paperclip className="w-4 h-4 mr-2 text-[#6D4C41]" />
                                <p className="text-sm font-medium text-[#6D4C41]">
                                  Lampiran ({feedback.file_count} file)
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-x-3">
                                {feedback.files.map((file) => (
                                  <div key={file.id} className="relative cursor-pointer rounded-xl hover:scale-105 transition-all duration-300 hover:shadow-lg border-[#EDE6E3] shadow-lg border overflow-hidden">
                                    <button
                                      onClick={() => openImageModal(file.url)}
                                      className="w-30 h-30 cursor-pointer"
                                    >
                                      {file.type && file.type.startsWith('image/') ? (
                                        <img
                                          src={file.url}
                                          alt={file.filename}
                                          className=""
                                          loading="lazy"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-white">
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

export default StaffDisposisiDetail;
