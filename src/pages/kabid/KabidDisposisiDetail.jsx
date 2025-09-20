import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
} from 'lucide-react';
import ForwardModal from '../../components/Kabid/ForwardModal';
import toast from 'react-hot-toast';
import { atasanDisposisiService } from '../../services/atasanDisposisiService';
import DisposisiHeader from '../../components/Kabid/DisposisiHeader';
import DisposisiInfoCard from '../../components/Kabid/DisposisiInfoCard';
import { DisposisiContentSection } from '../../components/Kabid/DisposisiContentSection';
import MyFeedback from '../../components/Kabid/MyFeedback';
import FeedbackForm from '../../components/Kabid/FeedbackForm';
import FeedbackBawahan from '../../components/Kabid/FeedbackBawahan';
import ImageModal from '../../components/Kabid/ImageModal';

const KabidDisposisiDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [disposisi, setDisposisi] = useState(location.state?.disposisi || null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [acceptError, setAcceptError] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
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
  const fetchFeedbackForDisposisi = async (role = 'user') => {
    try {
      setFeedbackLoading(true);
      const response = await atasanDisposisiService.getMyFeedback(role);
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
  const fetchSubordinateFeedback = useCallback(async (role = 'user') => {
    // Hanya fetch jika disposisi ada dan sudah diteruskan ke seseorang
    if (!disposisi || !disposisi.diteruskan_kepada_user_id) {
      setSubordinateFeedback(null);
      return;
    }

    try {
      setSubFeedbackLoading(true);
      setSubFeedbackError(null);

      const feedbackData = await atasanDisposisiService.getFeedbackDariBawahan(role, id);
      setSubordinateFeedback(feedbackData);

    } catch (err) {
      console.error('Error fetching subordinate feedback:', err);

      // Jika 404, itu berarti belum ada feedback
      if (err.status !== 404) {
        setSubFeedbackError('Gagal memuat feedback dari bawahan: ' + err.message);
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
      const response = await atasanDisposisiService.acceptDisposisiKabid(id);
      if (response.data) {
        // Update disposisi state dengan data yang baru
        const updatedData = response.data.data || response.data;
        setDisposisi(prevDisposisi => ({
          ...prevDisposisi,
          status_dari_kabid: updatedData.status_dari_kabid || 'diterima'
        }));
        toast.success(response.data.message || 'Disposisi berhasil diterima!');
        fetchDisposisiDetail();
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
      const blobData = await atasanDisposisiService.downloadPDF(disposisi.id);

      // Buat URL objek dari blob
      const blob = new Blob([blobData], { type: 'application/pdf' });
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
      setDownloadError(err.message);
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
      status_dari_kabid: 'diteruskan'
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

  const handleFeedbackSubmit = async (e, role = 'user') => {
    e.preventDefault();
    try {
      setFeedbackLoading(true);
      setFeedbackError(null);

      const formData = new FormData();
      formData.append('notes', feedbackData.notes);
      formData.append('status', feedbackData.status);
      formData.append('status_dari_kabid', feedbackData.status);
      feedbackData.files.forEach(file => {
        formData.append('feedback_files', file);
      });

      const response = await atasanDisposisiService.createFeedback(role, id, formData);

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
  const handleEditFeedbackSubmit = async (e, role = 'user') => {
    e.preventDefault();
    try {
      setEditLoading(true);
      setFeedbackError(null);

      const formData = new FormData();
      formData.append('notes', editFeedbackData.notes);
      formData.append('status', editFeedbackData.status);
      formData.append('status_dari_kabid', editFeedbackData.status);

      // Tambahkan file baru
      editFeedbackData.newFiles.forEach(file => {
        formData.append('new_feedback_files', file);
      });

      // Tambahkan ID file yang akan dihapus
      editFeedbackData.removeFileIds.forEach(fileId => {
        formData.append('remove_file_ids', fileId);
      });

      const response = await atasanDisposisiService.updateFeedback(role, editingFeedbackId, formData);

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
  const fetchFeedbackForEdit = async (feedbackId, role = 'user') => {
    try {
      setEditLoading(true);

      const response = await atasanDisposisiService.getFeedbackForEdit(role, feedbackId);
      const feedback = response.data;

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


  useEffect(() => {
    if (disposisi) {
      fetchFeedbackForDisposisi();
      fetchSubordinateFeedback();
    }
  }, [disposisi?.id]);


  // No data state
  if (!disposisi) {
    return (
      <div className="min-h-screen flex items-center justify-center" >
        <div className="text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-teal-400" />
          <h3 className="text-lg font-bold mb-2">Data Tidak Ditemukan</h3>
          <p className="mb-4" >Disposisi tidak ditemukan atau tidak dapat diakses langsung</p>
          <button
            onClick={() => navigate('/kabid')}
            className="bg-black text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg border border-slate-200"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen" >
      <div className="">
        {/* Header Section */}
        <DisposisiHeader
          disposisi={disposisi}
          onDownloadPDF={handleDownloadPDF}
          downloadLoading={downloadLoading}
          onAcceptDisposisi={handleAcceptDisposisi}
          acceptLoading={acceptLoading}
          acceptError={acceptError}
          onShowForwardModal={() => setShowForwardModal(true)}
          onShowFeedbackForm={() => setShowFeedbackForm(true)}
          showForwardModal={showForwardModal}
          showFeedbackForm={showFeedbackForm}
          editingFeedbackId={editingFeedbackId}
        />
        {disposisi && (
          <div className="space-y-4">
            {/* Forward Modal Component */}
            <ForwardModal
              isOpen={showForwardModal}
              onClose={() => setShowForwardModal(false)}
              disposisi={disposisi}
              onSuccess={handleForwardSuccess}
            />
            {/* Form Feedback */}
            <FeedbackForm
              showFeedbackForm={showFeedbackForm}
              setShowFeedbackForm={setShowFeedbackForm}
              showForwardModal={showForwardModal}
              feedbackData={feedbackData}
              feedbackError={feedbackError}
              feedbackLoading={feedbackLoading}
              handleFeedbackChange={handleFeedbackChange}
              handleFeedbackSubmit={handleFeedbackSubmit}
              handleFileChange={handleFileChange}
              editingFeedbackId={editingFeedbackId}
            />
            {/* Informasi Surat dan Disposisi */}
            <div className="bg-gradient-to-bl from-gray-100 via-white to-gray-100 rounded-2xl shadow-md border-2 border-slate-200 p-2 md:p-6">
              <DisposisiInfoCard
                disposisi={disposisi}
              />
              {/* Content Sections */}
              <DisposisiContentSection
                disposisi={disposisi}
                onImageClick={setSelectedImage}
              />
            </div>
            {/* Feedback dari Bawahan */}
            <FeedbackBawahan
              disposisi={disposisi}
              setSelectedImage={setSelectedImage}
              subFeedbackError={subFeedbackError}
              subFeedbackLoading={subFeedbackLoading}
              subordinateFeedback={subordinateFeedback}
            />
            {/* Feedback yang Telah Dikirim */}
            <MyFeedback
              feedbackList={feedbackList}
              editFeedbackData={editFeedbackData}
              editingFeedbackId={editingFeedbackId}
              editLoading={editLoading}
              showFeedbackForm={showFeedbackForm}
              showForwardModal={showForwardModal}
              fetchFeedbackForEdit={fetchFeedbackForEdit}
              feedbackError={feedbackError}
              handleEditFeedbackChange={handleEditFeedbackChange}
              handleEditFeedbackSubmit={handleEditFeedbackSubmit}
              handleEditFileChange={handleEditFileChange}
              handleRemoveExistingFile={handleRemoveExistingFile}
              cancelEditFeedback={cancelEditFeedback}
              setSelectedImage={setSelectedImage}
            />
          </div>
        )}
      </div>
      {/* Modal Gambar Fullscreen */}
      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};
export default KabidDisposisiDetail;