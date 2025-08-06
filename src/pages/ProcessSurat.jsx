import { useParams, useNavigate } from 'react-router-dom'
import { Download, Eye, FileText, Save, X, Search, SendHorizontalIcon, Loader, LetterText, MessageSquare, Image, Calendar, User, ChevronRight, ZoomIn } from 'lucide-react'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

// Custom hooks
import { useSuratDetail } from '../hooks/useSuratDetail'
import { useSuratMasuk } from '../hooks/useSuratMasuk'

// Components
import ProcessingPopup from '../components/ProcessingPopup'
import SuratInfo from '../components/SuratInfo'
import PhotoGalleryModal from '../components/PhotoGalleryModal'
import { api } from '../utils/api'

// Helper function to get photo as blob URL (sama seperti fitur lain)
const getPhoto = async (photoUrl) => {
  try {
    const response = await api.get(photoUrl.replace('/api', ''), {
      responseType: 'blob',
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error('Error fetching photo:', error);
    throw new Error('Gagal memuat foto');
  }
};

// Feedback Photo Modal Component
const FeedbackPhotoModal = ({ photo, onClose }) => {
  if (!photo) return null;

  // Photo sudah berupa blob URL dari parent component
  const photoUrl = photo.url;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{photo.foto_original_name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Image */}
        <div className="p-4 bg-gray-50">
          <img
            src={photoUrl}
            alt={photo.foto_original_name}
            className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg object-contain"
            onError={(e) => {
              console.error('Modal image failed to load:', {
                photoId: photo.id,
                url: photoUrl,
                error: e
              });
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <p>Ukuran: {(photo.file_size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    </div>
  );
};

// Feedback List Component
const FeedbackList = ({ suratId }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [photoErrors, setPhotoErrors] = useState({});
  const [loadingPhotos, setLoadingPhotos] = useState({}); // Track photo loading states
  const [photoBlobUrls, setPhotoBlobUrls] = useState({}); // Store blob URLs

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await api.get(`/surat/${suratId}/feedback`);
        console.log('Feedback response:', response.data);
        
        const feedbackData = response.data.data || [];
        
        // Tidak perlu process URL di sini, akan di-load saat dibutuhkan
        console.log('Feedbacks loaded:', feedbackData.length);
        
        setFeedbacks(feedbackData);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
        if (error.response?.status !== 404) {
          toast.error('Gagal memuat feedback');
        }
      } finally {
        setLoading(false);
      }
    };

    if (suratId) {
      fetchFeedbacks();
    }
  }, [suratId]);

  // Function to load photo as blob
  const loadPhotoBlob = async (photoId) => {
    if (photoBlobUrls[photoId] || loadingPhotos[photoId] || photoErrors[photoId]) {
      return; // Already loaded, loading, or failed
    }

    setLoadingPhotos(prev => ({ ...prev, [photoId]: true }));
    
    try {
      const photoUrl = `/api/feedback/photo/${photoId}`;
      const blobUrl = await getPhoto(photoUrl);
      
      setPhotoBlobUrls(prev => ({ ...prev, [photoId]: blobUrl }));
      console.log(`Photo ${photoId} loaded successfully as blob`);
    } catch (error) {
      console.error(`Failed to load photo ${photoId}:`, error);
      setPhotoErrors(prev => ({ ...prev, [photoId]: true }));
    } finally {
      setLoadingPhotos(prev => ({ ...prev, [photoId]: false }));
    }
  };

  // Load photos when feedback is expanded
  useEffect(() => {
    feedbacks.forEach(feedback => {
      if (expanded[feedback.id] && feedback.feedback_photos?.length > 0) {
        feedback.feedback_photos.forEach(photo => {
          loadPhotoBlob(photo.id);
        });
      }
    });
  }, [expanded, feedbacks]);

  const toggleExpanded = (feedbackId) => {
    setExpanded(prev => ({
      ...prev,
      [feedbackId]: !prev[feedbackId]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Memuat feedback...</span>
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Feedback dari Staff</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Belum ada feedback</p>
          <p className="text-sm">Feedback akan muncul setelah staff menerima disposisi</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-black/5 p-6 mb-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative animate-bounce">
            <div className="p-4 bg-blue-100 rounded-2xl shadow-lg">
              <MessageSquare className="w-7 h-7 text-black" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Feedback dari Staff
            </h3>
            <p className="text-slate-600 font-medium flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white text-black border border-black/5 shadow-lg">
                {feedbacks.length} feedback diterima
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {feedbacks.map((feedback, index) => (
            <div key={feedback.id} className="">
              {/* Feedback Header */}
              <div className="mt-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className={`w-10 h-10 bg-gradient-to-br ${
                        index % 5 === 0 ? 'from-violet-100 to-purple-100' :
                        index % 5 === 1 ? 'from-blue-100 to-cyan-100' :
                        index % 5 === 2 ? 'from-emerald-100 to-teal-100' :
                        index % 5 === 3 ? 'from-orange-100 to-red-100' :
                        'from-pink-100 to-rose-100'
                      } rounded-full flex items-center justify-center text-black font-bold text-sm shadow-lg ring-2 ring-white/50`}>
                        {feedback.users?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-800 mb-1">{feedback.users?.name || 'Unknown User'}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="flex items-center gap-2 font-medium">
                          {feedback.users?.jabatan || 'Unknown Position'}
                        </span>
                        <span>|</span>
                        <span className="flex items-center gap-2">
                          
                          {formatDate(feedback.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {(feedback.feedback_notes || feedback.feedback_photos?.length > 0) && (
                    <button
                      onClick={() => toggleExpanded(feedback.id)}
                      className="py-3 px-6 flex items-center gap-x-1 text-sm font-semibold cursor-pointer bg-gray-100 rounded-2xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl group/btn"
                    >
                      Lihat Detal
                      <ChevronRight 
                        className={`w-5 h-5 text-black group-hover/btn:text-slate-700 transition-all duration-300 ${
                          expanded[feedback.id] ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback Content */}
              {expanded[feedback.id] && (
                <div className="mt-10 border-t border-black/20 pt-10">
                  {/* Feedback Notes */}
                  {feedback.feedback_notes && (
                    <div className="mb-6">
                      <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-3">
                        <div className="p-3 bg-pink-100 rounded-xl shadow-lg">
                          <MessageSquare className="w-4 h-4 text-black" />
                        </div>
                        Catatan Feedback
                      </h5>
                      <div className="bg-blue-50 rounded-2xl p-6 text-slate-700 shadow-inner border border-blue-100/50 leading-relaxed">
                        {feedback.feedback_notes}
                      </div>
                    </div>
                  )}

                  {/* Feedback Photos */}
                  {feedback.feedback_photos && feedback.feedback_photos.length > 0 && (
                    <div>
                      <h5 className="font-bold text-slate-800 mb-4 flex items-center gap-3">
                        <div className="p-3 bg-yellow-50 rounded-xl shadow-lg">
                          <Image className="w-4 h-4 text-black" />
                        </div>
                        Foto Pendukung ({feedback.feedback_photos.length})
                      </h5>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {feedback.feedback_photos.map((photo) => {
                          const hasError = photoErrors[photo.id];
                          const isLoading = loadingPhotos[photo.id];
                          const blobUrl = photoBlobUrls[photo.id];
                          
                          return (
                            <div key={photo.id} className="group/photo relative aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
                              {hasError ? (
                                // Error state
                                <div className="w-full h-full flex flex-col items-center justify-center text-red-500 text-xs p-4">
                                  <div className="p-3 bg-red-100 rounded-xl mb-3 shadow-sm">
                                    <Image className="w-8 h-8 text-red-400" />
                                  </div>
                                  <span className="text-center font-medium mb-2">Gagal memuat foto</span>
                                  <span className="break-all text-center text-slate-600 mb-3">{photo.foto_original_name}</span>
                                  <button 
                                    className="px-3 py-2 text-white bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                    onClick={() => {
                                      // Reset error and try again
                                      setPhotoErrors(prev => ({ ...prev, [photo.id]: false }));
                                      loadPhotoBlob(photo.id);
                                    }}
                                  >
                                    Coba Lagi
                                  </button>
                                </div>
                              ) : isLoading ? (
                                // Loading state
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                                  <div className="p-3 bg-blue-100 rounded-xl mb-3 shadow-sm">
                                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                                  </div>
                                  <span className="text-xs font-medium">Memuat foto...</span>
                                </div>
                              ) : blobUrl ? (
                                // Loaded image
                                <div 
                                  className="cursor-pointer hover:shadow-2xl transition-all duration-500 h-full"
                                  onClick={() => setSelectedPhoto({ ...photo, url: blobUrl })}
                                >
                                  <img
                                    src={blobUrl}
                                    alt={photo.foto_original_name}
                                    className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                      console.error('Blob image failed to load:', photo.id);
                                      setPhotoErrors(prev => ({ ...prev, [photo.id]: true }));
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-all duration-300 flex items-center justify-center">
                                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                                      <ZoomIn className="w-6 h-6 text-white" />
                                    </div>
                                  </div>
                                  <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-xl truncate shadow-lg">
                                      {photo.foto_original_name}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                // Initial state - foto belum dimuat
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-colors duration-300">
                                  <div className="p-3 bg-slate-200 rounded-xl mb-3 shadow-sm">
                                    <Image className="w-8 h-8" />
                                  </div>
                                  <span className="text-xs text-center font-medium">{photo.foto_original_name}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No content message */}
                  {!feedback.feedback_notes && (!feedback.feedback_photos || feedback.feedback_photos.length === 0) && (
                    <div className="text-center py-8">
                      <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl inline-block mb-4 shadow-sm">
                        <MessageSquare className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Feedback diterima tanpa catatan atau foto</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quick preview when collapsed */}
              {!expanded[feedback.id] && (feedback.feedback_notes || feedback.feedback_photos?.length > 0) && (
                <div className="px-6 pb-4 bg-gradient-to-r from-slate-50/60 to-blue-50/40 mt-5">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    {feedback.feedback_notes && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-xl shadow-sm border border-blue-100/50">
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        <span className="font-medium">Ada catatan</span>
                      </div>
                    )}
                    {feedback.feedback_photos?.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-xl shadow-sm border border-emerald-100/50">
                        <Image className="w-3 h-3 text-emerald-500" />
                        <span className="font-medium">{feedback.feedback_photos.length} foto</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <FeedbackPhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
};

const ForwardModal = ({ open, onClose, onSubmit, userOptions, loading }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = userOptions.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    if (!acc[user.jabatan]) {
      acc[user.jabatan] = [];
    }
    acc[user.jabatan].push(user);
    return acc;
  }, {});

  const handleUserSelect = (user) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser({ nama: user.name, jabatan: user.jabatan, id: user.id });
    }
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      toast.error('Pilih satu user untuk diteruskan');
      return;
    }
    onSubmit([selectedUser], catatan);
  };

  const resetForm = () => {
    setSelectedUser(null);
    setCatatan('');
    setSearchTerm('');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className='flex items-center gap-3'>
            <div className='p-3 rounded-xl bg-indigo-100 animate-bounce'>
              <SendHorizontalIcon className='w-4 h-4 text-black' />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Teruskan ke Satu Bawahan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center flex flex-col gap-y-2 items-center justify-center">
              <Loader className='h-8 w-8 animate-spin' />
              <p className="text-gray-500 font-medium">Memuat daftar bawahan...</p>
            </div>
          </div>
        ) : userOptions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-gray-400">
              <FileText className="w-14 h-14 mx-auto mb-3 opacity-60" />
              <p className="font-medium">Tidak ada bawahan dalam bidang yang sama</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6">
              <div className="py-4 sticky top-0 bg-white z-10">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama"
                    className="w-full border text-sm border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedUser && (
                <div className="mb-4 p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-indigo-700">
                      Dipilih:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-sm shadow-sm">
                      <span className="truncate max-w-[120px]">{selectedUser.nama}</span>
                      <span className="text-indigo-400">•</span>
                      <span className="truncate max-w-[80px]">{selectedUser.jabatan}</span>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-4 border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
                {Object.keys(groupedUsers).length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    Tidak ada user yang sesuai dengan pencarian
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(groupedUsers).map(([jabatan, users]) => (
                      <div key={jabatan} className="border-b border-gray-100 last:border-b-0">
                        <div className="bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 text-sm sticky top-0">
                          {jabatan} <span className="text-gray-500 font-normal">({users.length})</span>
                        </div>
                        {users.map(user => {
                          const isSelected = selectedUser?.id === user.id;
                          return (
                            <label
                              key={user.id}
                              className="flex items-center px-4 py-3 hover:bg-indigo-50/50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <input
                                type="radio"
                                name="selectedUser"
                                checked={isSelected}
                                onChange={() => handleUserSelect(user)}
                                className="mr-3 w-4 h-4 text-indigo-600 bg-white border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-800 truncate">{user.name}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pb-4">
                <label className="block mb-2.5 text-sm font-semibold text-gray-700">
                  Catatan (opsional)
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm transition-all"
                  rows={3}
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan untuk bawahan yang dipilih..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3.5 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 cursor-pointer rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200 ease-in-out"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl cursor-pointer bg-green-100 border border-black/5 hover:-translate-y-0.5 text-black font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
            disabled={!selectedUser || loading}
          >
            Teruskan
          </button>
        </div>
      </div>
    </div>
  );
};

const ProcessSurat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showForward, setShowForward] = useState(false);
  const [forwardLoading, setForwardLoading] = useState(false);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [bawahanOptions, setBawahanOptions] = useState([]);
  const [loadingBawahan, setLoadingBawahan] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isActionTaken, setIsActionTaken] = useState(false);

  const [formData, setFormData] = useState({
    nomor_surat: '',
    perihal: '',
    disposisi_kepada: '',
    tindakan: [],
    sifat: '',
    catatan: ''
  })

  const [processing, setProcessing] = useState(false)
  const [showProcessingPopup, setShowProcessingPopup] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const { surat, loading, updateSuratStatus } = useSuratDetail(id)
  const { selectedPhotos, setSelectedPhotos } = useSuratMasuk()

  const handleSubmit = async (formData) => {
    setProcessing(true)
    setShowProcessingPopup(true)
    setProcessingComplete(false)

    try {
      const dataToSend = {
        ...formData,
        tindakan: formData.tindakan.join(', ')
      }

      await api.post(`/surat/${id}/process`, dataToSend)
      await new Promise(resolve => setTimeout(resolve, 1500))

      setProcessingComplete(true)
      toast.success('Surat berhasil diproses!')
      updateSuratStatus('processed')
      setIsActionTaken(true)

    } catch (error) {
      console.error("Full error object:", error)
      setShowProcessingPopup(false)

      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        toast.error(error.response.data?.error || 'Gagal memproses surat')
      } else if (error.request) {
        console.error("No response from server:", error.request)
        toast.error('Tidak ada respon dari server.')
      } else {
        console.error("Error saat setup request:", error.message)
        toast.error('Terjadi kesalahan saat mengirim data.')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const response = await api.get(`/surat/${id}/pdf`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const total = progressEvent.total
          const current = progressEvent.loaded
          const percentage = Math.round((current / total) * 100)
          setDownloadProgress(percentage)
        }
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `surat-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PDF berhasil diunduh!')
      setShowProcessingPopup(false)

    } catch (error) {
      toast.error('Gagal mengunduh PDF')
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const closePopup = () => {
    setShowProcessingPopup(false)
    setProcessingComplete(false)
    setDownloadProgress(0)
  }

  useEffect(() => {
    if (surat) {
      let tindakanArray = []
      if (surat.tindakan) {
        if (Array.isArray(surat.tindakan)) {
          tindakanArray = surat.tindakan
        } else if (typeof surat.tindakan === 'string') {
          tindakanArray = surat.tindakan
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        }
      }

      console.log("Tindakan yang akan diset:", tindakanArray)

      setFormData({
        nomor_surat: surat.nomor_surat || '',
        perihal: surat.perihal || '',
        disposisi_kepada: surat.disposisi_kepada || '',
        tindakan: tindakanArray,
        sifat: surat.sifat || '',
        catatan: surat.catatan || ''
      })

      if (surat.status === 'processed' || surat.status === 'forwarded') {
        setIsActionTaken(true)
      }
    }
  }, [surat])

  useEffect(() => {
    const fetchBawahanOptions = async () => {
      setLoadingBawahan(true);
      try {
        const response = await api.get('/users/bawahan-bidang-detail');
        console.log('Bawahan response:', response.data);

        setBawahanOptions(response.data.data || []);
        setUserInfo({
          bidang: response.data.bidang,
          total: response.data.total
        });
      } catch (error) {
        console.error('Gagal mengambil data bawahan:', error);
        setBawahanOptions([]);
        toast.error('Gagal memuat data bawahan');
      } finally {
        setLoadingBawahan(false);
      }
    };

    fetchBawahanOptions();
  }, []);

  const onFormSubmit = (e) => {
    e.preventDefault()
    if (!isActionTaken) {
      handleSubmit(formData)
    }
  }

  const handleCancel = () => {
    navigate('/')
  }

  const handleForward = async (selectedUsers, catatan) => {
    setForwardLoading(true);
    try {
      console.log('Sending forward request:', {
        bawahan_users: selectedUsers,
        catatan
      });

      const response = await api.post(`/surat/${id}/forward`, {
        bawahan_users: selectedUsers,
        catatan,
      });

      setShowForward(false);
      setIsActionTaken(true);

      const selectedUser = selectedUsers[0];
      const bidangInfo = response.data.bidang ? ` (Bidang: ${response.data.bidang})` : '';

      toast.success(`Surat berhasil diteruskan ke ${selectedUser.nama}${bidangInfo}!`);

      console.log('Diteruskan kepada:', selectedUser.nama);

    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal meneruskan surat!';
      toast.error(errorMessage);
      console.error('Forward error:', err.response?.data || err);
    } finally {
      setForwardLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-y-2 items-center justify-center h-screen">
        <Loader className=' animate-spin w-8 h-8 text-black' />
        <p>Memuat</p>
      </div>
    )
  }

  if (!surat) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Surat tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div className="">
      <ProcessingPopup
        showProcessingPopup={showProcessingPopup}
        processingComplete={processingComplete}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
        onDownloadPDF={handleDownloadPDF}
        onClose={closePopup}
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-x-3 items-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#fff] border border-black/5 rounded-2xl shadow-lg">
            <LetterText className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Proses Surat</h1>
            {userInfo?.bidang && (
              <p className="text-sm text-gray-600">Bidang: {userInfo.bidang}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SuratInfo surat={surat} onOpenPhotos={setSelectedPhotos} />

        <div className="">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-8">
              <div className="flex items-center space-x-3">
                <div className="">
                  <FileText className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-black">Proses Surat</h2>
                  {isActionTaken && (
                    <p className="text-sm text-green-600 mt-1">✓ Surat sudah diproses atau diteruskan</p>
                  )}
                </div>
              </div>
            </div>

            {/* Button Actions */}
            <div className="p-8">
              <div className="flex flex-col gap-y-3">
                {/* Terima Disposisi */}
                <form
                  onSubmit={onFormSubmit}
                  className='w-full'
                >
                  <button
                    type="submit"
                    disabled={processing || isActionTaken}
                    className={`inline-flex items-center justify-center px-8 w-full py-3 font-semibold rounded-xl shadow-lg transition-all duration-200 ${processing || isActionTaken
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-100 text-black cursor-pointer hover:bg-green-200'
                      }`}
                  >
                    {processing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin mr-3" />
                        Memproses...
                      </>
                    ) : isActionTaken ? (
                      <>
                        <Save className="w-4 h-4 mr-3" />
                        Sudah Diproses
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-3" />
                        Terima Disposisi
                      </>
                    )}
                  </button>
                </form>

                {/* Download Pdf */}
                {surat.status === 'processed' && (
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex shadow-lg items-center justify-center px-8 py-3 text-sm font-medium rounded-xl text-black bg-green-100 cursor-pointer hover:bg-green-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                )}

                {/* Teruskan ke Bawahan */}
                <button
                  onClick={() => setShowForward(true)}
                  className={`inline-flex items-center shadow-lg justify-center px-8 py-3 font-semibold rounded-xl ${isActionTaken
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                      : 'text-black bg-amber-100 hover:bg-amber-200 cursor-pointer'
                    }`}
                  disabled={loadingBawahan || isActionTaken}
                >
                  {loadingBawahan ? 'Memuat...' : 'Teruskan ke Bawahan'}
                </button>

                {/* Batal */}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-3 text-slate-600 shadow-lg cursor-pointer font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-slate-300/30"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Section - Full Width */}
      <div className="mt-8">
        <FeedbackList suratId={id} />
      </div>

      {/* Updated Modal Forward */}
      <ForwardModal
        open={showForward}
        onClose={() => setShowForward(false)}
        onSubmit={handleForward}
        userOptions={bawahanOptions}
        loading={loadingBawahan || forwardLoading}
      />

      {/* Photo Gallery Modal */}
      {selectedPhotos && (
        <PhotoGalleryModal
          photos={selectedPhotos.photos}
          suratInfo={selectedPhotos.info}
          onClose={() => setSelectedPhotos(null)}
        />
      )}
    </div>
  )
}

export default ProcessSurat