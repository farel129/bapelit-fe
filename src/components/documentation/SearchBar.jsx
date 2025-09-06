import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({
    feedFilters,
    categories,
    handleSearch,
    setFeedFilters
}) => (
    <div className="mb-8 px-4 max-w-2xl mx-auto">
        <div className="space-y-4">
            {/* Search Input */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-gray-600" />
                <input
                    type="text"
                    placeholder="Cari dokumentasi..."
                    value={feedFilters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 focus:shadow-sm transition-all duration-200"
                />
            </div>

            {/* Category Filter */}
            <div className="relative">
                <select
                    value={feedFilters.kategori}
                    onChange={(e) => setFeedFilters(prev => ({ ...prev, kategori: e.target.value, page: 1 }))}
                    className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 focus:shadow-sm transition-all duration-200 appearance-none cursor-pointer"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map(cat => (
                        <option key={cat.name} value={cat.name}>
                            {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} ({cat.count})
                        </option>
                    ))}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
);

export default SearchBar;