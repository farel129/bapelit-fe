import React from 'react'
import Modal from './Modal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Konfirmasi', cancelText = 'Batal', type = 'warning' }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type={type}>
      <div className="space-y-4">
        <p className="text-[#6b7280]">{message}</p>
        <div className="flex space-x-3 justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              type === 'error' ? 'hover:bg-red-800' : 'hover:bg-gray-900'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal