// components/LoadingError.jsx
import React from 'react';
import { AlertCircle, FileText, LoaderIcon } from 'lucide-react';

export const LoadingState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-y-2">
    <LoaderIcon className="animate-spin h-8 w-8 text-[#262628]" />
    <p className="text-[#262628]">Memuat</p>
  </div>
);

export const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Error</h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  </div>
);

export const EmptyState = ({ searchTerm, statusFilter }) => (
  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada surat masuk</h3>
    <p className="text-gray-500">
      {searchTerm || statusFilter !== 'all'
        ? 'Tidak ditemukan surat masuk yang sesuai dengan filter'
        : 'Belum ada surat masuk yang tersedia'
      }
    </p>
  </div>
);