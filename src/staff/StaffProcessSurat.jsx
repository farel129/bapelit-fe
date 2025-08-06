import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Download, Eye, FileText, Upload, X, Image, MessageSquare, SendToBack, Edit3, Clock, Save, Loader, ZoomIn } from 'lucide-react'
import { useState, useEffect } from 'react'

// Custom hooks
import { useSuratDetail } from '../hooks/useSuratDetail'
import { useSuratProcessing } from '../hooks/useSuratProcessing'

// Components
import SuratInfo from '../components/SuratInfo'
import { useSuratMasuk } from '../hooks/useSuratMasuk'
import PhotoGalleryModal from '../components/PhotoGalleryModal'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

// Helper function to get photo as blob URL
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
            src={photo.url}
            alt={photo.foto_original_name}
            className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg object-contain"
            onError={(e) => {
              console.error('Modal image failed to load:', {
                photoId: photo.id,
                url: photo.url,
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

const StaffProcessSurat = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [acceptLoading, setAcceptLoading] = useState(false)

  // Feedback states
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const [feedbackNotes, setFeedbackNotes] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])

  // Edit feedback states
  const [existingFeedback, setExistingFeedback] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [canEdit, setCanEdit] = useState(false)
  const [photosToRemove, setPhotosToRemove] = useState([])

  // New states for feedback display
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoErrors, setPhotoErrors] = useState({})
  const [loadingPhotos, setLoadingPhotos] = useState({})
  const [photoBlobUrls, setPhotoBlobUrls] = useState({})

  // Custom hooks
  const { surat, loading, updateSuratStatus } = useSuratDetail(id)
  const { handleDownloadPDF } = useSuratProcessing(id, () => updateSuratStatus('processed'))
  const { selectedPhotos, setSelectedPhotos } = useSuratMasuk()

  // Function to load photo as blob
  const loadPhotoBlob = async (photoId) => {
    if (photoBlobUrls[photoId] || loadingPhotos[photoId] || photoErrors[photoId]) {
      return;
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

  // Fetch existing feedback on component mount - FIXED VERSION
  useEffect(() => {
    const fetchFeedback = async () => {
      setFeedbackLoading(true)
      try {
        console.log('Fetching feedback for surat ID:', id);
        const response = await api.get(`/surat/${id}/feedback`)
        console.log('Feedback response:', response.data);

        const feedbacks = response.data.data || []

        if (feedbacks.length > 0) {
          // Find feedback by current user if available, otherwise show all feedbacks
          const userFeedback = feedbacks.find(fb => fb.user_id === surat?.processed_by) || feedbacks[0]

          if (userFeedback) {
            setExistingFeedback(userFeedback)
            setFeedbackNotes(userFeedback.feedback_notes || '')

            // Check if can still edit (within 1 hour) - only for current user's feedback
            if (userFeedback.user_id === surat?.processed_by) {
              const createdAt = new Date(userFeedback.created_at)
              const now = new Date()
              const timeDiff = now - createdAt
              const oneHour = 60 * 60 * 1000

              if (timeDiff < oneHour) {
                setCanEdit(true)
                setTimeRemaining(oneHour - timeDiff)
              }
            }

            // Load photos when feedback is loaded
            if (userFeedback.feedback_photos?.length > 0) {
              userFeedback.feedback_photos.forEach(photo => {
                loadPhotoBlob(photo.id);
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching feedback:', error)
        if (error.response?.status !== 404) {
          console.error('Feedback fetch failed with status:', error.response?.status)
        }
      } finally {
        setFeedbackLoading(false)
      }
    }

    // FIXED: Remove strict condition, fetch feedback for any surat that exists
    if (surat?.id) {
      fetchFeedback()
    }
  }, [id, surat?.id, surat?.processed_by])

  // Timer for remaining edit time
  useEffect(() => {
    if (timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            setCanEdit(false)
            setIsEditMode(false)
            return 0
          }
          return prev - 1000
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining])

  // Format remaining time
  const formatTimeRemaining = (ms) => {
    if (!ms || ms <= 0) return '00:00'
    const minutes = Math.floor(ms / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))

    if (invalidFiles.length > 0) {
      toast.error('Hanya file gambar yang diperbolehkan (JPG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (5MB max per file)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('Ukuran file maksimal 5MB per file')
      return
    }

    // Calculate current photo count (existing + new - to remove)
    const currentPhotoCount = isEditMode
      ? (existingFeedback?.feedback_photos?.length || 0) - photosToRemove.length + selectedFiles.length
      : selectedFiles.length

    // Validate total files (5 max)
    if (currentPhotoCount + files.length > 5) {
      toast.error('Maksimal 5 file gambar')
      return
    }

    // Add files to selected files
    const newFiles = [...selectedFiles, ...files]
    setSelectedFiles(newFiles)

    // Create preview URLs
    const newPreviews = [...previewUrls]
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      newPreviews.push(url)
    })
    setPreviewUrls(newPreviews)
  }

  // Remove selected file
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newPreviews = previewUrls.filter((_, i) => i !== index)

    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles(newFiles)
    setPreviewUrls(newPreviews)
  }

  // Mark existing photo for removal
  const markPhotoForRemoval = (photoId) => {
    if (photosToRemove.includes(photoId)) {
      setPhotosToRemove(prev => prev.filter(id => id !== photoId))
    } else {
      setPhotosToRemove(prev => [...prev, photoId])
    }
  }

  // Start edit mode
  const startEditMode = () => {
    setIsEditMode(true)
    setShowFeedbackForm(false)
  }

  // Cancel edit mode
  const cancelEditMode = () => {
    setIsEditMode(false)
    setFeedbackNotes(existingFeedback?.feedback_notes || '')
    setSelectedFiles([])
    setPreviewUrls([])
    setPhotosToRemove([])
  }

  // Handle edit feedback
  const handleEditFeedback = async () => {
    setEditLoading(true)

    try {
      const formData = new FormData()

      if (feedbackNotes.trim()) {
        formData.append('feedback_notes', feedbackNotes.trim())
      }

      // Add photos to remove
      if (photosToRemove.length > 0) {
        photosToRemove.forEach(photoId => {
          formData.append('remove_photo_ids', photoId)
        })
      }

      // Add new photos
      selectedFiles.forEach((file) => {
        formData.append('new_photos', file)
      })

      await api.put(`/feedback/${existingFeedback.id}/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Feedback berhasil diperbarui')

      // Refresh feedback data
      const response = await api.get(`/surat/${id}/feedback`)
      const feedbacks = response.data.data
      const updatedFeedback = feedbacks.find(fb => fb.user_id === surat?.processed_by)
      setExistingFeedback(updatedFeedback)

      // Clean up
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setSelectedFiles([])
      setPreviewUrls([])
      setPhotosToRemove([])
      setIsEditMode(false)

    } catch (err) {
      console.error('Error editing feedback:', err)
      toast.error(err.response?.data?.error || 'Gagal memperbarui feedback')
    } finally {
      setEditLoading(false)
    }
  }

  // Handle accept with feedback
  const handleAcceptWithFeedback = async () => {
    setAcceptLoading(true)

    try {
      const formData = new FormData()
      formData.append('atasan_jabatan', surat.disposisi_kepada)

      if (feedbackNotes.trim()) {
        formData.append('feedback_notes', feedbackNotes.trim())
      }

      // Add photos
      selectedFiles.forEach((file, index) => {
        formData.append('feedback_photos', file)
      })

      await api.post(`/surat/${id}/accept`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Disposisi berhasil diterima dengan feedback')
      updateSuratStatus('processed')

      // Clean up preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url))

      // Redirect ke /staff setelah berhasil
      navigate('/staff')

    } catch (err) {
      console.error('Error accepting with feedback:', err)
      toast.error(err.response?.data?.error || 'Gagal menerima disposisi')
    } finally {
      setAcceptLoading(false)
    }
  }

  // Handle simple accept without feedback
  const handleSimpleAccept = async () => {
    setAcceptLoading(true)
    try {
      await api.post(`/surat/${id}/accept`, {
        atasan_jabatan: surat.disposisi_kepada
      })

      toast.success('Disposisi berhasil diterima')
      updateSuratStatus('processed')
      navigate('/staff')

    } catch (err) {
      toast.error('Gagal menerima disposisi')
    } finally {
      setAcceptLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
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
    <div className="min-h-screen w-full">
      {/* Header */}
      <div className="flex gap-x-3 items-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#262628] rounded-2xl shadow-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[#262628] uppercase">Disposisi Surat</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {/* Left: Surat Information */}
        <div className="">
          <SuratInfo surat={surat} onOpenPhotos={setSelectedPhotos} />
        </div>

        {/* Right: Action Buttons */}
        <div className='bg-white p-6 rounded-2xl shadow-lg h-fit'>
          <div className='flex items-center gap-x-2 mb-5'>
            <div className='bg-yellow-100 p-3 rounded-xl animate-bounce'>
              <SendToBack className='text-black w-4 h-4' />
            </div>
            <p className='text-gray-600 text-lg mb-5 font-bold'>Aksi Tersedia</p>
          </div>

          <ul className='text-gray-600 p-6 list-disc'>
            <li>Pilih terima disposisi jika anda tidak akan memberikan laporan</li>
            <li>pilih terima dengan feedback jika anda ingin memberikan laporan</li>
          </ul>

          <div className="space-y-4">
            {/* Download PDF Button */}
            {surat.status === 'processed' && (
              <button
                onClick={handleDownloadPDF}
                className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-black bg-blue-100 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 hover:shadow-xl"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            )}

            {/* Show existing feedback if processed */}
            {existingFeedback && !isEditMode && (
              <div className="bg-white border border-black/5 shadow-lg rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-green-800 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Feedback Terkirim
                  </h4>

                </div>

                {existingFeedback.feedback_notes && (
                  <div className="mb-5">
                    <p className="text-sm font-medium text-gray-700 mb-1">Catatan:</p>
                    <p className="text-gray-600 text-sm bg-white py-3 shadow-lg border border-black/10 px-4 rounded-xl">
                      {existingFeedback.feedback_notes}
                    </p>
                  </div>
                )}

                {existingFeedback.feedback_photos?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Foto ({existingFeedback.feedback_photos.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {existingFeedback.feedback_photos.map((photo) => {
                        const hasError = photoErrors[photo.id];
                        const isLoading = loadingPhotos[photo.id];
                        const blobUrl = photoBlobUrls[photo.id];

                        return (
                          <div key={photo.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                            {hasError ? (
                              <div className="w-full h-full flex flex-col items-center justify-center text-red-500 text-xs p-2">
                                <Image className="w-6 h-6 mb-1" />
                                <span className="text-center">Gagal memuat</span>
                                <button
                                  className="mt-1 px-2 py-1 text-white bg-red-500 rounded text-xs"
                                  onClick={() => {
                                    setPhotoErrors(prev => ({ ...prev, [photo.id]: false }));
                                    loadPhotoBlob(photo.id);
                                  }}
                                >
                                  Retry
                                </button>
                              </div>
                            ) : isLoading ? (
                              <div className="w-full h-full flex items-center justify-center">
                                <Loader className="w-6 h-6 animate-spin text-gray-400" />
                              </div>
                            ) : blobUrl ? (
                              <img
                                src={blobUrl}
                                alt={`Feedback ${photo.id}`}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                onClick={() => setSelectedPhoto({ ...photo, url: blobUrl })}
                                onError={() => {
                                  console.error('Blob image failed to load:', photo.id);
                                  setPhotoErrors(prev => ({ ...prev, [photo.id]: true }));
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Image className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className='flex flex-col'>
                  <p className="text-xs text-gray-500 mt-3">
                    Dikirim: {formatDate(existingFeedback.created_at)}
                  </p>

                  {canEdit && (
                    <div className="flex flex-col items-center gap-2 mt-2">
                      <button
                        onClick={startEditMode}
                        className="text-black hover:-translate-y-0.5 cursor-pointer shadow-lg text-sm py-3 w-full rounded-xl bg-green-100 font-medium flex items-center justify-center"
                      >
                        <Edit3 className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <div className=" flex items-center gap-x-2 mt-2 text-sm">
                        <p>sisa waktu untuk mengedit: </p>
                        <div className='flex items-center justify-center text-red-500'>
                          <Clock className="w-3 h-3 mr-1" />
                          <p>{formatTimeRemaining(timeRemaining)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Accept Buttons - Only show if not processed */}
            {surat.jabatan !== surat.disposisi_kepada && !surat.processed_by && (
              <div className="space-y-3">
                {/* Simple Accept Button */}
                <button
                  onClick={handleSimpleAccept}
                  disabled={acceptLoading}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${acceptLoading
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-black bg-green-100 hover:-translate-y-0.5 shadow-lg hover:shadow-xl cursor-pointer'
                    }`}
                >
                  {acceptLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Terima Disposisi
                    </>
                  )}
                </button>

                <div className='flex gap-x-3 items-center'>
                  <div className='w-full h-[1px] bg-black/20 rounded-full'></div>
                  <p className='font-semibold text-black/20'>ATAU</p>
                  <div className='w-full h-[1px] bg-black/20 rounded-full'></div>
                </div>

                {/* Accept with Feedback Button */}
                <button
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  disabled={acceptLoading}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${acceptLoading
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : showFeedbackForm
                      ? 'text-black bg-orange-100 hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                      : 'text-black bg-blue-100 hover:-translate-y-0.5 shadow-lg hover:shadow-xl cursor-pointer'
                    }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showFeedbackForm ? 'Tutup Feedback' : 'Terima dengan Feedback'}
                </button>
              </div>
            )}

            {/* Already Processed Message */}
            {surat.processed_by && !existingFeedback && (
              <div className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl text-gray-700 bg-gray-300 opacity-35 border border-gray-200 cursor-not-allowed">
                <CheckCircle className="w-4 h-4 mr-2" />
                Sudah Diterima
              </div>
            )}
          </div>

          {/* Edit Feedback Form */}
          {isEditMode && existingFeedback && (
            <div className="mt-6 p-5 bg-white border border-black/5 shadow-lg rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit Feedback
                </h3>
                <div className="flex items-center text-sm text-red-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Sisa waktu: {formatTimeRemaining(timeRemaining)}
                </div>
              </div>

              {/* Feedback Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Tambahkan catatan atau komentar..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 outline-none rounded-xl focus:ring-1 focus:ring-orange-400 resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Maksimal 500 karakter
                  </p>
                  <p className="text-xs text-gray-600">
                    {feedbackNotes.length}/500
                  </p>
                </div>
              </div>

              {/* Existing Photos */}
              {existingFeedback.feedback_photos?.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foto Saat Ini
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {existingFeedback.feedback_photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photoBlobUrls[photo.id] || photo.url}
                          alt={photo.foto_original_name}
                          className={`w-full h-20 object-cover rounded-lg border-2 transition-all ${photosToRemove.includes(photo.id)
                            ? 'border-red-300 opacity-50 grayscale'
                            : 'border-gray-200'
                            }`}
                        />
                        <button
                          onClick={() => markPhotoForRemoval(photo.id)}
                          className={`absolute -top-2 -right-2 rounded-full p-1 transition-all ${photosToRemove.includes(photo.id)
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                        >
                          {photosToRemove.includes(photo.id) ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                        </button>
                        <div className="absolute bottom-1 left-1 bg-white bg-opacity-70 text-black/50 text-xs px-1 py-0.5 rounded truncate max-w-16">
                          {photo.foto_original_name.length > 10
                            ? photo.foto_original_name.substring(0, 10) + '...'
                            : photo.foto_original_name
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                  {photosToRemove.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {photosToRemove.length} foto akan dihapus
                    </p>
                  )}
                </div>
              )}

              {/* Add New Photos */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tambah Foto Baru
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="edit-feedback-photos"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="edit-feedback-photos"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih Foto
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Maksimal total 5 foto, ukuran per file maksimal 5MB
                  </p>
                </div>

                {/* Preview New Photos */}
                {previewUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Foto baru:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`New Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-green-200"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleEditFeedback}
                  disabled={editLoading}
                  className={`flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${editLoading
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-white bg-red-800 shadow-lg hover:shadow-xl cursor-pointer hover:-translate-y-0.5'
                    }`}
                >
                  {editLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                      <span>Menyimpan...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </button>
                <button
                  onClick={cancelEditMode}
                  disabled={editLoading}
                  className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Feedback Form */}
          {showFeedbackForm && !surat.processed_by && (
            <div className="mt-6 p-5 border-1 border-black/5 bg-white shadow-lg rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Tambahkan Feedback
              </h3>

              {/* Feedback Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Tambahkan catatan atau komentar..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 outline-none rounded-xl focus:ring-1 focus:ring-blue-400 resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    Maksimal 500 karakter
                  </p>
                  <p className="text-xs text-gray-600">
                    {feedbackNotes.length}/500
                  </p>
                </div>
              </div>

              {/* Photo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Pendukung (Opsional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="feedback-photos"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="feedback-photos"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih Foto
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Maksimal 5 file, ukuran per file maksimal 5MB<br />
                    Format: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {/* Preview Selected Photos */}
                {previewUrls.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        Foto yang dipilih:
                      </p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {selectedFiles.length}/5
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute bottom-1 left-1 bg-white bg-opacity-70 text-black/50 text-xs px-1 py-0.5 rounded truncate max-w-16">
                            {selectedFiles[index]?.name.length > 10
                              ? selectedFiles[index]?.name.substring(0, 10) + '...'
                              : selectedFiles[index]?.name
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Feedback Button */}
              <button
                onClick={handleAcceptWithFeedback}
                disabled={acceptLoading}
                className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${acceptLoading
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  : 'text-black bg-blue-100 shadow-lg hover:shadow-xl cursor-pointer'
                  }`}
              >
                {acceptLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Kirim Feedback & Terima Disposisi
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Display Section - Full Width */}
      {feedbackLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div className="flex items-center justify-center py-8">
            <Loader className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Memuat feedback...</span>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {selectedPhotos && (
        <PhotoGalleryModal
          photos={selectedPhotos.photos}
          suratInfo={selectedPhotos.info}
          onClose={() => setSelectedPhotos(null)}
        />
      )}

      {/* Feedback Photo Modal */}
      {selectedPhoto && (
        <FeedbackPhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </div>
  )
}

export default StaffProcessSurat