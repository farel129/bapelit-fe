// src/pages/FeedPage.jsx
import React, { useState } from 'react';
import FeedDokumentasi from './FeedDokumentasi';
import DetailDokumentasi from './DetailDokumentasi';
import PostDokumentasi from './PostDokumentasi';


const FeedPage = () => {
  const [view, setView] = useState('feed'); // 'feed', 'detail', 'create'
  const [selectedPostId, setSelectedPostId] = useState(null);

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
    setView('detail');
  };

  const handleBack = () => {
    setView('feed');
    setSelectedPostId(null);
  };

  const handlePostCreated = () => {
    setView('feed');
  };

  const handlePostDeleted = () => {
    setView('feed');
    setSelectedPostId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'feed' && (
        <div>
          {/* Header with Create Button */}
          <div className="bg-white shadow-sm">
            <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Dokumentasi Feed</h1>
              <button
                onClick={() => setView('create')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Buat Post</span>
              </button>
            </div>
          </div>

          <div className="py-6">
            <FeedDokumentasi onPostClick={handlePostClick} />
          </div>
        </div>
      )}

      {view === 'detail' && selectedPostId && (
        <div className="py-6">
          <DetailDokumentasi 
            postId={selectedPostId} 
            onBack={handleBack}
            onPostDeleted={handlePostDeleted}
          />
        </div>
      )}

      {view === 'create' && (
        <div className="py-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Buat Dokumentasi</h1>
              <button
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <PostDokumentasi onPostCreated={handlePostCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;