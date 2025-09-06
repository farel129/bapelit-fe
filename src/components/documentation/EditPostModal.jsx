import React from 'react';
import { X } from 'lucide-react';

const EditPostModal = ({
    editingPost,
    setEditingPost,
    categories,
    handleEditPost
}) => {
    if (!editingPost) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-lg">
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Edit Post</h2>
                    <button
                        onClick={() => setEditingPost(null)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <textarea
                        placeholder="Caption"
                        value={editingPost.caption}
                        onChange={(e) => setEditingPost(prev => ({ ...prev, caption: e.target.value }))}
                        className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={editingPost.kategori}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, kategori: e.target.value }))}
                            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat.name} value={cat.name}>
                                    {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Tags (opsional)"
                            value={editingPost.tags}
                            onChange={(e) => setEditingPost(prev => ({ ...prev, tags: e.target.value }))}
                            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setEditingPost(null)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleEditPost}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditPostModal;