// src/components/DokumentasiDetail.jsx
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { api } from '../../utils/api';

const DetailDokumentasi = ({ postId, onBack, onPostDeleted }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [deletingComment, setDeletingComment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/dokumentasi/${postId}`);
      setPost(response.data.data);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await api.post(`/dokumentasi/${postId}/like`);
      fetchPost(); // Refresh data
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.post(`/dokumentasi/${postId}/comment`, { comment: newComment.trim() });
      setNewComment('');
      fetchPost(); // Refresh data
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setDeletingComment(commentId);
      await api.delete(`/dokumentasi/comment/${commentId}`);
      fetchPost(); // Refresh data
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeletingComment(null);
      setShowDeleteModal(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await api.delete(`/dokumentasi/${postId}`);
      onPostDeleted?.(postId);
      onBack();
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: id 
    });
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post tidak ditemukan</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Kembali
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setPostToDelete('post');
              setShowDeleteModal(true);
            }}
            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
          >
            Hapus
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Post Header */}
        <div className="p-6 flex items-center justify-between border-b">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {post.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{post.user.name}</h2>
              <p className="text-sm text-gray-500">{formatDate(post.created_at)}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
            {post.kategori}
          </span>
        </div>

        {/* Post Content */}
        <div className="p-6">
          {post.caption && (
            <p className="text-gray-800 mb-4 text-lg whitespace-pre-wrap">{post.caption}</p>
          )}
          
          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.split(',').map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  #{tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Files Gallery */}
          {post.files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Files ({post.files.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {post.files.map((file, index) => (
                  <div key={file.id} className="border rounded-lg overflow-hidden">
                    {file.mime_type?.startsWith('image/') ? (
                      <img
                        src={file.file_url}
                        alt={file.original_name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <p className="text-sm text-gray-600 px-2 truncate">{file.original_name}</p>
                        </div>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.original_name}</p>
                      <p className="text-xs text-gray-500">{file.mime_type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Likes */}
          <div className="mb-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 ${post.likes.is_liked ? 'text-red-500' : 'text-gray-500'} hover:text-red-500 transition-colors`}
              >
                <svg className="w-6 h-6" fill={post.likes.is_liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
                <span className="font-medium">{post.likes.count} likes</span>
              </button>
            </div>
            
            {post.likes.users.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">
                  Disukai oleh {post.likes.users.map(u => u.name).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Komentar ({post.comments.length})
            </h3>
            
            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="mb-6">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Kirim
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {comment.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{comment.user.name}</h4>
                      <button
                        onClick={() => {
                          setPostToDelete(comment.id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Hapus
                      </button>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.comment}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(comment.created_at)}</p>
                  </div>
                </div>
              ))}
              
              {post.comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">Belum ada komentar</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">Konfirmasi Hapus</h3>
            <p className="text-gray-600 mb-6">
              {postToDelete === 'post' 
                ? 'Apakah Anda yakin ingin menghapus post ini?'
                : 'Apakah Anda yakin ingin menghapus komentar ini?'
              }
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (postToDelete === 'post') {
                    handleDeletePost();
                  } else {
                    handleDeleteComment(postToDelete);
                  }
                }}
                disabled={deletingComment === postToDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deletingComment === postToDelete ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailDokumentasi;