import React, { useState } from 'react';
import { X, Heart, Send, MessageCircle, Camera, Eye, Trash2, MoreHorizontal, Edit3, Bookmark, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { canEditPost } from '../../utils/postUtils';

const PostDetailModal = ({
    selectedPost,
    setSelectedPost,
    user,
    handleLike,
    handleComment,
    handleDeleteComment,
    newComment,
    setNewComment,
    setEditingPost,
    setShowDeleteConfirm
}) => {
    const [localComment, setLocalComment] = useState('');
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [expandedCaption, setExpandedCaption] = useState(false);

    const handleCommentSubmit = (postId) => {
        if (localComment.trim()) {
            handleComment(postId, localComment);
            setLocalComment('');
        }
    };

    const nextImage = () => {
        if (selectedPost.files && selectedPost.files.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === selectedPost.files.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (selectedPost.files && selectedPost.files.length > 1) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? selectedPost.files.length - 1 : prev - 1
            );
        }
    };

    const toggleCommentExpansion = (commentId) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
        } else {
            newExpanded.add(commentId);
        }
        setExpandedComments(newExpanded);
    };

    const shouldTruncateText = (text, maxLength = 100) => {
        return text && text.length > maxLength;
    };

    const getTruncatedText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const renderTextWithExpansion = (text, id, isExpanded, onToggle, maxLength = 100) => {
        if (!shouldTruncateText(text, maxLength)) {
            return text;
        }

        return (
            <>
                {isExpanded ? text : getTruncatedText(text, maxLength)}
                {shouldTruncateText(text, maxLength) && (
                    <button
                        onClick={() => onToggle(id)}
                        className="text-gray-500 hover:text-gray-700 ml-1 text-sm font-medium transition-colors duration-200"
                    >
                        {isExpanded ? 'lebih sedikit' : 'selengkapnya'}
                    </button>
                )}
            </>
        );
    };

    if (!selectedPost) return null;

    return (
        <>
            {/* Desktop Modal */}
            <div className="hidden fixed inset-0 bg-black/50 backdrop-blur-md lg:flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] mx-auto flex flex-row overflow-hidden shadow-2xl relative">
                    
                    {/* Left Side - Media */}
                    <div className="flex-1 bg-black relative flex items-center justify-center">
                        {selectedPost.files && selectedPost.files.length > 0 ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {selectedPost.files[currentImageIndex].mime_type?.startsWith('image/') ? (
                                    <img
                                        src={selectedPost.files[currentImageIndex].file_url}
                                        alt="Post content"
                                        className="object-contain aspect-square"
                                    />
                                ) : (
                                    <div className="text-center text-white p-8">
                                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg mb-2">{selectedPost.files[currentImageIndex].original_name}</p>
                                        <p className="text-sm opacity-75">
                                            {selectedPost.files[currentImageIndex].file_size ?
                                                `${(selectedPost.files[currentImageIndex].file_size / 1024).toFixed(1)} KB` :
                                                'Unknown size'
                                            }
                                        </p>
                                        <a
                                            href={selectedPost.files[currentImageIndex].file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View File
                                        </a>
                                    </div>
                                )}

                                {/* Navigation Arrows */}
                                {selectedPost.files.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm hover:bg-black rounded-full flex items-center justify-center text-white transition-all duration-200"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 backdrop-blur-sm hover:bg-black rounded-full flex items-center justify-center text-white transition-all duration-200"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image Indicators */}
                                {selectedPost.files.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                        {selectedPost.files.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                                                    ? 'bg-white'
                                                    : 'bg-gray-500 hover:bg-opacity-75'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-white p-8">
                                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">No media available</p>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Details */}
                    <div className="w-96 flex flex-col bg-white relative">
                        {/* Header */}
                        <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5">
                                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                        <span className="text-xs font-semibold text-gray-700">
                                            {selectedPost.user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{selectedPost.user.name}</h3>
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <span>{formatDate(selectedPost.created_at)}</span>
                                        {selectedPost.kategori && (
                                            <>
                                                <span>•</span>
                                                <span className="text-blue-600 font-medium">{selectedPost.kategori}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-1">
                                {canEditPost(selectedPost, user) && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowPostMenu(!showPostMenu)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                        >
                                            <MoreHorizontal className="w-4 h-4 text-gray-700" />
                                        </button>
                                        {showPostMenu && (
                                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                                                <button
                                                    onClick={() => {
                                                        setEditingPost({
                                                            id: selectedPost.id,
                                                            caption: selectedPost.caption,
                                                            kategori: selectedPost.kategori,
                                                            tags: selectedPost.tags
                                                        });
                                                        setShowPostMenu(false);
                                                        setSelectedPost(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center transition-colors duration-150"
                                                >
                                                    <Edit3 className="w-4 h-4 mr-3 text-gray-500" />
                                                    Edit Post
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeleteConfirm(selectedPost.id);
                                                        setShowPostMenu(false);
                                                        setSelectedPost(null);
                                                    }}
                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600 transition-colors duration-150"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-3" />
                                                    Hapus Post
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors duration-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </header>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col overflow-y-auto">
                            {/* Caption and Details */}
                            <div className="px-4 py-3 border-b border-gray-100">
                                {selectedPost.caption && (
                                    <div className="mb-3">
                                        <span className="text-sm">
                                            <span className="font-semibold text-gray-900 mr-2">{selectedPost.user.name}</span>
                                            <span className="text-gray-900">
                                                {renderTextWithExpansion(
                                                    selectedPost.caption, 
                                                    'caption', 
                                                    expandedCaption, 
                                                    () => setExpandedCaption(!expandedCaption),
                                                    120
                                                )}
                                            </span>
                                        </span>
                                    </div>
                                )}
                                {selectedPost.tags && (
                                    <div className="mb-3">
                                        <span className="text-sm text-blue-600 font-medium">{selectedPost.tags}</span>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => handleLike(selectedPost.id)}
                                            className={`transition-all duration-200 transform hover:scale-110 ${selectedPost.likes?.is_liked ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'
                                                }`}
                                        >
                                            <Heart className={`w-5 h-5 ${selectedPost.likes?.is_liked ? 'fill-current' : ''}`} />
                                        </button>
                                        <button className="text-gray-700 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110">
                                            <MessageCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <button className="text-gray-700 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Likes Count */}
                                {(selectedPost.likes?.count || 0) > 0 && (
                                    <div className="mt-2">
                                        <span className="text-sm font-semibold text-gray-900">
                                            {selectedPost.likes?.count || 0} {(selectedPost.likes?.count || 0) === 1 ? 'suka' : 'suka'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div className="flex-1 flex flex-col">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <span className="text-sm font-semibold text-gray-900">
                                        Komentar ({selectedPost.comments?.length || 0})
                                    </span>
                                </div>

                                {/* Comments List */}
                                <div className="flex-1 px-4 py-2 mb-20">
                                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedPost.comments.map(comment => (
                                                <div key={comment.id} className="flex items-start space-x-3">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5 flex-shrink-0">
                                                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                {comment.user.name.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1 pr-2">
                                                                <span className="text-sm block">
                                                                    <span className="font-semibold text-gray-900 mr-2">{comment.user.name}</span>
                                                                    <span className="text-gray-900">
                                                                        {renderTextWithExpansion(
                                                                            comment.comment, 
                                                                            comment.id, 
                                                                            expandedComments.has(comment.id), 
                                                                            toggleCommentExpansion,
                                                                            80
                                                                        )}
                                                                    </span>
                                                                </span>
                                                                <div className="mt-1 flex items-center space-x-3">
                                                                    <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                                                    <button className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200">
                                                                        Balas
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {(comment.user.id === user?.id || canEditPost(selectedPost, user)) && (
                                                                <button
                                                                    onClick={() => handleDeleteComment(comment.id)}
                                                                    className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-8">
                                            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="text-sm">Belum ada komentar</p>
                                            <p className="text-xs mt-1">Jadilah yang pertama berkomentar</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add Comment */}
                                <div className="px-4 py-3 flex-1 flex w-full border-t border-gray-100 absolute bottom-0 bg-white">
                                    <div className="flex items-center w-full space-x-3">
                                        <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5 flex-shrink-0">
                                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Tambah komentar..."
                                            value={localComment}
                                            onChange={(e) => setLocalComment(e.target.value)}
                                            className="flex-1 text-sm bg-transparent placeholder-gray-500 focus:outline-none"
                                            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(selectedPost.id)}
                                        />
                                        {localComment.trim() && (
                                            <button
                                                onClick={() => handleCommentSubmit(selectedPost.id)}
                                                className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors duration-200"
                                            >
                                                Kirim
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Full Screen */}
            <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
                {/* Mobile Header */}
                <header className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
                    <button
                        onClick={() => setSelectedPost(null)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-700 hover:text-gray-900 transition-colors duration-200"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h1 className="text-base font-semibold text-gray-900">Post</h1>
                    <div className="flex items-center space-x-1">
                        {canEditPost(selectedPost, user) && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowPostMenu(!showPostMenu)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <MoreHorizontal className="w-5 h-5 text-gray-700" />
                                </button>
                                {showPostMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                                        <button
                                            onClick={() => {
                                                setEditingPost({
                                                    id: selectedPost.id,
                                                    caption: selectedPost.caption,
                                                    kategori: selectedPost.kategori,
                                                    tags: selectedPost.tags
                                                });
                                                setShowPostMenu(false);
                                                setSelectedPost(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center transition-colors duration-150"
                                        >
                                            <Edit3 className="w-4 h-4 mr-3 text-gray-500" />
                                            Edit Post
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowDeleteConfirm(selectedPost.id);
                                                setShowPostMenu(false);
                                                setSelectedPost(null);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600 transition-colors duration-150"
                                        >
                                            <Trash2 className="w-4 h-4 mr-3" />
                                            Hapus Post
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </header>

                {/* Mobile Content - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {/* Media Section */}
                    <div className="bg-black relative aspect-square w-full">
                        {selectedPost.files && selectedPost.files.length > 0 ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {selectedPost.files[currentImageIndex].mime_type?.startsWith('image/') ? (
                                    <img
                                        src={selectedPost.files[currentImageIndex].file_url}
                                        alt="Post content"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-white p-8">
                                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg mb-2">{selectedPost.files[currentImageIndex].original_name}</p>
                                        <p className="text-sm opacity-75">
                                            {selectedPost.files[currentImageIndex].file_size ?
                                                `${(selectedPost.files[currentImageIndex].file_size / 1024).toFixed(1)} KB` :
                                                'Unknown size'
                                            }
                                        </p>
                                        <a
                                            href={selectedPost.files[currentImageIndex].file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center mt-4 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            View File
                                        </a>
                                    </div>
                                )}

                                {/* Navigation Arrows for Mobile */}
                                {selectedPost.files.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/30 backdrop-blur-sm hover:bg-black rounded-full flex items-center justify-center text-white transition-all duration-200"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/30 backdrop-blur-sm hover:bg-black rounded-full flex items-center justify-center text-white transition-all duration-200"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image Indicators for Mobile */}
                                {selectedPost.files.length > 1 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                        {selectedPost.files.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentImageIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentImageIndex
                                                    ? 'bg-white'
                                                    : 'bg-gray-500 hover:bg-opacity-75'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-white p-8 flex flex-col items-center justify-center h-full">
                                <Camera className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg">No media available</p>
                            </div>
                        )}
                    </div>

                    {/* Post Info Section */}
                    <div className="bg-white">
                        {/* User Info */}
                        <div className="px-4 py-3 flex items-center space-x-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                    <span className="text-sm font-semibold text-gray-700">
                                        {selectedPost.user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">{selectedPost.user.name}</h3>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <span>{formatDate(selectedPost.created_at)}</span>
                                    {selectedPost.kategori && (
                                        <>
                                            <span>•</span>
                                            <span className="text-blue-600 font-medium">{selectedPost.kategori}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="px-4 pb-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleLike(selectedPost.id)}
                                        className={`transition-all duration-200 transform hover:scale-110 ${selectedPost.likes?.is_liked ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'
                                            }`}
                                    >
                                        <Heart className={`w-6 h-6 ${selectedPost.likes?.is_liked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="text-gray-700 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110">
                                        <MessageCircle className="w-6 h-6" />
                                    </button>
                                </div>
                                <button className="text-gray-700 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110">
                                    <Bookmark className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Likes Count */}
                        {(selectedPost.likes?.count || 0) > 0 && (
                            <div className="px-4 pb-2">
                                <span className="text-sm font-semibold text-gray-900">
                                    {selectedPost.likes?.count || 0} {(selectedPost.likes?.count || 0) === 1 ? 'suka' : 'suka'}
                                </span>
                            </div>
                        )}

                        {/* Caption */}
                        {selectedPost.caption && (
                            <div className="px-4 pb-2">
                                <span className="text-sm">
                                    <span className="font-semibold text-gray-900 mr-2">{selectedPost.user.name}</span>
                                    <span className="text-gray-900">
                                        {renderTextWithExpansion(
                                            selectedPost.caption, 
                                            'caption', 
                                            expandedCaption, 
                                            () => setExpandedCaption(!expandedCaption),
                                            120
                                        )}
                                    </span>
                                </span>
                            </div>
                        )}

                        {/* Tags */}
                        {selectedPost.tags && (
                            <div className="px-4 pb-3">
                                <span className="text-sm text-blue-600 font-medium">{selectedPost.tags}</span>
                            </div>
                        )}

                        {/* Comments Header */}
                        <div className="px-4 py-3 border-t border-gray-100">
                            <span className="text-sm font-semibold text-gray-900">
                                Komentar ({selectedPost.comments?.length || 0})
                            </span>
                        </div>

                        {/* Comments List */}
                        <div className="px-4 pb-20">
                            {selectedPost.comments && selectedPost.comments.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedPost.comments.map(comment => (
                                        <div key={comment.id} className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5 flex-shrink-0">
                                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {comment.user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 pr-2">
                                                        <span className="text-sm block">
                                                            <span className="font-semibold text-gray-900 mr-2">{comment.user.name}</span>
                                                            <span className="text-gray-900">
                                                                {renderTextWithExpansion(
                                                                    comment.comment, 
                                                                    comment.id, 
                                                                    expandedComments.has(comment.id), 
                                                                    toggleCommentExpansion,
                                                                    80
                                                                )}
                                                            </span>
                                                        </span>
                                                        <div className="mt-1 flex items-center space-x-4">
                                                            <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                                                            <button className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200">
                                                                Balas
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {(comment.user.id === user?.id || canEditPost(selectedPost, user)) && (
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500 py-12">
                                    <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                                    <p className="text-base mb-1">Belum ada komentar</p>
                                    <p className="text-sm">Jadilah yang pertama berkomentar</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Comment Input - Fixed at Bottom */}
                <div className="bg-white border-t border-gray-200 px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5 flex-shrink-0">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                <span className="text-xs font-semibold text-gray-700">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <input
                            type="text"
                            placeholder="Tambah komentar..."
                            value={localComment}
                            onChange={(e) => setLocalComment(e.target.value)}
                            className="flex-1 text-sm bg-gray-50 rounded-full px-4 py-2 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                            onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit(selectedPost.id)}
                        />
                        {localComment.trim() && (
                            <button
                                onClick={() => handleCommentSubmit(selectedPost.id)}
                                className="text-sm font-semibold text-blue-500 hover:text-blue-700 px-3 py-2 transition-colors duration-200"
                            >
                                Kirim
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PostDetailModal;