// src/components/SearchView.js
import React from 'react';
import { Search, Camera } from 'lucide-react';
import PostCard from './PostCard';
import LoadingSpinner from '../Ui/LoadingSpinner';

const SearchView = ({
    feedFilters,
    searchResults,
    searchLoading,
    setFeedFilters,
    // Props needed by PostCard
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
}) => (
    <div className="space-y-4">
        <div className="bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                <Search className="w-6 h-6 mr-2 text-blue-500" />
                Hasil Pencarian
            </h2>
            <p className="text-gray-600">
                Menampilkan hasil untuk: "<span className="font-semibold">{feedFilters.search}</span>"
            </p>
        </div>
        {searchLoading && searchResults.length === 0 ? (
            <div className="text-center py-12">
                <LoadingSpinner text='mencari' />
            </div>
        ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Tidak ada hasil</h3>
                <p className="text-gray-500">Coba kata kunci yang berbeda</p>
            </div>
        ) : (
            <>
                <div>
                    {searchResults.map(post => (
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
                {!searchLoading && (
                    <div className="text-center mt-8">
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
    </div>
);

export default SearchView;