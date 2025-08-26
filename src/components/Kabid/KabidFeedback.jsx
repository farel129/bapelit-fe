import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Paperclip, 
  Download, 
  Eye,
  AlertCircle,
  Loader
} from 'lucide-react';
import { api } from '../../utils/api';

const KabidFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/all');
      setFeedbacks(response.data.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data feedback');
      console.error('Error fetching feedbacks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeedbackDetail = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/feedback/${id}`);
      setSelectedFeedback(response.data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat detail feedback');
      console.error('Error fetching feedback detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setSelectedFeedback(null);
  };

  const handleDownloadFile = (fileUrl, filename) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFeedbacks}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Detail View
  if (selectedFeedback) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={handleBackToList}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Daftar
          </button>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {selectedFeedback.disposisi?.perihal || 'Tanpa Perihal'}
                  </h1>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedFeedback.status === 'selesai' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedFeedback.status || 'Belum Diproses'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Disposisi</h2>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Sifat</p>
                        <p className="text-gray-900">{selectedFeedback.disposisi?.sifat || 'Tidak ditentukan'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Diteruskan Kepada</p>
                        <p className="text-gray-900">{selectedFeedback.disposisi?.diteruskan_kepada_jabatan || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Surat</h2>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Nomor Surat</p>
                        <p className="text-gray-900">{selectedFeedback.surat_masuk?.nomor_surat || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Asal Instansi</p>
                        <p className="text-gray-900">{selectedFeedback.surat_masuk?.asal_instansi || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Tanggal Surat</p>
                        <p className="text-gray-900">
                          {selectedFeedback.surat_masuk?.tanggal_surat 
                            ? new Date(selectedFeedback.surat_masuk.tanggal_surat).toLocaleDateString('id-ID')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Catatan Feedback</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">
                    {selectedFeedback.catatan || 'Tidak ada catatan'}
                  </p>
                </div>
              </div>

              {selectedFeedback.has_files && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Lampiran File ({selectedFeedback.file_count})
                  </h2>
                  <div className="border rounded-md divide-y">
                    {selectedFeedback.files.map((file) => (
                      <div key={file.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <Paperclip className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{file.filename}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB • {file.type}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadFile(file.url, file.filename)}
                          className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Download file"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daftar Feedback</h1>
          <p className="text-gray-600 mt-2">Total {feedbacks.length} feedback</p>
        </div>

        {feedbacks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada feedback</h3>
            <p className="text-gray-500">Belum ada feedback yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {feedback.disposisi?.perihal || 'Tanpa Perihal'}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          feedback.status === 'selesai' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {feedback.status || 'Belum Diproses'}
                        </span>
                        
                        {feedback.has_files && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            <Paperclip className="w-3 h-3 inline mr-1" />
                            {feedback.file_count} file
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-600">
                            {feedback.created_by || 'Tidak diketahui'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-600">
                            {feedback.surat_masuk?.nomor_surat || 'Tidak ada nomor'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-gray-600">
                            {new Date(feedback.created_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {feedback.catatan && (
                        <p className="mt-4 text-gray-700 line-clamp-2">
                          {feedback.catatan}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => fetchFeedbackDetail(feedback.id)}
                      className="ml-4 p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                      title="Lihat detail"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KabidFeedback;