// src/components/DokumentasiFeed.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { api } from '../../utils/api';

const FeedDokumentasi = ({ onPostClick }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    kategori: '',
    search: ''
  });
  const [hasMore, setHasMore] = useState(true);

  const kategoriOptions = [
    { value: '', label: 'Semua Kategori' },
    { value: 'umum', label: 'Umum' },
    { value: 'pekerjaan', label: 'Pekerjaan' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'meeting', label: 'Meeting' }
  ];

  const fetchPosts = async (params = filters) => {
    try {
      setLoading(true);
      const response = await api.get('/dokumentasi/feed', { params });
      const newPosts = response.data.data;
      
      if (params.page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(response.data.pagination.has_more);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      await api.post(`/dokumentasi/${postId}/like`);
      
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: !isLiked,
            likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const loadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: id 
    });
  };

  if (loading && filters.page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari caption atau tags..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cari
            </button>
          </div>
          
          <select
            value={filters.kategori}
            onChange={(e) => setFilters(prev => ({ ...prev, kategori: e.target.value, page: 1 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {kategoriOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </form>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {post.user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
                  <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {post.kategori}
              </span>
            </div>

            {/* Post Content */}
            <div className="p-4">
              {post.caption && (
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.caption}</p>
              )}
              
              {post.tags && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.split(',').map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Files Preview */}
              {post.files.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {post.files.slice(0, 4).map((file, index) => (
                      <div key={file.id} className="relative">
                        {file.mime_type?.startsWith('image/') ? (
                          <img
                            src={file.file_url}
                            alt={file.original_name}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer"
                            onClick={() => onPostClick(post.id)}
                          />
                        ) : (
                          <div 
                            className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer"
                            onClick={() => onPostClick(post.id)}
                          >
                            <div className="text-center">
                              <svg className="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <p className="text-xs text-gray-500 truncate px-2">{file.original_name}</p>
                            </div>
                          </div>
                        )}
                        {index === 3 && post.files.length > 4 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">+{post.files.length - 4}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id, post.is_liked)}
                    className={`flex items-center space-x-2 ${post.is_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
                  >
                    <svg className="w-5 h-5" fill={post.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                    </svg>
                    <span>{post.likes_count}</span>
                  </button>
                  
                  <button
                    onClick={() => onPostClick(post.id)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    <span>{post.comments_count}</span>
                  </button>
                </div>
                
                <button
                  onClick={() => onPostClick(post.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat Detail
                </button>
              </div>

              {/* Latest Comments */}
              {post.latest_comments.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  {post.latest_comments.map(comment => (
                    <div key={comment.id} className="text-sm mb-2">
                      <span className="font-medium text-gray-900">{comment.user.nama}:</span>
                      <span className="text-gray-700 ml-2">{comment.comment}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
          </button>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <div className="text-center text-gray-500 text-sm mt-6">
          Tidak ada lagi post untuk dimuat
        </div>
      )}
    </div>
  );
};

export default FeedDokumentasi;