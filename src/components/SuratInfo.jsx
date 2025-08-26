import { useState, useEffect } from 'react';
import { Image, Calendar, Building2, FileText, ArrowLeft, AlertCircle, Loader, Maximize2, Minimize2, X, Download, File } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const SuratInfo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management - semua state digabung jadi satu
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState({});
  const [imageDataUrls, setImageDataUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState({});

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Tidak ada tanggal';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Check if file is PDF
  const isPDF = (filename) => {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
  };

  // Get file icon based on type
  const getFileIcon = (filename) => {
    if (isPDF(filename)) {
      return <File className="h-5 w-5" />;
    }
    return <Image className="h-5 w-5" />;
  };

  // Fetch photo/file with blob response
  const getPhoto = async (photoUrl) => {
    try {
      const response = await api.get(photoUrl.replace('/api', ''), {
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw new Error('Gagal memuat file');
    }
  };

  // Download file function
  const downloadFile = async (photo, index) => {
    setDownloadLoading(prev => ({ ...prev, [index]: true }));
    try {
      const response = await api.get(photo.url.replace('/api', ''), {
        responseType: 'blob',
      });
      
      // Create download link
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.original_name || photo.filename || `file_${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('File berhasil didownload');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Gagal mendownload file');
    } finally {
      setDownloadLoading(prev => ({ ...prev, [index]: false }));
    }
  };

  // Photo Gallery Modal Functions
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageDoubleClick = () => {
    if (!isPDF(selectedPhotos?.photos[currentPhotoIndex]?.filename)) {
      toggleFullscreen();
    }
  };

  const fetchPhoto = async (photo, index) => {
    setLoadingImages(prev => ({ ...prev, [index]: true }));
    setImageError(prev => ({ ...prev, [index]: false }));
    try {
      const dataUrl = await getPhoto(photo.url);
      setImageDataUrls(prev => ({ ...prev, [index]: dataUrl }));
    } catch (error) {
      console.error('Error fetching photo:', error);
      setImageError(prev => ({ ...prev, [index]: true }));
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  // Fetch surat detail
  const fetchSuratDetail = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      console.log("ID dari URL:", id);

      const response = await api.get('/kepala/surat-masuk');
      console.log("API Response:", response.data);

      const allSurat = response.data.data || [];
      console.log("Semua surat:", allSurat);

      const suratDetail = allSurat.find(s => String(s.id) === String(id));
      console.log("Ditemukan surat:", suratDetail);

      if (!suratDetail) {
        throw new Error('Surat tidak ditemukan');
      }

      setSurat(suratDetail);
    } catch (error) {
      console.error("Error fetching surat detail:", error);
      setError(error.message || 'Gagal memuat detail surat');
      toast.error('Gagal memuat detail surat');
    } finally {
      setLoading(false);
    }
  };

  // Handle photo opening
  const handleOpenPhotos = () => {
    if (surat?.has_photos && surat?.photos && surat.photos.length > 0) {
      console.log('Opening photos for surat:', surat.id);
      console.log('Photos:', surat.photos);

      setSelectedPhotos({ photos: surat.photos, info: surat });
      setCurrentPhotoIndex(0);
    }
  };

  // Close photo modal
  const closePhotoModal = () => {
    setSelectedPhotos(null);
    setCurrentPhotoIndex(0);
    setIsFullscreen(false);
    // Cleanup URLs
    Object.values(imageDataUrls).forEach(url => {
      if (url) URL.revokeObjectURL(url);
    });
    setImageDataUrls({});
    setImageError({});
    setLoadingImages({});
  };

  // Navigate photos
  const nextPhoto = () => {
    if (selectedPhotos && currentPhotoIndex < selectedPhotos.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedPhotos && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!selectedPhotos) return;

    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        closePhotoModal();
      }
    } else if (e.key === 'f' || e.key === 'F') {
      if (!isPDF(selectedPhotos.photos[currentPhotoIndex]?.filename)) {
        toggleFullscreen();
      }
    } else if (e.key === 'ArrowLeft') {
      prevPhoto();
    } else if (e.key === 'ArrowRight') {
      nextPhoto();
    }
  };

  useEffect(() => {
    if (selectedPhotos) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhotos, isFullscreen, currentPhotoIndex]);

  // Load current photo when modal opens or photo changes
  useEffect(() => {
    if (selectedPhotos && selectedPhotos.photos && selectedPhotos.photos[currentPhotoIndex] && !imageDataUrls[currentPhotoIndex]) {
      fetchPhoto(selectedPhotos.photos[currentPhotoIndex], currentPhotoIndex);
    }
  }, [currentPhotoIndex, selectedPhotos]);

  // Fetch data on mount
  useEffect(() => {
    fetchSuratDetail();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className=" bg-gray-50 p-4 rounded-2xl">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded-lg w-48 mb-4 animate-pulse"></div>
          </div>

          {/* Content skeleton */}
          <div className="bg-gradient-to-tl from-gray-50 via-white to-gray-50 shadow-lg rounded-2xl p-6 border border-black/5">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded-2xl"></div>
                <div className="h-20 bg-gray-200 rounded-2xl"></div>
                <div className="h-20 bg-gray-200 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Kembali</span>
          </button>

          <div className="bg-gradient-to-tl from-red-50 via-white to-red-50 shadow-lg rounded-2xl p-6 border border-red-200">
            <div className="text-center">
              <FileText className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Gagal Memuat Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchSuratDetail}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentFile = selectedPhotos?.photos[currentPhotoIndex];
  const isCurrentPDF = currentFile ? isPDF(currentFile.filename) : false;

  return (
    <div className="">
      {/* Main content */}
      <div className="bg-gradient-to-tl from-gray-50 via-white to-gray-50 shadow-lg rounded-2xl p-6 border border-black/5">
        {/* Header with Photo Button */}
        <div className="">
          <div className='flex justify-between items-center mb-5'>
            <div>
              <h2 className="text-lg font-medium text-gray-600 mb-2">Informasi Surat</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            </div>

            {surat.has_photos && surat.photos && surat.photos.length > 0 && (
              <button
                onClick={handleOpenPhotos}
                className="flex items-center space-x-2 px-4 py-3 bg-gray-100 text-black rounded-xl hover:bg-green-100 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
              >
                {getFileIcon(surat.photos[0]?.filename)}
                <span className="text-sm font-semibold">
                  Lihat File ({surat.photo_count || surat.photos.length})
                </span>
              </button>
            )}
          </div>

          {/* Content Grid */}
          <div className="space-y-6">
            {/* Essential info cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg transition-all ">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 uppercase">Nomor Surat</label>
                </div>
                <p className="text-base text-gray-900 font-medium">{surat.nomor_surat || 'Tidak ada nomor'}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg transition-all ">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 uppercase">Tanggal Surat</label>
                </div>
                <p className="text-base text-gray-900 font-medium">{formatDate(surat.created_at)}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-lg transition-all ">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700 uppercase">Asal Instansi</label>
              </div>
              <p className="text-base text-gray-900 font-medium">{surat.asal_instansi || 'Tidak ada data'}</p>
            </div>

            {surat.keterangan && (
              <div className="bg-white rounded-2xl p-4 shadow-lg transition-all ">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 uppercase">Keterangan</label>
                </div>
                <p className="text-base text-gray-900 font-medium">{surat.keterangan}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo/File Modal */}
      {selectedPhotos && (
        <div
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col z-50 transition-all duration-300 ${isFullscreen ? 'p-0' : 'p-4 md:p-6'}`}
          tabIndex={0}
        >
          {/* Header with elegant controls */}
          <div className={`flex justify-between items-center flex-shrink-0 transition-all duration-300 ${isFullscreen ? 'absolute top-4 left-4 right-4 z-10 opacity-0 hover:opacity-100' : 'mb-4 md:mb-6'}`}>
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2 border border-white/10">
                <span className="text-white text-xs md:text-sm font-medium tracking-tight">
                  {currentPhotoIndex + 1} / {selectedPhotos.photos.length}
                </span>
              </div>
              <div className='bg-white/10 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-white/10'>
                <h3 className="text-xs md:text-sm font-medium truncate">
                  {isCurrentPDF ? 'PDF' : 'Foto'} Surat - {selectedPhotos.info?.asal_instansi}
                </h3>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Download button */}
              <button
                onClick={() => downloadFile(currentFile, currentPhotoIndex)}
                disabled={downloadLoading[currentPhotoIndex]}
                className="group bg-white/10 backdrop-blur-md hover:bg-green-500/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/10 hover:border-green-400/30 transition-all duration-300 ease-out disabled:opacity-50"
                title="Download file"
              >
                {downloadLoading[currentPhotoIndex] ? (
                  <Loader className="h-4 w-4 md:h-5 md:w-5 text-white animate-spin" />
                ) : (
                  <Download className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:text-green-300 transition-colors" />
                )}
              </button>
              
              {/* Fullscreen toggle button - only for images */}
              {!isCurrentPDF && imageDataUrls[currentPhotoIndex] && !loadingImages[currentPhotoIndex] && !imageError[currentPhotoIndex] && (
                <button
                  onClick={toggleFullscreen}
                  className="group bg-white/10 backdrop-blur-md hover:bg-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 ease-out"
                  title={isFullscreen ? "Keluar dari fullscreen (F)" : "Mode fullscreen (F)"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:text-gray-200 transition-colors" />
                  ) : (
                    <Maximize2 className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:text-gray-200 transition-colors" />
                  )}
                </button>
              )}
              
              <button
                onClick={closePhotoModal}
                className="group bg-white/10 backdrop-blur-md hover:bg-red-500/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/10 hover:border-red-400/30 transition-all duration-300 ease-out"
                title="Tutup (Esc)"
              >
                <X className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:text-red-300 transition-colors" />
              </button>
            </div>
          </div>

          {/* Main File Container */}
          <div className={`flex-1 relative flex items-center justify-center min-h-0 overflow-hidden transition-all duration-300 ${isFullscreen ? 'mb-0' : 'mb-4 md:mb-6'}`}>
            {loadingImages[currentPhotoIndex] ? (
              <div className="flex flex-col items-center space-y-4 text-white">
                <div className="relative">
                  <Loader className="animate-spin h-10 w-10 md:h-12 md:w-12 text-gray-300" />
                  <div className="absolute inset-0 h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-gray-400/20 animate-pulse"></div>
                </div>
                <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl px-5 py-2.5 md:px-6 md:py-3 border border-white/10">
                  <span className="text-white/80 text-sm md:text-base font-medium">Memuat file...</span>
                </div>
              </div>
            ) : imageError[currentPhotoIndex] ? (
              <div className="text-center">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 max-w-xs md:max-w-md mx-auto">
                  <div className="relative mb-4 md:mb-6">
                    <AlertCircle className="mx-auto h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                    <div className="absolute inset-0 h-12 w-12 md:h-16 md:w-16 mx-auto rounded-full border-2 border-gray-400/20 animate-ping"></div>
                  </div>
                  <h3 className="text-white text-lg md:text-xl font-semibold mb-2">Gagal memuat file</h3>
                  <p className="text-white/60 text-xs md:text-sm mb-4 md:mb-6 truncate px-2">{selectedPhotos.photos[currentPhotoIndex]?.filename}</p>
                  <button
                    onClick={() => fetchPhoto(selectedPhotos.photos[currentPhotoIndex], currentPhotoIndex)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-medium text-sm md:text-base transition-all duration-300 ease-out border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            ) : imageDataUrls[currentPhotoIndex] ? (
              <div className="relative group w-full h-full flex items-center justify-center p-2 md:p-4">
                {isCurrentPDF ? (
                  // PDF Viewer
                  <div className="w-full h-full">
                    <iframe
                      src={imageDataUrls[currentPhotoIndex]}
                      className={`w-full h-full rounded-lg md:rounded-xl shadow-2xl transition-all duration-300 ease-out ${isFullscreen ? 'rounded-none shadow-none' : 'bg-white/5 border border-white/10'}`}
                      style={isFullscreen ? { height: '100vh' } : { height: 'calc(100vh - 200px)', minHeight: '500px' }}
                      title={currentFile?.filename}
                    />
                  </div>
                ) : (
                  // Image Viewer
                  <div className="relative">
                    <img
                      src={imageDataUrls[currentPhotoIndex]}
                      alt={selectedPhotos.photos[currentPhotoIndex]?.filename}
                      className={`object-contain rounded-lg md:rounded-xl shadow-2xl transition-all duration-300 ease-out z-50 cursor-pointer ${isFullscreen
                        ? 'max-w-screen max-h-screen rounded-none shadow-none'
                        : 'bg-white/5 p-3 md:p-4 max-w-full max-h-full group-hover:scale-[1.01]'
                        }`}
                      style={isFullscreen ? {} : { maxHeight: 'calc(100vh - 200px)', maxWidth: 'calc(100vw - 120px)' }}
                      onDoubleClick={handleImageDoubleClick}
                      title="Double-click untuk fullscreen"
                    />
                    {/* Fullscreen hint overlay */}
                    {!isFullscreen && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5 text-white text-xs font-medium border border-white/10">
                          Double-click untuk fullscreen
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Elegant shadow overlay */}
                <div className={`absolute inset-0 shadow-2xl pointer-events-none opacity-10 ${isFullscreen ? 'rounded-none' : 'rounded-xl md:rounded-2xl'}`}></div>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 md:p-12 border border-white/10">
                <div className="text-center text-white/70">
                  <File className="mx-auto h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4 opacity-40" />
                  <p className="text-base md:text-lg font-medium">Tidak ada file</p>
                </div>
              </div>
            )}
          </div>

          {/* Modern Thumbnail Strip - Hide in fullscreen */}
          {selectedPhotos.photos.length > 1 && !isFullscreen && (
            <div className="transition-all duration-300">
              <div className="flex justify-center space-x-2 overflow-x-auto pb-1 hide-scrollbar">
                {selectedPhotos.photos.map((photo, index) => {
                  const isPhotoPDF = isPDF(photo.filename);
                  return (
                    <button
                      key={photo.id}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`group relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 ease-out ${index === currentPhotoIndex
                        ? 'ring-2 ring-white scale-105 shadow-md'
                        : 'opacity-60 hover:opacity-100 hover:scale-105'
                        }`}
                    >
                      <div className="w-full h-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300">
                        {isPhotoPDF ? (
                          <File className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${index === currentPhotoIndex
                            ? 'text-white'
                            : 'text-white/70 group-hover:text-white'
                            }`} />
                        ) : (
                          <Image className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${index === currentPhotoIndex
                            ? 'text-white'
                            : 'text-white/70 group-hover:text-white'
                            }`} />
                        )}
                      </div>
                      {/* Active indicator */}
                      {index === currentPhotoIndex && (
                        <div className="absolute inset-0 rounded-lg md:rounded-xl border border-white/30"></div>
                      )}
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-lg md:rounded-xl bg-gradient-to-t from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/5 transition-all duration-300"></div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add custom CSS for hide-scrollbar */}
          <style jsx>{`
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default SuratInfo;