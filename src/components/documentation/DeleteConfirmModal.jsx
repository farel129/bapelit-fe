import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const DeleteConfirmModal = ({
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDeletePost
}) => {
    if (!showDeleteConfirm) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="p-6 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold mb-2">Hapus Post?</h2>
                    <p className="text-gray-600 mb-6">
                        Post ini akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            onClick={() => handleDeletePost(showDeleteConfirm)}
                            className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;