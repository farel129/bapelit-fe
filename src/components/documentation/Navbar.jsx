import React from 'react';
import { TrendingUp, Plus, Home, Search, Heart, User } from 'lucide-react';

const Navbar = ({
    user,
    currentPage,
    setCurrentPage,
    setFeedFilters,
    setShowCreatePost,
    loadUserProfile,
}) => {
    return (
        <div className="flex justify-center">
            {/* Mobile Bottom Navigation */}
            <div className='fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200/80 backdrop-blur-xl md:hidden'>
                <div className="px-6 py-3">
                    <div className="flex items-center justify-around">
                        <button
                            onClick={() => {
                                setCurrentPage('feed');
                                setFeedFilters(prev => ({ ...prev, search: '', page: 1 }))
                            }}
                            className={`p-2 transition-all duration-200 ${currentPage === 'feed'
                                    ? 'text-black'
                                    : 'text-gray-400'
                                }`}
                        >
                            <Home className={`w-6 h-6 ${currentPage === 'feed' ? 'fill-current' : ''}`} />
                        </button>


                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="p-2 text-gray-400 transition-all duration-200"
                        >
                            <Plus className="w-6 h-6" />
                        </button>

                        <button
                            onClick={() => setCurrentPage('trending')}
                            className={`p-2 transition-all duration-200 ${currentPage === 'trending'
                                    ? 'text-red-500'
                                    : 'text-gray-400'
                                }`}
                        >
                            <TrendingUp className="w-6 h-6" />
                        </button>

                        <button
                            onClick={() => {
                                setCurrentPage('profile');
                                loadUserProfile(user.id);
                            }}
                            className="relative"
                        >
                            <div className={`w-7 h-7 rounded-full flex bg-black items-center justify-center text-white font-semibold text-sm ${currentPage === 'profile'
                                    ? 'ring-2 ring-black ring-offset-2'
                                    : ''
                                }`}>
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop bottom Navigation */}
            <div className='fixed bottom-5 rounded-2xl shadow-lg z-30 bg-white shadow-teal-400/15 backdrop-blur-md border border-slate-200 hidden md:block'>
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">

                        {/* Navigation Icons */}
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => {
                                    setCurrentPage('feed');
                                    setFeedFilters(prev => ({ ...prev, search: '', page: 1 }))
                                }}
                                className={`p-2 transition-all duration-200 rounded-lg ${currentPage === 'feed'
                                        ?'text-teal-400'
                                        :'text-black'
                                    }`}
                            >
                                <Home className={`w-6 h-6 ${currentPage === 'feed' ? 'fill-current' : ''}`} />
                            </button>

                            <button
                                onClick={() => setCurrentPage('trending')}
                                className={`p-2 transition-all duration-200 rounded-lg ${currentPage === 'trending'
                                        ?'text-red-400'
                                        :'text-black'
                                    }`}
                            >
                                <TrendingUp className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => setShowCreatePost(true)}
                                className="p-2 text-black hover:opacity-90 transition-all duration-200 rounded-lg"
                            >
                                <Plus className="w-6 h-6" />
                            </button>

                            <button
                                onClick={() => {
                                    setCurrentPage('profile');
                                    loadUserProfile(user.id);
                                }}
                                className="relative"
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-neutral-500 text-white font-semibold text-sm transition-all duration-200 ${currentPage === 'profile'
                                        ? 'ring-2 ring-black ring-offset-2'
                                        : 'hover:ring-2 hover:ring-teal-400 hover:ring-offset-1'
                                    }`}>
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;