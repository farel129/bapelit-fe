// src/components/TrendingView.js
import React, { useState } from 'react';
import { TrendingUp, Camera, Heart, MessageCircle, Flame, Loader2, FileText, Video, Music, File, Loader } from 'lucide-react';
import LoadingSpinner from '../Ui/LoadingSpinner';

const TrendingView = ({
    trendingPosts,
    loading,
    openPostDetail,
    setCurrentPage,
    loadUserProfile }) => {

    const [loadingPostId, setLoadingPostId] = useState(null);
    const [loadingProfileId, setLoadingProfileId] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());

    // Function to get content type icon and background color
    const getContentTypeDisplay = (post) => {
        // Check if we have a valid image that hasn't failed to load
        const hasValidImage = post.thumbnail && !imageErrors.has(post.id);
        
        if (hasValidImage) {
            return null; // Will render image
        }

        // Determine content type based on post data
        const contentType = post.content_type || post.type;
        const fileName = post.filename || post.title || '';
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        // Video files
        if (contentType?.includes('video') || ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(fileExtension)) {
            return {
                icon: Video,
                background: 'from-red-400 to-red-600',
                label: 'Video'
            };
        }

        // Audio files  
        if (contentType?.includes('audio') || ['mp3', 'wav', 'flac', 'm4a', 'aac'].includes(fileExtension)) {
            return {
                icon: Music,
                background: 'from-purple-400 to-purple-600',
                label: 'Audio'
            };
        }

        // Text/Document files
        if (contentType?.includes('text') || ['txt', 'doc', 'docx', 'pdf', 'rtf'].includes(fileExtension)) {
            return {
                icon: FileText,
                background: 'from-blue-400 to-blue-600',
                label: 'Document'
            };
        }

        // Default fallback
        return {
            icon: File,
            background: 'from-gray-400 to-gray-600',
            label: 'File'
        };
    };

    const handleImageError = (postId) => {
        setImageErrors(prev => new Set([...prev, postId]));
    };

    const handlePostClick = async (postId) => {
        setLoadingPostId(postId);
        try {
            await openPostDetail(postId);
        } catch (error) {
            console.error('Error opening post detail:', error);
        } finally {
            setLoadingPostId(null);
        }
    };

    const handleProfileClick = async (userId) => {
        setLoadingProfileId(userId);
        try {
            setCurrentPage('profile');
            await loadUserProfile(userId);
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoadingProfileId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mb-30">
            {/* Header Section */}
            <div className="mb-6">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-black p-3 rounded-full">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Trending</h1>
                    <p className="text-gray-500 text-sm">Post paling populer minggu ini</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-16">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {trendingPosts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-4">
                            {trendingPosts.map((post, index) => {
                                const contentDisplay = getContentTypeDisplay(post);
                                const hasValidImage = post.thumbnail && !imageErrors.has(post.id);
                                
                                return (
                                    <div key={post.id} className="bg-white group">
                                        <div
                                            className="relative cursor-pointer"
                                            onClick={() => !loadingPostId && handlePostClick(post.id)}
                                        >
                                            {/* Image Container */}
                                            <div className="relative aspect-square overflow-hidden bg-gray-50">
                                                {hasValidImage ? (
                                                    <img
                                                        src={post.thumbnail}
                                                        alt="Post"
                                                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                                                            loadingPostId === post.id ? 'opacity-50' : ''
                                                        }`}
                                                        onError={() => handleImageError(post.id)}
                                                    />
                                                ) : contentDisplay ? (
                                                    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${contentDisplay.background} text-white transition-transform duration-300 group-hover:scale-105 ${
                                                        loadingPostId === post.id ? 'opacity-50' : ''
                                                    }`}>
                                                        <contentDisplay.icon className="w-8 h-8 md:w-12 md:h-12 mb-1 md:mb-2" />
                                                        <span className="text-xs md:text-sm font-medium opacity-90">
                                                            {contentDisplay.label}
                                                        </span>
                                                        {/* File extension indicator */}
                                                        {post.filename && (
                                                            <span className="text-xs opacity-70 mt-1">
                                                                {post.filename.split('.').pop()?.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                        <Camera className="w-12 h-12 text-gray-300" />
                                                    </div>
                                                )}

                                                {/* Loading Overlay for specific post */}
                                                {loadingPostId === post.id && (
                                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                                        <LoadingSpinner />
                                                    </div>
                                                )}

                                                {/* Ranking Badge */}
                                                <div className="absolute top-2 left-2">
                                                    <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                                                        <TrendingUp className="w-3 h-3 mr-1" />
                                                        #{index + 1}
                                                    </div>
                                                </div>

                                                {/* Multiple Images Indicator */}
                                                {post.files_count > 1 && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                                                            1/{post.files_count}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Content Type Badge for non-images */}
                                                {contentDisplay && (
                                                    <div className="absolute bottom-2 right-2 z-20">
                                                        <div className="bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                                                            <contentDisplay.icon className="w-3 h-3 mr-1" />
                                                            <span>{contentDisplay.label}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Hover Overlay */}
                                                <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center ${
                                                    loadingPostId === post.id ? 'pointer-events-none' : ''
                                                }`}>
                                                    <div className="flex items-center space-x-4 text-white">
                                                        <div className="flex items-center">
                                                            <Heart className="w-5 h-5 mr-1 fill-current" />
                                                            <span className="font-semibold">{post.recent_likes}</span>
                                                        </div>
                                                        <div className="flex items-center">
                                                            <MessageCircle className="w-5 h-5 mr-1" />
                                                            <span className="font-semibold">{post.comments_count}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Post Info - Only visible on larger screens */}
                                        <div className="hidden md:block p-3">
                                            {/* User Info */}
                                            <div className="flex items-center space-x-2 mb-2">
                                                <button
                                                    onClick={() => !loadingProfileId && handleProfileClick(post.user.id)}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold transition-transform hover:scale-110 ${
                                                        loadingProfileId === post.user.id ? 'opacity-50 pointer-events-none' : ''
                                                    }`}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                                    }}
                                                    disabled={loadingProfileId === post.user.id}
                                                >
                                                    {loadingProfileId === post.user.id ? (
                                                        <Loader className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        post.user.name.charAt(0).toUpperCase()
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => !loadingProfileId && handleProfileClick(post.user.id)}
                                                    className={`font-semibold text-sm text-gray-900 hover:text-blue-600 transition-colors ${
                                                        loadingProfileId === post.user.id ? 'opacity-50 pointer-events-none' : ''
                                                    }`}
                                                    disabled={loadingProfileId === post.user.id}
                                                >
                                                    {loadingProfileId === post.user.id ? 'Memuat...' : post.user.name}
                                                </button>
                                            </div>

                                            {/* Caption */}
                                            <p className="text-gray-900 text-sm mb-2 line-clamp-2 leading-relaxed">
                                                {post.caption}
                                            </p>
                                            
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="bg-gray-50 p-6 rounded-full mb-4">
                                <TrendingUp className="w-12 h-12 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada post trending</h3>
                            <p className="text-gray-500 text-center max-w-sm">
                                Post akan muncul di sini berdasarkan jumlah likes dalam 7 hari terakhir
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
};

export default TrendingView;