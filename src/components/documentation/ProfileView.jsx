import React, { useState } from 'react';
import { Camera, Grid3X3, Heart, MessageCircle, Settings, Loader2, FileText, Video, Music, File } from 'lucide-react';

const ProfileView = ({
    user,
    profileUserId,
    userStats,
    userPosts,
    loading,
    setShowCreatePost,
    openPostDetail,
    onLoadMorePosts
}) => {
    const [loadingPostId, setLoadingPostId] = useState(null);
    const [isCreatingPost, setIsCreatingPost] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [imageErrors, setImageErrors] = useState(new Set());
    
    const isOwnProfile = profileUserId === user.id;

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

    const handleCreatePost = async () => {
        setIsCreatingPost(true);
        try {
            await setShowCreatePost(true);
        } catch (error) {
            console.error('Error opening create post:', error);
        } finally {
            setIsCreatingPost(false);
        }
    };

    const handleLoadMore = async () => {
        if (loadingMore || !onLoadMorePosts) return;
        
        setLoadingMore(true);
        try {
            await onLoadMorePosts();
        } catch (error) {
            console.error('Error loading more posts:', error);
        } finally {
            setLoadingMore(false);
        }
    };
    
    return (
        <div className="max-w-4xl mx-auto mb-30">
            {/* Profile Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
                    {/* Profile Picture */}
                    <div className="flex justify-center md:justify-start">
                        <div className="relative">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}>
                                {isOwnProfile ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            {/* Story ring effect */}
                            <div className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-0.5 opacity-0 hover:opacity-100 transition-opacity duration-300">
                                <div className="rounded-full bg-white w-full h-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                            <h1 className="text-2xl font-light text-gray-900 mb-2 md:mb-0">
                                {isOwnProfile ? user.name : 'User Profile'}
                            </h1>
                            {isOwnProfile && (
                                <div className="flex justify-center md:justify-start space-x-2">
                                    <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-medium rounded-md transition-colors">
                                        Edit Profile
                                    </button>
                                    <button className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-md transition-colors">
                                        <Settings className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center md:justify-start space-x-8 mb-4">
                            <div className="text-center">
                                <span className="block font-semibold text-lg text-gray-900">
                                    {userStats.posts_count}
                                </span>
                                <span className="text-gray-500 text-sm">posts</span>
                            </div>
                            <div className="text-center cursor-pointer hover:text-gray-900 transition-colors">
                                <span className="block font-semibold text-lg text-gray-900">
                                    {userStats.total_likes_received}
                                </span>
                                <span className="text-gray-500 text-sm">likes</span>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="max-w-md">
                            <div className="font-semibold text-gray-900 text-sm mb-1">
                                {isOwnProfile ? user.name : 'User'}
                            </div>
                            {isOwnProfile && (
                                <div className="text-gray-600 text-sm">
                                    {user.email}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>            

            {/* Posts Section */}
            <div className="border-t border-gray-200">
                {/* Tab Navigation */}
                <div className="flex justify-center">
                    <button className="flex items-center space-x-1 py-3 px-4 border-t-2 border-gray-900 text-gray-900 text-xs font-medium tracking-widest uppercase">
                        <Grid3X3 className="w-3 h-3" />
                        <span>Posts</span>
                    </button>
                </div>

                {/* Posts Grid */}
                <div className="mt-4">
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 animate-spin text-gray-600 mb-2" />
                                <span className="text-sm text-gray-600">Memuat posts...</span>
                            </div>
                        </div>
                    ) : userPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                {userPosts.map(post => {
                                    const contentDisplay = getContentTypeDisplay(post);
                                    const hasValidImage = post.thumbnail && !imageErrors.has(post.id);
                                    
                                    return (
                                        <div
                                            key={post.id}
                                            className="relative aspect-square bg-gray-50 cursor-pointer group overflow-hidden"
                                            onClick={() => !loadingPostId && handlePostClick(post.id)}
                                        >
                                            {hasValidImage ? (
                                                <img 
                                                    src={post.thumbnail} 
                                                    alt="Post" 
                                                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
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
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <Camera className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                            
                                            {/* Loading Overlay for specific post */}
                                            {loadingPostId === post.id && (
                                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                                                    <div className="flex flex-col items-center">
                                                        <Loader2 className="w-6 h-6 animate-spin text-gray-600 mb-1" />
                                                        <span className="text-xs text-gray-600">Memuat...</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Hover Overlay */}
                                            <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 ${
                                                loadingPostId === post.id ? 'pointer-events-none' : ''
                                            }`}>
                                                <div className="flex items-center space-x-4 text-white">
                                                    <div className="flex items-center">
                                                        <Heart className="w-5 h-5 mr-1 fill-current" />
                                                        <span className="font-semibold">{post.likes_count || post.recent_likes || 0}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <MessageCircle className="w-5 h-5 mr-1" />
                                                        <span className="font-semibold">{post.comments_count || 0}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Load More Button */}
                            {onLoadMorePosts && (
                                <div className="flex justify-center mt-8">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        className={`px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                                            loadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                                        }`}
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Memuat...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Grid3X3 className="w-5 h-5" />
                                                <span>Muat Lebih Banyak</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 border-2 border-gray-900 rounded-full flex items-center justify-center mb-4">
                                <Camera className="w-8 h-8 text-gray-900" />
                            </div>
                            <h3 className="text-2xl font-light text-gray-900 mb-2">
                                {isOwnProfile ? 'Share Photos' : 'No Posts Yet'}
                            </h3>
                            <p className="text-gray-500 text-center max-w-sm mb-6">
                                {isOwnProfile 
                                    ? 'When you share photos, they will appear on your profile.' 
                                    : "When they share photos, you'll see them here."
                                }
                            </p>
                            {isOwnProfile && (
                                <button
                                    onClick={handleCreatePost}
                                    className={`text-blue-500 font-semibold text-sm hover:text-blue-600 transition-colors flex items-center ${
                                        isCreatingPost ? 'opacity-50 pointer-events-none' : ''
                                    }`}
                                    disabled={isCreatingPost}
                                >
                                    {isCreatingPost ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        'Share your first photo'
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileView;