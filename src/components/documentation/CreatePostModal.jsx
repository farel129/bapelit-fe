import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { X, Camera, Image, FileText, Plus, Trash2, Loader, CheckCircle } from 'lucide-react';

// Success Modal Component
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
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-2xl p-8 shadow-2xl transform animate-pulse">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Post Berhasil Dibagikan!
                    </h3>
                    <p className="text-gray-600 text-sm">
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

    if (!showCreatePost) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="relative px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-center text-gray-900">
                            Buat Post Baru
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            aria-label="Tutup"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex h-[80vh]">
                        {/* Left Column - Image Preview */}
                        <div className="w-1/2 bg-white p-4">
                            <div className="h-full flex flex-col">
                                {/* Main Preview Area */}
                                <div className="flex-1 bg-white rounded-lg overflow-hidden mb-4 relative">
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
                                                <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex flex-col items-center justify-center">
                                                    <FileText className="w-12 h-12 text-gray-400 mb-2" />
                                                    <span className="text-gray-600">
                                                        {postData.files[selectedFileIndex]?.name || 'File PDF'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500">Tidak ada file dipilih</p>
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
                                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => setSelectedFileIndex(index)}
                                                    >
                                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
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
                                                                <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFile(index);
                                                            }}
                                                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                                                            aria-label="Hapus file"
                                                            disabled={isLoading}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {postData.files.length < 5 && (
                                                <label
                                                    htmlFor="file-upload"
                                                    className="flex items-center justify-center py-2 px-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors text-sm text-gray-600"
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
                                            <Plus className="w-8 h-8 text-gray-400 mb-2" />
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-600">
                                                    Tambahkan foto atau PDF
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Klik untuk mengunggah
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Form */}
                        <div className="w-1/2 p-3 flex flex-col overflow-y-auto border-l border-slate-200">
                            <div className="flex-1 space-y-6">
                                {/* Text Area */}
                                <div className="relative border-b border-slate-200">
                                    <textarea
                                        placeholder="Masukan caption..."
                                        value={postData.caption}
                                        onChange={handleCaptionChange}
                                        className="w-full h-32 text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:border-transparent text-sm leading-relaxed"
                                        maxLength={2200}
                                        disabled={isLoading}
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                        {postData.caption.length}/2200
                                    </div>
                                </div>

                                {/* Category and Tags */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                                        <select
                                            value={postData.kategori}
                                            onChange={handleCategoryChange}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <input
                                            type="text"
                                            placeholder="Contoh: #olahraga #liburan #makanan"
                                            value={postData.tags}
                                            onChange={handleTagsChange}
                                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm placeholder-gray-400"
                                            disabled={isLoading}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Pisahkan tags dengan spasi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-3 pt-6 mt-auto">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 py-3 px-4 text-gray-700 font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isLoading || !postData.caption.trim() || postData.files.length === 0}
                                    className="flex-1 py-3 px-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-medium rounded-lg hover:from-pink-600 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center"
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

            {/* Success Modal */}
            <SuccessModal 
                isVisible={showSuccessModal} 
                onClose={handleSuccessModalClose} 
            />
        </>
    );
};

export default CreatePostModal;