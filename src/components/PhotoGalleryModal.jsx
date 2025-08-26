// components/PhotoGalleryModal.jsx
import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Maximize2, Minimize2, Image, Loader } from 'lucide-react';
import { suratService } from '../services/suratService';

const PhotoGalleryModal = ({ photos, suratInfo, onClose }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [imageError, setImageError] = useState({});
  const [imageDataUrls, setImageDataUrls] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageDoubleClick = () => {
    toggleFullscreen();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      if (isFullscreen) {
        setIsFullscreen(false);
      } else {
        onClose();
      }
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  // Auto focus for keyboard navigation
  useEffect(() => {
    const handleKeyDownGlobal = (e) => handleKeyDown(e);
    window.addEventListener('keydown', handleKeyDownGlobal);
    return () => window.removeEventListener('keydown', handleKeyDownGlobal);
  }, [isFullscreen]);

  const fetchPhoto = async (photo, index) => {
    setLoadingImages(prev => ({ ...prev, [index]: true }));
    setImageError(prev => ({ ...prev, [index]: false }));
    try {
      const dataUrl = await suratService.getPhoto(photo.url);
      setImageDataUrls(prev => ({ ...prev, [index]: dataUrl }));
    } catch (error) {
      console.error('Error fetching photo:', error);
      setImageError(prev => ({ ...prev, [index]: true }));
    } finally {
      setLoadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  useEffect(() => {
    // Load current photo
    if (photos && photos[currentPhotoIndex] && !imageDataUrls[currentPhotoIndex]) {
      fetchPhoto(photos[currentPhotoIndex], currentPhotoIndex);
    }
  }, [currentPhotoIndex, photos]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(imageDataUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, []);

  const goToNext = () => {
    if (currentPhotoIndex < photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const currentPhoto = photos[currentPhotoIndex];
  const isLoading = loadingImages[currentPhotoIndex];
  const hasError = imageError[currentPhotoIndex];
  const imageUrl = imageDataUrls[currentPhotoIndex];

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col z-50 transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-4 md:p-6'
      }`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Header with elegant controls */}
      <div className={`flex justify-between items-center flex-shrink-0 transition-all duration-300 ${
        isFullscreen ? 'absolute top-4 left-4 right-4 z-10 opacity-0 hover:opacity-100' : 'mb-4 md:mb-6'
      }`}>
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2 border border-white/10">
            <span className="text-white text-xs md:text-sm font-medium tracking-tight">
              {currentPhotoIndex + 1} / {photos.length}
            </span>
          </div>
          <div className='bg-white/10 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-white/10'>
            <h3 className="text-xs md:text-sm font-medium truncate">Foto Surat - {suratInfo?.asal_instansi}</h3>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Fullscreen toggle button */}
          {imageUrl && !isLoading && !hasError && (
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
            onClick={onClose}
            className="group bg-white/10 backdrop-blur-md hover:bg-red-500/20 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/10 hover:border-red-400/30 transition-all duration-300 ease-out"
            title="Tutup (Esc)"
          >
            <X className="h-4 w-4 md:h-5 md:w-5 text-white group-hover:text-red-300 transition-colors" />
          </button>
        </div>
      </div>

      {/* Main Photo Container */}
      <div className={`flex-1 relative flex items-center justify-center min-h-0 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'mb-0' : 'mb-4 md:mb-6'
      }`}>
        {isLoading ? (
          <div className="flex flex-col items-center space-y-4 text-white">
            <div className="relative">
              <Loader className="animate-spin h-10 w-10 md:h-12 md:w-12 text-gray-300" />
              <div className="absolute inset-0 h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-gray-400/20 animate-pulse"></div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-xl md:rounded-2xl px-5 py-2.5 md:px-6 md:py-3 border border-white/10">
              <span className="text-white/80 text-sm md:text-base font-medium">Memuat foto...</span>
            </div>
          </div>
        ) : hasError ? (
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/10 max-w-xs md:max-w-md mx-auto">
              <div className="relative mb-4 md:mb-6">
                <AlertCircle className="mx-auto h-12 w-12 md:h-16 md:w-16 text-gray-400" />
                <div className="absolute inset-0 h-12 w-12 md:h-16 md:w-16 mx-auto rounded-full border-2 border-gray-400/20 animate-ping"></div>
              </div>
              <h3 className="text-white text-lg md:text-xl font-semibold mb-2">Gagal memuat foto</h3>
              <p className="text-white/60 text-xs md:text-sm mb-4 md:mb-6 truncate px-2">{currentPhoto?.filename}</p>
              <button
                onClick={() => fetchPhoto(currentPhoto, currentPhotoIndex)}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-medium text-sm md:text-base transition-all duration-300 ease-out border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-white/5"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        ) : imageUrl ? (
          <div className="relative group w-full h-full flex items-center justify-center p-2 md:p-4">
            <div className="relative">
              <img
                src={imageUrl}
                alt={currentPhoto?.filename}
                className={`object-contain rounded-lg md:rounded-xl shadow-2xl transition-all duration-300 ease-out z-50 cursor-pointer ${
                  isFullscreen
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
            {/* Elegant shadow overlay */}
            <div className={`absolute inset-0 shadow-2xl pointer-events-none opacity-10 ${
              isFullscreen ? 'rounded-none' : 'rounded-xl md:rounded-2xl'
            }`}></div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl md:rounded-3xl p-8 md:p-12 border border-white/10">
            <div className="text-center text-white/70">
              <Image className="mx-auto h-12 w-12 md:h-16 md:w-16 mb-3 md:mb-4 opacity-40" />
              <p className="text-base md:text-lg font-medium">Tidak ada foto</p>
            </div>
          </div>
        )}
      </div>

      {/* Modern Thumbnail Strip - Hide in fullscreen */}
      {photos.length > 1 && !isFullscreen && (
        <div className="transition-all duration-300">
          <div className="flex justify-center space-x-2 overflow-x-auto pb-1 hide-scrollbar">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setCurrentPhotoIndex(index)}
                className={`group relative flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl overflow-hidden transition-all duration-300 ease-out ${
                  index === currentPhotoIndex
                    ? 'ring-2 ring-white scale-105 shadow-md'
                    : 'opacity-60 hover:opacity-100 hover:scale-105'
                }`}
              >
                <div className="w-full h-full bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300">
                  <Image className={`h-4 w-4 md:h-5 md:w-5 transition-colors ${
                    index === currentPhotoIndex
                      ? 'text-white'
                      : 'text-white/70 group-hover:text-white'
                  }`} />
                </div>
                {/* Active indicator */}
                {index === currentPhotoIndex && (
                  <div className="absolute inset-0 rounded-lg md:rounded-xl border border-white/30"></div>
                )}
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-lg md:rounded-xl bg-gradient-to-t from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/5 transition-all duration-300"></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGalleryModal;