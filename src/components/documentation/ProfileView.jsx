import React, { useState } from 'react';
import {
  Camera,
  Grid3X3,
  Heart,
  MessageCircle,
  Settings,
  Loader2,
  FileText,
  Video,
  Music,
  File,
  Plus,
  Loader,
} from 'lucide-react';
import LoadingSpinner from '../Ui/LoadingSpinner';

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
        background: 'bg-gray-100',
        label: 'Video'
      };
    }

    // Audio files  
    if (contentType?.includes('audio') || ['mp3', 'wav', 'flac', 'm4a', 'aac'].includes(fileExtension)) {
      return {
        icon: Music,
        background: 'bg-gray-100',
        label: 'Audio'
      };
    }

    // Text/Document files
    if (contentType?.includes('text') || ['txt', 'doc', 'docx', 'pdf', 'rtf'].includes(fileExtension)) {
      return {
        icon: FileText,
        background: 'bg-gray-100',
        label: 'Document'
      };
    }

    // Default fallback
    return {
      icon: File,
      background: 'bg-gray-100',
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
    <div className="max-w-4xl mx-auto mb-20 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Profile Header */}
      <div className="mb-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-8 space-y-6 md:space-y-0">
          {/* Profile Picture */}
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg border-2 border-gray-200"
                   style={{
                     background: 'linear-gradient(135deg, #f6339a, #e51b8c)',
                     color: '#ffffff'
                   }}>
                {isOwnProfile ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {/* Story ring effect — simplified for consistency */}
              <div className="absolute inset-0 rounded-full border-2 border-gray-200 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
              <h1 className="text-2xl font-semibold text-[#000000] mb-2 md:mb-0">
                {isOwnProfile ? user.name : 'Profil Pengguna'}
              </h1>
              {isOwnProfile && (
                <div className="flex justify-center md:justify-start space-x-2 mt-3 md:mt-0">
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="px-4 py-2 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Post
                  </button>
                  <button className="p-2 text-[#6b7280] hover:bg-gray-50 rounded-xl transition-colors border border-[#e5e7eb]">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex justify-center md:justify-start space-x-8 mb-4">
              <div className="text-center">
                <span className="block font-bold text-[#000000] text-lg">
                  {userStats.posts_count}
                </span>
                <span className="text-[#6b7280] text-sm">postingan</span>
              </div>
              <div className="text-center cursor-pointer hover:text-[#000000] transition-colors">
                <span className="block font-bold text-[#000000] text-lg">
                  {userStats.total_likes_received}
                </span>
                <span className="text-[#6b7280] text-sm">like</span>
              </div>
            </div>

            {/* Bio / Email */}
            <div className="max-w-md">
              <div className="font-semibold text-[#000000] text-sm mb-1">
                {isOwnProfile ? user.name : 'Pengguna'}
              </div>
              {isOwnProfile && (
                <div className="text-[#6b7280] text-sm">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>            

      {/* Posts Section */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-gray-200">
          <button className="flex items-center space-x-1 py-4 px-6 text-[#000000] text-sm font-semibold tracking-wider uppercase border-b-2 border-[#f6339a]">
            <Grid3X3 className="w-4 h-4" />
            <span>Postingan</span>
          </button>
        </div>

        {/* Posts Grid */}
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <LoadingSpinner />
            </div>
          ) : userPosts.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {userPosts.map(post => {
                  const contentDisplay = getContentTypeDisplay(post);
                  const hasValidImage = post.thumbnail && !imageErrors.has(post.id);
                  
                  return (
                    <div
                      key={post.id}
                      className="relative aspect-square bg-gray-50 cursor-pointer group overflow-hidden rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
                      onClick={() => !loadingPostId && handlePostClick(post.id)}
                    >
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
                        <div className={`w-full h-full flex flex-col items-center justify-center ${contentDisplay.background} text-[#000000] transition-transform duration-300 group-hover:scale-105 ${
                          loadingPostId === post.id ? 'opacity-50' : ''
                        }`}>
                          <contentDisplay.icon className="w-8 h-8 md:w-10 md:h-10 mb-1 md:mb-2 text-[#6b7280]" />
                          <span className="text-xs md:text-sm font-medium text-[#000000] opacity-90">
                            {contentDisplay.label}
                          </span>
                          {/* File extension indicator */}
                          {post.filename && (
                            <span className="text-xs text-[#6b7280] mt-1">
                              {post.filename.split('.').pop()?.toUpperCase()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Camera className="w-8 h-8 text-[#6b7280]" />
                        </div>
                      )}
                      
                      {/* Loading Overlay for specific post */}
                      {loadingPostId === post.id && (
                        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10 backdrop-blur-sm">
                          <LoadingSpinner />
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 ${
                        loadingPostId === post.id ? 'pointer-events-none' : ''
                      }`}>
                        <div className="flex items-center space-x-4 text-white">
                          <div className="flex items-center bg-white bg-opacity-80 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Heart className="w-4 h-4 mr-1 fill-current text-red-500" />
                            <span className="text-xs font-semibold text-[#000000]">{post.likes_count || post.recent_likes || 0}</span>
                          </div>
                          <div className="flex items-center bg-white bg-opacity-80 backdrop-blur-sm px-2 py-1 rounded-full">
                            <MessageCircle className="w-4 h-4 mr-1 text-[#6b7280]" />
                            <span className="text-xs font-semibold text-[#000000]">{post.comments_count || 0}</span>
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
                    className={`px-6 py-3 bg-white text-[#000000] border border-[#e5e7eb] rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md ${
                      loadingMore ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                    }`}
                  >
                    {loadingMore ? (
                      <>
                        <LoadingSpinner />
                      </>
                    ) : (
                      <>
                        <Grid3X3 className="w-5 h-5 text-[#6b7280]" />
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-[#6b7280]" />
              </div>
              <h3 className="text-xl font-semibold text-[#000000] mb-2">
                {isOwnProfile ? 'Belum Ada Postingan' : 'Belum Ada Postingan'}
              </h3>
              <p className="text-[#6b7280] text-center max-w-sm mb-6">
                {isOwnProfile 
                  ? 'Bagikan foto pertama Anda untuk mulai berbagi di profil.' 
                  : 'Pengguna ini belum membagikan postingan apa pun.'
                }
              </p>
              {isOwnProfile && (
                <button
                  onClick={handleCreatePost}
                  className={`px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 ${
                    isCreatingPost ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isCreatingPost}
                >
                  {isCreatingPost ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Memuat...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Tambah Postingan Pertama
                    </>
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