// src/App.js
import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { Camera } from 'lucide-react';
import PostCard from '../documentation/PostCard';
import TrendingView from '../documentation/TrendingView';
import ProfileView from '../documentation/ProfileView';
import SearchView from '../documentation/SearchView';
import CreatePostModal from '../documentation/CreatePostModal';
import EditPostModal from '../documentation/EditPostModal';
import DeleteConfirmModal from '../documentation/DeleteConfirmModal';
import PostDetailModal from '../documentation/PostDetailModal';
import Navbar from '../documentation/Navbar';
import SearchBar from '../documentation/SearchBar';

const DocumentationPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [currentPage, setCurrentPage] = useState('feed');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);


    // State untuk posting
    const [showCreatePost, setShowCreatePost] = useState(false);

    // State untuk feed
    const [feedFilters, setFeedFilters] = useState({
        kategori: '',
        search: '',
        page: 1
    });

    // State untuk detail post
    const [selectedPost, setSelectedPost] = useState(null);
    const [newComment, setNewComment] = useState('');

    // State untuk trending
    const [trendingPosts, setTrendingPosts] = useState([]);

    // State untuk profile
    const [userStats, setUserStats] = useState({ posts_count: 0, total_likes_received: 0 });
    const [userPosts, setUserPosts] = useState([]);
    const [profileUserId, setProfileUserId] = useState(null);
    const [profilePage, setProfilePage] = useState(1);
    const [profileHasMore, setProfileHasMore] = useState(false);

    // State untuk edit/delete
    const [showPostMenu, setShowPostMenu] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // State untuk search
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadFeed();
            loadCategories();
        }
    }, [user]);

    useEffect(() => {
        if (user && currentPage === 'feed') {
            loadFeed();
        } else if (user && currentPage === 'trending') {
            loadTrending();
        } else if (user && currentPage === 'search' && feedFilters.search) {
            performSearch();
        }
    }, [currentPage, feedFilters, user]);

    const loadFeed = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (feedFilters.kategori) params.append('kategori', feedFilters.kategori);
            if (feedFilters.search) params.append('search', feedFilters.search);
            params.append('page', feedFilters.page);
            params.append('limit', '10');
            const response = await api.get(`/dokumentasi/?${params}`);
            if (feedFilters.page === 1) {
                setPosts(response.data.data);
            } else {
                setPosts(prev => [...prev, ...response.data.data]);
            }
        } catch (error) {
            console.error('Error loading feed:', error);
        }
        setLoading(false);
    };

    const loadCategories = async () => {
        try {
            const response = await api.get('/dokumentasi/categories');
            setCategories(response.data.data);
        } catch (error) {
            console.error('Error loading categories:', error);
            setCategories([
                { name: 'umum', count: 0 },
                { name: 'pekerjaan', count: 0 },
                { name: 'tutorial', count: 0 },
                { name: 'meeting', count: 0 },
                { name: 'proyek', count: 0 }
            ]);
        }
    };

    const loadTrending = async () => {
        setLoading(true);
        try {
            const response = await api.get('/dokumentasi/trending?limit=20');
            setTrendingPosts(response.data.data);
        } catch (error) {
            console.error('Error loading trending:', error);
        }
        setLoading(false);
    };

    const loadUserProfile = async (userId = null, page = 1, append = false) => {
        if (page === 1) setLoading(true);
        const targetUserId = userId || user.id;
        setProfileUserId(targetUserId);

        try {
            const [statsResponse, postsResponse] = await Promise.all([
                api.get(`/dokumentasi/${targetUserId}/stats`),
                api.get(`/dokumentasi/${targetUserId}/user?page=${page}&limit=12`)
            ]);

            setUserStats(statsResponse.data.data);

            // Handle posts dengan pagination
            const { data: newPosts, pagination } = postsResponse.data;

            if (append && page > 1) {
                // Append posts untuk load more
                setUserPosts(prevPosts => [...prevPosts, ...newPosts]);
            } else {
                // Replace posts untuk initial load
                setUserPosts(newPosts);
            }

            // Update pagination state
            setProfilePage(pagination.page);
            setProfileHasMore(pagination.has_more);

        } catch (error) {
            console.error('Error loading user profile:', error);
        }

        setLoading(false);
    };

    const loadMoreProfilePosts = async () => {
        if (!profileHasMore) return;

        const nextPage = profilePage + 1;
        await loadUserProfile(profileUserId, nextPage, true);
    };

    const handleProfileNavigation = async (userId = null) => {
        setProfilePage(1);
        setProfileHasMore(false);
        setUserPosts([]);
        await loadUserProfile(userId, 1, false);
        setCurrentPage('profile');
    };



    // Ganti function performSearch di App.js (sekitar baris 97)
const performSearch = async () => {
    if (!feedFilters.search.trim()) return;
    setSearchLoading(true);
    try {
        const params = new URLSearchParams();
        params.append('search', feedFilters.search); // Pakai 'search' bukan 'q'
        if (feedFilters.kategori) params.append('kategori', feedFilters.kategori);
        params.append('page', feedFilters.page);
        params.append('limit', '10');
        
        // Gunakan endpoint feed yang sudah include files
        const response = await api.get(`/dokumentasi/?${params}`);
        
        console.log('Fixed search with files:', response.data.data[0]?.files);
        
        if (feedFilters.page === 1) {
            setSearchResults(response.data.data);
        } else {
            setSearchResults(prev => [...prev, ...response.data.data]);
        }
    } catch (error) {
        console.error('Error searching:', error);
    }
    setSearchLoading(false);
};

    // Updated handleCreatePost - sekarang menerima data sebagai parameter
    const handleCreatePost = async (postData) => {
        // Validation sudah dilakukan di modal
        try {
            const formData = new FormData();
            formData.append('caption', postData.caption);
            formData.append('kategori', postData.kategori);
            formData.append('tags', postData.tags);

            // Handle files
            if (postData.files && postData.files.length > 0) {
                postData.files.forEach(file => {
                    formData.append('files', file);
                });
            }

            await api.post('/dokumentasi', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Reload appropriate page
            if (currentPage === 'feed') {
                setFeedFilters(prev => ({ ...prev, page: 1 }));
                loadFeed();
            } else if (currentPage === 'profile' && profileUserId === user.id) {
                loadUserProfile();
            }
        } catch (error) {
            console.error('Error creating post:', error);
            // Re-throw error agar bisa di-handle oleh modal
            throw new Error('Gagal membuat post. Silakan coba lagi.');
        }
    };

    const handleEditPost = async () => {
        if (!editingPost) return;
        try {
            await api.put(`/dokumentasi/${editingPost.id}`, {
                caption: editingPost.caption,
                kategori: editingPost.kategori,
                tags: editingPost.tags
            });
            // Update posts in current view
            const updatePosts = (posts) => posts.map(post =>
                post.id === editingPost.id
                    ? { ...post, ...editingPost, updated_at: new Date().toISOString() }
                    : post
            );
            setPosts(updatePosts);
            setUserPosts(updatePosts);
            setTrendingPosts(updatePosts);
            setSearchResults(updatePosts);
            if (selectedPost && selectedPost.id === editingPost.id) {
                setSelectedPost({ ...selectedPost, ...editingPost });
            }
            setEditingPost(null);
            setShowPostMenu(null);
            alert('Post berhasil diupdate!');
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Gagal mengupdate post');
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await api.delete(`/dokumentasi/${postId}`);
            // Remove post from all views
            const filterPosts = (posts) => posts.filter(post => post.id !== postId);
            setPosts(filterPosts);
            setUserPosts(filterPosts);
            setTrendingPosts(filterPosts);
            setSearchResults(filterPosts);
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(null);
            }
            setShowDeleteConfirm(null);
            setShowPostMenu(null);
            alert('Post berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Gagal menghapus post');
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await api.post(`/dokumentasi/${postId}/like`);
            const action = response.data.action;
            const updatePosts = (posts) => posts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        likes_count: action === 'liked' ? post.likes_count + 1 : post.likes_count - 1,
                        is_liked: action === 'liked'
                    }
                    : post
            );
            setPosts(updatePosts);
            setUserPosts(updatePosts);
            setTrendingPosts(updatePosts);
            setSearchResults(updatePosts);
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(prev => ({
                    ...prev,
                    likes: {
                        ...prev.likes,
                        count: action === 'liked' ? prev.likes.count + 1 : prev.likes.count - 1,
                        is_liked: action === 'liked'
                    }
                }));
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleComment = async (postId, commentText) => {
        if (!commentText.trim()) return;
        try {
            const response = await api.post(`/dokumentasi/${postId}/comment`, {
                comment: commentText
            });
            const updatePosts = (posts) => posts.map(post =>
                post.id === postId
                    ? {
                        ...post,
                        comments_count: post.comments_count + 1,
                        latest_comments: [response.data.data, ...(post.latest_comments || [])].slice(0, 3)
                    }
                    : post
            );
            setPosts(updatePosts);
            setUserPosts(updatePosts);
            setSearchResults(updatePosts);
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(prev => ({
                    ...prev,
                    comments: [response.data.data, ...prev.comments]
                }));
            }
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/dokumentasi/${commentId}/comment`);
            if (selectedPost) {
                setSelectedPost(prev => ({
                    ...prev,
                    comments: prev.comments.filter(comment => comment.id !== commentId)
                }));
            }
            alert('Komentar berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Gagal menghapus komentar');
        }
    };

    const openPostDetail = async (postId) => {
        try {
            const response = await api.get(`/dokumentasi/${postId}`);
            setSelectedPost(response.data.data);
        } catch (error) {
            console.error('Error loading post detail:', error);
        }
    };

    const handleSearch = (searchTerm) => {
        setFeedFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
        if (searchTerm.trim()) {
            setCurrentPage('search');
        } else {
            setCurrentPage('feed');
        }
    };

    // Show loading or login prompt
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat aplikasi...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Dokumentasi
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Silakan login untuk mengakses sistem dokumentasi
                    </p>
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Navbar
                user={user}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setFeedFilters={setFeedFilters}
                setShowCreatePost={setShowCreatePost}
                loadUserProfile={handleProfileNavigation}
            />

            {/* Main Content */}
            <main className="">
                {(currentPage === 'feed' || currentPage === 'search') && (
                    <SearchBar
                        feedFilters={feedFilters}
                        categories={categories}
                        handleSearch={handleSearch}
                        setFeedFilters={setFeedFilters}
                    />
                )}
                {currentPage === 'feed' && (
                    <>
                        {loading && posts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Memuat feed...</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Belum ada dokumentasi</h3>
                                <p className="text-gray-500 mb-4">Mulai dokumentasikan aktivitas kamu!</p>
                                <button
                                    onClick={() => setShowCreatePost(true)}
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                                >
                                    Buat Post Pertama
                                </button>
                            </div>
                        ) : (
                            <>
                                <div>
                                    {posts.map(post => (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            user={user}
                                            handleLike={handleLike}
                                            openPostDetail={openPostDetail}
                                            handleComment={handleComment}
                                            newComment={newComment}
                                            setNewComment={setNewComment}
                                            setShowPostMenu={setShowPostMenu}
                                            showPostMenu={showPostMenu}
                                            setEditingPost={setEditingPost}
                                            setShowDeleteConfirm={setShowDeleteConfirm}
                                            setCurrentPage={setCurrentPage}
                                            loadUserProfile={loadUserProfile}
                                        />
                                    ))}
                                </div>
                                {!loading && (
                                    <div className="text-center mt-8 mb-30">
                                        <button
                                            onClick={() => setFeedFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                            className="bg-white border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
                                        >
                                            Muat Lebih Banyak
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
                {currentPage === 'trending' && (
                    <TrendingView
                        trendingPosts={trendingPosts}
                        loading={loading}
                        openPostDetail={openPostDetail}
                        setCurrentPage={setCurrentPage}
                        loadUserProfile={loadUserProfile}
                    />
                )}
                {currentPage === 'profile' && (
                    <ProfileView
                        user={user}
                        profileUserId={profileUserId}
                        userStats={userStats}
                        userPosts={userPosts}
                        loading={loading}
                        setShowCreatePost={setShowCreatePost}
                        openPostDetail={openPostDetail}
                        onLoadMorePosts={profileHasMore ? loadMoreProfilePosts : null}
                    />
                )}
                {currentPage === 'search' && (
                    <SearchView
                        feedFilters={feedFilters}
                        searchResults={searchResults}
                        searchLoading={searchLoading}
                        setFeedFilters={setFeedFilters}
                        // Props needed by PostCard
                        user={user}
                        handleLike={handleLike}
                        openPostDetail={openPostDetail}
                        handleComment={handleComment}
                        newComment={newComment}
                        setNewComment={setNewComment}
                        setShowPostMenu={setShowPostMenu}
                        showPostMenu={showPostMenu}
                        setEditingPost={setEditingPost}
                        setShowDeleteConfirm={setShowDeleteConfirm}
                        setCurrentPage={setCurrentPage}
                        loadUserProfile={loadUserProfile}
                    />
                )}
            </main>

            {/* Modals */}
            <CreatePostModal
                showCreatePost={showCreatePost}
                setShowCreatePost={setShowCreatePost}
                categories={categories}
                handleCreatePost={handleCreatePost}
            />
            <EditPostModal
                editingPost={editingPost}
                setEditingPost={setEditingPost}
                categories={categories}
                handleEditPost={handleEditPost}
            />
            <DeleteConfirmModal
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                handleDeletePost={handleDeletePost}
            />
            <PostDetailModal
                selectedPost={selectedPost}
                setSelectedPost={setSelectedPost}
                user={user}
                handleLike={handleLike}
                handleComment={handleComment}
                handleDeleteComment={handleDeleteComment}
                newComment={newComment}
                setNewComment={setNewComment}
                setEditingPost={setEditingPost}
                setShowDeleteConfirm={setShowDeleteConfirm}
            />

            {/* Loading Overlay */}
            {loading && (posts.length > 0 || currentPage === 'trending' || currentPage === 'profile') && (
                <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
                    Memuat...
                </div>
            )}

        </div>
    );
};

export default DocumentationPage;