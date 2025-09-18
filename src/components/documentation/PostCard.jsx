import React, { useState } from 'react';
import { Camera, Heart, MessageCircle, Send, MoreHorizontal, Edit3, Trash2, Bookmark, Loader2, FileText, Loader } from 'lucide-react';
import { canEditPost, canDeletePost } from '../../utils/postUtils';
import { formatDate } from '../../utils/dateUtils';
import LoadingSpinner from '../Ui/LoadingSpinner';

const PostCard = ({
    post,
    showActions = true,
    user,
    handleLike,
    openPostDetail,
    handleComment,
    newComment,
    setNewComment,
    setShowPostMenu,
    showPostMenu,
    setEditingPost,
    setShowDeleteConfirm,
    setCurrentPage,
    loadUserProfile
}) => {
    const [localComment, setLocalComment] = useState('');
    const [isLoadingProfile, setIsLoadingProfile] = useState(false);
    const [isLoadingPost, setIsLoadingPost] = useState(false);
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    
    // New states for expandable text
    const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
    const [expandedComments, setExpandedComments] = useState(new Set());
    
    // State for image loading
    const [imageErrors, setImageErrors] = useState(new Set());
    const [imageLoading, setImageLoading] = useState(new Set());

    // Configuration for text truncation
    const CAPTION_LIMIT = 150; // characters
    const COMMENT_LIMIT = 100; // characters

    const handleCommentSubmit = async (postId) => {
        if (localComment.trim()) {
            setIsSubmittingComment(true);
            try {
                await handleComment(postId, localComment);
                setLocalComment('');
            } catch (error) {
                console.error('Error submitting comment:', error);
            } finally {
                setIsSubmittingComment(false);
            }
        }
    };

    const handleProfileClick = async (userId) => {
        setIsLoadingProfile(true);
        try {
            setCurrentPage('profile');
            await loadUserProfile(userId);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    const handlePostClick = async (postId) => {
        setIsLoadingPost(true);
        try {
            await openPostDetail(postId);
        } catch (error) {
            console.error('Error opening post detail:', error);
        } finally {
            setIsLoadingPost(false);
        }
    };

    // Helper function to handle image load error
    const handleImageError = (fileId) => {
        setImageErrors(prev => new Set(prev).add(fileId));
        setImageLoading(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
        });
    };

    // Helper function to handle image load start
    const handleImageLoadStart = (fileId) => {
        setImageLoading(prev => new Set(prev).add(fileId));
    };

    // Helper function to handle image load success
    const handleImageLoad = (fileId) => {
        setImageLoading(prev => {
            const newSet = new Set(prev);
            newSet.delete(fileId);
            return newSet;
        });
    };

    // Helper function to toggle comment expansion
    const toggleCommentExpansion = (commentId) => {
        const newExpandedComments = new Set(expandedComments);
        if (newExpandedComments.has(commentId)) {
            newExpandedComments.delete(commentId);
        } else {
            newExpandedComments.add(commentId);
        }
        setExpandedComments(newExpandedComments);
    };

    // Helper function to render expandable text
    const renderExpandableText = (text, limit, isExpanded, onToggle, className = "") => {
        if (!text || text.length <= limit) {
            return <span className={className}>{text}</span>;
        }

        const shouldTruncate = !isExpanded;
        const displayText = shouldTruncate ? `${text.slice(0, limit)}...` : text;

        return (
            <>
                <span className={className}>{displayText}</span>
                <button
                    onClick={onToggle}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium ml-1 transition-colors duration-200"
                >
                    {shouldTruncate ? 'selengkapnya' : 'lebih sedikit'}
                </button>
            </>
        );
    };

    // Check permissions
    const canEdit = canEditPost(post, user);
    const canDelete = canDeletePost(post, user);
    const showMenu = canEdit || canDelete;

    return (
        <article className="bg-white border border-gray-200 rounded-lg mb-6 max-w-lg mx-auto shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <header className="flex items-center justify-between p-3">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => handleProfileClick(post.user.id)}
                        className="relative"
                        disabled={isLoadingProfile}
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                {isLoadingProfile ? (
                                    <LoadingSpinner />
                                ) : (
                                    <span className="text-xs font-semibold text-gray-700">
                                        {post.user.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>
                    <div className="flex flex-col">
                        <button
                            onClick={() => handleProfileClick(post.user.id)}
                            className="text-sm font-semibold text-gray-900 hover:text-gray-600 text-left disabled:opacity-50"
                            disabled={isLoadingProfile}
                        >
                            {post.user.name}
                        </button>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>{formatDate(post.created_at)}</span>
                            {post.kategori && (
                                <>
                                    <span>•</span>
                                    <span className="text-blue-600 font-medium">{post.kategori}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                {showActions && showMenu && (
                    <div className="relative">
                        <button
                            onClick={() => setShowPostMenu(showPostMenu === post.id ? null : post.id)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <MoreHorizontal className="w-4 h-4 text-gray-700" />
                        </button>
                        {showPostMenu === post.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                                {canEdit && (
                                    <button
                                        onClick={() => {
                                            setEditingPost({
                                                id: post.id,
                                                caption: post.caption,
                                                kategori: post.kategori,
                                                tags: post.tags
                                            });
                                            setShowPostMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center transition-colors duration-150"
                                    >
                                        <Edit3 className="w-4 h-4 mr-3 text-gray-500" />
                                        Edit Post
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => {
                                            setShowDeleteConfirm(post.id);
                                            setShowPostMenu(null);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center text-red-600 transition-colors duration-150"
                                    >
                                        <Trash2 className="w-4 h-4 mr-3" />
                                        Hapus Post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </header>

            {/* Media Content - FIXED */}
            {post.files && Array.isArray(post.files) && post.files.length > 0 && (
                <div className="relative w-full">
                    {/* Loading overlay for post content */}
                    {isLoadingPost && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <LoadingSpinner />
                        </div>
                    )}
                    
                    {post.files.length === 1 ? (
                        <div className="aspect-square bg-gray-50 overflow-hidden relative">
                            {post.files[0].mime_type?.startsWith('image/') ? (
                                <>
                                    {/* Loading indicator for individual image */}
                                    {imageLoading.has(post.files[0].id) && (
                                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                            <LoadingSpinner />
                                        </div>
                                    )}
                                    
                                    {/* Error fallback */}
                                    {imageErrors.has(post.files[0].id) ? (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                                            <Camera className="w-16 h-16 text-gray-400 mb-2" />
                                            <p className="text-xs text-gray-500 text-center px-4">
                                                Gambar tidak dapat dimuat
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setImageErrors(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.delete(post.files[0].id);
                                                        return newSet;
                                                    });
                                                    handleImageLoadStart(post.files[0].id);
                                                }}
                                                className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                                            >
                                                Coba lagi
                                            </button>
                                        </div>
                                    ) : (
                                        <img
                                            src={post.files[0].file_url}
                                            alt="Post content"
                                            className={`w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300 ${
                                                isLoadingPost ? 'pointer-events-none' : ''
                                            } ${imageLoading.has(post.files[0].id) ? 'opacity-0' : 'opacity-100'}`}
                                            onDoubleClick={() => !isLoadingPost && handleLike(post.id)}
                                            onClick={() => !isLoadingPost && handlePostClick(post.id)}
                                            onLoadStart={() => handleImageLoadStart(post.files[0].id)}
                                            onLoad={() => handleImageLoad(post.files[0].id)}
                                            onError={() => handleImageError(post.files[0].id)}
                                        />
                                    )}
                                </>
                            ) : (
                                <div 
                                    className={`w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors duration-200 ${
                                        isLoadingPost ? 'pointer-events-none' : ''
                                    }`}
                                    onClick={() => !isLoadingPost && handlePostClick(post.id)}
                                >
                                    <FileText className="w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-xs text-gray-500 px-4 text-center">{post.files[0].original_name}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div 
                            className={`grid grid-cols-2 gap-0.5 aspect-square cursor-pointer overflow-hidden rounded-sm ${
                                isLoadingPost ? 'pointer-events-none' : ''
                            }`}
                            onClick={() => !isLoadingPost && handlePostClick(post.id)}
                        >
                            {post.files.slice(0, 4).map((file, index) => (
                                <div key={file.id} className="relative bg-gray-50 overflow-hidden">
                                    {file.mime_type?.startsWith('image/') ? (
                                        <>
                                            {/* Loading indicator for grid images */}
                                            {imageLoading.has(file.id) && (
                                                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                                                    <Loader className="w-4 h-4 animate-spin text-gray-400" />
                                                </div>
                                            )}
                                            
                                            {/* Error fallback for grid images */}
                                            {imageErrors.has(file.id) ? (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <Camera className="w-6 h-6 text-gray-400" />
                                                </div>
                                            ) : (
                                                <img
                                                    src={file.file_url}
                                                    alt={`Media ${index + 1}`}
                                                    className={`w-full h-full object-cover hover:scale-105 transition-transform duration-300 ${
                                                        imageLoading.has(file.id) ? 'opacity-0' : 'opacity-100'
                                                    }`}
                                                    onLoadStart={() => handleImageLoadStart(file.id)}
                                                    onLoad={() => handleImageLoad(file.id)}
                                                    onError={() => handleImageError(file.id)}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <FileText className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                    {index === 3 && post.files.length > 4 && (
                                        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">+{post.files.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Debug info - remove in production */}
            {(!post.files || !Array.isArray(post.files) || post.files.length === 0) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-3 my-2">
                    <p className="text-sm text-yellow-800 font-medium">Debug Info:</p>
                    <p className="text-xs text-yellow-700 mt-1">
                        Files: {post.files ? `Array dengan ${post.files.length} item` : 'null/undefined'}
                    </p>
                    {post.files && post.files.length > 0 && (
                        <p className="text-xs text-yellow-700">
                            First file URL: {post.files[0]?.file_url || 'tidak ada'}
                        </p>
                    )}
                </div>
            )}

            {/* Rest of the component remains the same */}
            {/* Actions Bar */}
            <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => handleLike(post.id)}
                            className={`transition-all duration-200 transform hover:scale-110 ${
                                post.is_liked ? 'text-red-500' : 'text-gray-700 hover:text-gray-500'
                            }`}
                        >
                            <Heart className={`w-6 h-6 ${post.is_liked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={() => handlePostClick(post.id)}
                            className={`text-gray-700 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110 ${
                                isLoadingPost ? 'opacity-50 pointer-events-none' : ''
                            }`}
                            disabled={isLoadingPost}
                        >
                            {isLoadingPost ? (
                                <Loader className="w-6 h-6 animate-spin" />
                            ) : (
                                <MessageCircle className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                    <button className="text-gray-700 hover:text-gray-500 transition-colors duration-200 transform hover:scale-110">
                        <Bookmark className="w-6 h-6" />
                    </button>
                </div>

                {/* Likes Count */}
                {post.likes_count > 0 && (
                    <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                            {post.likes_count} {post.likes_count === 1 ? 'suka' : 'suka'}
                        </span>
                    </div>
                )}

                {/* Caption with expandable text */}
                {post.caption && (
                    <div className="mb-2">
                        <div className="text-sm break-words">
                            <span className="font-semibold text-gray-900 mr-2">{post.user.name}</span>
                            {renderExpandableText(
                                post.caption,
                                CAPTION_LIMIT,
                                isCaptionExpanded,
                                () => setIsCaptionExpanded(!isCaptionExpanded),
                                "text-gray-900 break-words whitespace-pre-wrap"
                            )}
                        </div>
                        {post.tags && (
                            <div className="mt-1">
                                <span className="text-sm text-blue-600 font-medium break-words">{post.tags}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Comments with expandable text */}
                {post.latest_comments && post.latest_comments.length > 0 && (
                    <div className="space-y-1 mb-2">
                        {post.comments_count > post.latest_comments.length && (
                            <button
                                onClick={() => handlePostClick(post.id)}
                                className={`text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 ${
                                    isLoadingPost ? 'opacity-50 pointer-events-none' : ''
                                }`}
                                disabled={isLoadingPost}
                            >
                                {isLoadingPost ? 'Memuat...' : `Lihat semua ${post.comments_count} komentar`}
                            </button>
                        )}
                        {post.latest_comments.map(comment => (
                            <div key={comment.id} className="text-sm break-words">
                                <span className="font-semibold text-gray-900 mr-2">{comment.user.name}</span>
                                {renderExpandableText(
                                    comment.comment,
                                    COMMENT_LIMIT,
                                    expandedComments.has(comment.id),
                                    () => toggleCommentExpansion(comment.id),
                                    "text-gray-900 break-words whitespace-pre-wrap"
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Comment */}
                <div className="flex items-start space-x-3 pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-teal-400 to-orange-400 rounded-full p-0.5 flex-shrink-0 mt-1">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-700">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <textarea
                            placeholder="Tambah komentar..."
                            value={localComment}
                            onChange={(e) => setLocalComment(e.target.value)}
                            className="w-full text-sm bg-transparent placeholder-gray-500 focus:outline-none disabled:opacity-50 resize-none border-none p-0 min-h-[20px] max-h-24 overflow-y-auto"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (!isSubmittingComment && localComment.trim()) {
                                        handleCommentSubmit(post.id);
                                    }
                                }
                            }}
                            disabled={isSubmittingComment}
                            rows={1}
                        />
                        {localComment.trim() && (
                            <div className="flex justify-end mt-1">
                                <button
                                    onClick={() => handleCommentSubmit(post.id)}
                                    className="text-sm font-semibold text-blue-500 hover:text-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center"
                                    disabled={isSubmittingComment}
                                >
                                    {isSubmittingComment ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                            Mengirim...
                                        </>
                                    ) : (
                                        'Kirim'
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
};

export default PostCard;