import { ChevronRight, Image, Loader, MessageSquare } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";
import { api } from "../../utils/api";
import toast from "react-hot-toast";
import KepalaFeedbackPhotoModal from "./KepalaFeedbackPhotoModal";


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

const KepalaFeedbackList = ({ suratId }) => {
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
        <KepalaFeedbackPhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </>
  );
};

export default KepalaFeedbackList