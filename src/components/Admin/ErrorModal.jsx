import React from 'react'
import Modal from './Modal';

const ErrorModal = ({ isOpen, onClose, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} type="error">
      <div className="space-y-4">
        <p className="text-[#6b7280]">{message}</p>
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Tutup
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ErrorModal