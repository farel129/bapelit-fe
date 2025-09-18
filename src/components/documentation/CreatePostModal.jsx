import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  X,
  Camera,
  Image,
  FileText,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Loader,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

// Success Modal Component — Disesuaikan style AdminJadwalAcara
const SuccessModal = ({ isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // Auto close after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl p-6 shadow-2xl transform animate-pulse border border-gray-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-[#000000] mb-1">
            Post Berhasil Dibagikan!
          </h3>
          <p className="text-[#6b7280] text-sm">
            Post Anda telah berhasil dipublikasikan
          </p>
        </div>
      </div>
    </div>
  );
};

const CreatePostModal = ({
  showCreatePost,
  setShowCreatePost,
  handleCreatePost
}) => {
  // Kategori yang didefinisikan secara manual
  const categories = [
    { id: 1, name: 'umum', label: 'Umum' },
    { id: 2, name: 'pekerjaan', label: 'Pekerjaan' },
    { id: 3, name: 'tutorial', label: 'Tutorial' },
    { id: 4, name: 'hiburan', label: 'Hiburan' }
  ];

  // Mobile step state
  const [mobileStep, setMobileStep] = useState('upload'); // 'upload' or 'details'

  // Simplified state - hanya satu source of truth
  const [postData, setPostData] = useState({
    caption: '',
    files: [],
    kategori: '',
    tags: ''
  });

  const [filePreviews, setFilePreviews] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize category saat pertama kali
  const defaultCategory = useMemo(() => {
    return categories && categories.length > 0 ? categories[0].name : '';
  }, []);

  // Reset form ketika modal dibuka/tutup
  useEffect(() => {
    if (showCreatePost) {
      setPostData({
        caption: '',
        files: [],
        kategori: defaultCategory,
        tags: ''
      });
      setSelectedFileIndex(0);
      setFilePreviews([]);
      setIsLoading(false);
      setShowSuccessModal(false);
      setMobileStep('upload');
    }
  }, [showCreatePost, defaultCategory]);

  // Generate previews untuk files - tanpa selectedFileIndex di dependency
  useEffect(() => {
    const previews = [];

    postData.files.forEach((file, index) => {
      if (file?.type?.startsWith('image/')) {
        try {
          const url = URL.createObjectURL(file);
          previews[index] = { type: 'image', url };
        } catch (error) {
          console.error('Error creating preview:', error);
          previews[index] = { type: 'image', url: null };
        }
      } else {
        previews[index] = { type: 'document', url: null };
      }
    });

    setFilePreviews(previews);

    // Adjust selectedFileIndex jika perlu
    if (previews.length > 0 && selectedFileIndex >= previews.length) {
      setSelectedFileIndex(0);
    }

    // Cleanup URLs
    return () => {
      previews.forEach(preview => {
        if (preview?.url) {
          try {
            URL.revokeObjectURL(preview.url);
          } catch (error) {
            console.error('Error revoking URL:', error);
          }
        }
      });
    };
  }, [postData.files]); // Hanya depends pada files

  // Separate effect untuk adjust selectedFileIndex
  useEffect(() => {
    if (postData.files.length === 0) {
      setSelectedFileIndex(0);
    } else if (selectedFileIndex >= postData.files.length) {
      setSelectedFileIndex(Math.max(0, postData.files.length - 1));
    }
  }, [postData.files.length, selectedFileIndex]);

  const handleLocalFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf'
    ];

    const validFiles = files.filter(file => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      alert("Hanya file gambar (JPG, PNG, GIF, WebP) dan PDF yang diizinkan.");
      return;
    }

    setPostData(prev => {
      const totalFiles = prev.files.length + validFiles.length;
      if (totalFiles > 5) {
        alert("Maksimal 5 file yang bisa diunggah.");
        return prev;
      }
      return {
        ...prev,
        files: [...prev.files, ...validFiles]
      };
    });

    // Clear input value agar bisa upload file yang sama lagi
    e.target.value = '';
  }, []);

  const removeFile = useCallback((index) => {
    setPostData(prev => {
      const newFiles = [...prev.files];
      newFiles.splice(index, 1);
      return {
        ...prev,
        files: newFiles
      };
    });

    // Update selected index dengan logic yang lebih aman
    setSelectedFileIndex(prev => {
      if (postData.files.length <= 1) {
        return 0;
      }
      if (index === prev) {
        return Math.max(0, index - 1);
      }
      if (index < prev) {
        return prev - 1;
      }
      return prev;
    });
  }, [postData.files.length]);

  const handleInputChange = useCallback((field, value) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCaptionChange = useCallback((e) => {
    const value = e.target.value;
    if (value.length <= 2200) {
      handleInputChange('caption', value);
    }
  }, [handleInputChange]);

  const handleCategoryChange = useCallback((e) => {
    handleInputChange('kategori', e.target.value);
  }, [handleInputChange]);

  const handleTagsChange = useCallback((e) => {
    handleInputChange('tags', e.target.value);
  }, [handleInputChange]);

  const validateForm = useCallback(() => {
    const hasCaption = postData.caption && postData.caption.trim().length > 0;
    const hasFiles = postData.files && postData.files.length > 0;

    if (!hasCaption) {
      alert("Caption wajib diisi");
      return false;
    }

    if (!hasFiles) {
      alert("Minimal 1 file harus diunggah");
      return false;
    }

    return true;
  }, [postData.caption, postData.files]);

  const handleSave = useCallback(async () => {
    if (!validateForm() || isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      // Pass postData langsung ke handleCreatePost
      await handleCreatePost(postData);

      // Reset form setelah berhasil
      setPostData({
        caption: '',
        files: [],
        kategori: defaultCategory,
        tags: ''
      });

      // Show success modal instead of alert
      setShowSuccessModal(true);

      // Close create post modal after a short delay
      setTimeout(() => {
        setShowCreatePost(false);
      }, 500);

    } catch (error) {
      console.error("Error creating post:", error);
      alert("Gagal membuat post. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [postData, handleCreatePost, defaultCategory, setShowCreatePost, validateForm, isLoading]);

  const handleClose = useCallback(() => {
    if (!isLoading) {
      setShowCreatePost(false);
    }
  }, [setShowCreatePost, isLoading]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);

  const handleMobileNext = useCallback(() => {
    if (postData.files.length === 0) {
      alert("Minimal 1 file harus diunggah");
      return;
    }
    setMobileStep('details');
  }, [postData.files.length]);

  const handleMobileBack = useCallback(() => {
    setMobileStep('upload');
  }, []);

  if (!showCreatePost) return null;

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden fixed inset-0 bg-black/60 backdrop-blur-sm lg:flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-center text-[#000000]">
              Buat Post Baru
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 transition-colors disabled:opacity-50"
              aria-label="Tutup"
            >
              <X className="w-5 h-5 text-[#000000]" />
            </button>
          </div>

          <div className="flex h-[80vh]">
            {/* Left Column - Image Preview */}
            <div className="w-1/2 bg-white p-4">
              <div className="h-full flex flex-col">
                {/* Main Preview Area */}
                <div className="flex-1 bg-white rounded-xl overflow-hidden mb-4 relative border border-gray-200">
                  {postData.files.length > 0 ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {filePreviews[selectedFileIndex]?.type === 'image' && filePreviews[selectedFileIndex]?.url ? (
                        <img
                          src={filePreviews[selectedFileIndex].url}
                          alt={`Preview ${selectedFileIndex + 1}`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center">
                          <FileText className="w-12 h-12 text-[#6b7280] mb-2" />
                          <span className="text-[#6b7280] text-sm font-medium">
                            {postData.files[selectedFileIndex]?.name || 'File PDF'}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Image className="w-16 h-16 text-[#6b7280] mx-auto mb-4" />
                        <p className="text-[#6b7280]">Tidak ada file dipilih</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="space-y-3">
                  {postData.files.length > 0 ? (
                    <>
                      <div className="flex space-x-2 overflow-x-auto pt-2">
                        {postData.files.map((file, index) => (
                          <div
                            key={`${file.name}-${index}`} // Better key
                            className={`relative flex-shrink-0 cursor-pointer rounded-lg border-2 transition-all ${selectedFileIndex === index
                                ? 'border-teal-400 ring-2 ring-teal-400/20'
                                : 'border-gray-200 hover:border-gray-300'
                              }`}
                            onClick={() => setSelectedFileIndex(index)}
                          >
                            <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
                              {filePreviews[index]?.type === 'image' && filePreviews[index]?.url ? (
                                <img
                                  src={filePreviews[index].url}
                                  alt={`Thumb ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-[#6b7280]" />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-100 transition-colors"
                              aria-label="Hapus file"
                              disabled={isLoading}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {postData.files.length < 5 && (
                        <label
                          htmlFor="file-upload"
                          className="flex items-center justify-center py-2 px-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm text-[#6b7280]"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Tambah File ({postData.files.length}/5)
                        </label>
                      )}
                    </>
                  ) : (
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="w-8 h-8 text-[#6b7280] mb-2" />
                      <div className="text-center">
                        <p className="text-sm font-medium text-[#000000]">
                          Tambahkan foto atau PDF
                        </p>
                        <p className="text-xs text-[#6b7280] mt-1">
                          Klik untuk mengunggah
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-1/2 p-6 flex flex-col overflow-y-auto border-l border-gray-200">
              <div className="flex-1 space-y-6">
                {/* Text Area */}
                <div className="relative border-b border-gray-200">
                  <textarea
                    placeholder="Masukan caption..."
                    value={postData.caption}
                    onChange={handleCaptionChange}
                    className="w-full h-32 text-[#000000] placeholder-[#6b7280] resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 p-3 rounded-2xl focus:border-transparent transition-all text-sm leading-relaxed"
                    maxLength={2200}
                    disabled={isLoading}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-[#6b7280]">
                    {postData.caption.length}/2200
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#000000] mb-2">Kategori</label>
                    <select
                      value={postData.kategori}
                      onChange={handleCategoryChange}
                      className="w-full p-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-[#000000] text-sm"
                      disabled={isLoading}
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#000000] mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="Contoh: #olahraga #liburan #makanan"
                      value={postData.tags}
                      onChange={handleTagsChange}
                      className="w-full p-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-[#000000] placeholder-[#6b7280] text-sm"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-[#6b7280] mt-1">Pisahkan tags dengan spasi</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-6 mt-auto">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-6 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm disabled:opacity-50"
                  disabled={isLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading || !postData.caption.trim() || postData.files.length === 0}
                  className="flex-1 py-3 px-6 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Memposting...
                    </>
                  ) : (
                    'Bagikan Post'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            onChange={handleLocalFileUpload}
            className="hidden"
            id="file-upload"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Mobile Full Screen */}
      <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
        {/* Mobile Header */}
        <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
          {mobileStep === 'upload' ? (
            <>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <h1 className="text-base font-semibold text-gray-900">Upload Media</h1>
              <button
                onClick={handleMobileNext}
                disabled={postData.files.length === 0}
                className="text-teal-400 font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Lanjut
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleMobileBack}
                disabled={isLoading}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Buat Post</h1>
              <button
                onClick={handleSave}
                disabled={isLoading || !postData.caption.trim()}
                className="text-teal-400 font-medium hover:text-teal-500 transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? 'Posting...' : 'Bagikan'}
              </button>
            </>
          )}
        </header>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          {mobileStep === 'upload' ? (
            // Upload Step
            <div className="p-4 space-y-4">
              {/* Main Preview Area */}
              {postData.files.length > 0 ? (
                <div className="bg-black rounded-xl overflow-hidden aspect-square relative">
                  {filePreviews[selectedFileIndex]?.type === 'image' && filePreviews[selectedFileIndex]?.url ? (
                    <img
                      src={filePreviews[selectedFileIndex].url}
                      alt={`Preview ${selectedFileIndex + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Image load error:', e);
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white">
                      <FileText className="w-16 h-16 mb-4 opacity-75" />
                      <span className="text-sm font-medium opacity-75">
                        {postData.files[selectedFileIndex]?.name || 'File PDF'}
                      </span>
                    </div>
                  )}

                  {/* File counter */}
                  {postData.files.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                      {selectedFileIndex + 1}/{postData.files.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square border-2 border-dashed p-4 border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 text-center mb-2">Belum ada media dipilih</p>
                  <p className="text-xs text-gray-400 text-center">Tap tombol di bawah untuk menambahkan foto atau PDF</p>
                </div>
              )}

              {/* File Thumbnails */}
              {postData.files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex space-x-2 overflow-x-auto pt-2">
                    {postData.files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className={`relative flex-shrink-0 cursor-pointer rounded-lg border-2 transition-all ${selectedFileIndex === index
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-gray-200'
                          }`}
                        onClick={() => setSelectedFileIndex(index)}
                      >
                        <div className="w-20 h-20 bg-gray-50 rounded-md">
                          {filePreviews[index]?.type === 'image' && filePreviews[index]?.url ? (
                            <img
                              src={filePreviews[index].url}
                              alt={`Thumb ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm"
                          aria-label="Hapus file"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {postData.files.length < 5 && (
                <label
                  htmlFor="mobile-file-upload"
                  className="w-full py-3 px-6 bg-black text-white rounded-xl text-sm font-medium text-center cursor-pointer hover:bg-black/60 transition-colors duration-200 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {postData.files.length === 0 ? 'Pilih Media' : `Tambah Media (${postData.files.length}/5)`}
                </label>
              )}
            </div>
          ) : (
            // Details Step
            <div className="p-4 space-y-6">
              {/* Selected Media Preview */}
              <div className="bg-black rounded-xl overflow-hidden aspect-square relative">
                {filePreviews[selectedFileIndex]?.type === 'image' && filePreviews[selectedFileIndex]?.url ? (
                  <img
                    src={filePreviews[selectedFileIndex].url}
                    alt="Selected preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white">
                    <FileText className="w-16 h-16 mb-4 opacity-75" />
                    <span className="text-sm font-medium opacity-75">
                      {postData.files[selectedFileIndex]?.name || 'File PDF'}
                    </span>
                  </div>
                )}

                {/* File counter for details */}
                {postData.files.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {selectedFileIndex + 1}/{postData.files.length}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Caption */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Caption</label>
                  <div className="relative">
                    <textarea
                      placeholder="Tulis caption untuk post Anda..."
                      value={postData.caption}
                      onChange={handleCaptionChange}
                      className="w-full h-32 p-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm leading-relaxed resize-none"
                      maxLength={2200}
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                      {postData.caption.length}/2200
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Kategori</label>
                  <select
                    value={postData.kategori}
                    onChange={handleCategoryChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 text-sm"
                    disabled={isLoading}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="Contoh: #olahraga #liburan #makanan"
                    value={postData.tags}
                    onChange={handleTagsChange}
                    className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">Pisahkan tags dengan spasi</p>
                </div>
              </div>

              {/* File Thumbnails in Details */}
              {postData.files.length > 1 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">Media ({postData.files.length})</label>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {postData.files.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className={`relative flex-shrink-0 cursor-pointer rounded-lg border-2 transition-all ${selectedFileIndex === index
                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                            : 'border-gray-200'
                          }`}
                        onClick={() => setSelectedFileIndex(index)}
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded-md overflow-hidden">
                          {filePreviews[index]?.type === 'image' && filePreviews[index]?.url ? (
                            <img
                              src={filePreviews[index].url}
                              alt={`Thumb ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-black mx-auto mb-2" />
              <p className="text-sm text-gray-600">Memposting...</p>
            </div>
          </div>
        )}

        {/* Hidden file input for mobile */}
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleLocalFileUpload}
          className="hidden"
          id="mobile-file-upload"
          disabled={isLoading}
        />
      </div>

      {/* Success Modal */}
      <SuccessModal
        isVisible={showSuccessModal}
        onClose={handleSuccessModalClose}
      />
    </>
  );
};

export default CreatePostModal;