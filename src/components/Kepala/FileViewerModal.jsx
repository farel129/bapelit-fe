import { useState } from "react";
import LoadingSpinner from "../Ui/LoadingSpinner";

const FileViewerModal = ({ files, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!files || files.length === 0) return null;
  
  const currentFile = files[currentIndex];
  const isImage = currentFile.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  const isPDF = currentFile.filename?.match(/\.pdf$/i);
  
  // Debug: Log file info
  console.log('Current file:', currentFile);
  console.log('File URL:', currentFile.url);
  
  const nextFile = () => {
    setCurrentIndex((prev) => (prev + 1) % files.length);
    setError(null);
  };
  
  const prevFile = () => {
    setCurrentIndex((prev) => (prev - 1 + files.length) % files.length);
    setError(null);
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', e);
    setError('Gagal memuat gambar. URL: ' + currentFile.url);
    setLoading(false);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setLoading(false);
    setError(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentFile.filename}
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
              {Math.round(currentFile.size / 1024)} KB
            </span>
            {files.length > 1 && (
              <span className="text-sm text-gray-600">
                {currentIndex + 1} dari {files.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {files.length > 1 && (
              <>
                <button
                  onClick={prevFile}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  title="File sebelumnya"
                >
                  ‹
                </button>
                <button
                  onClick={nextFile}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                  title="File berikutnya"
                >
                  ›
                </button>
              </>
            )}
            <a
              href={currentFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="Buka di tab baru"
            >
              🔗
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
              title="Tutup"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Debug info */}
        <div className="px-4 py-2 bg-yellow-50 border-b text-xs text-gray-600">
          <strong>Debug URL:</strong> {currentFile.url}
        </div>
        
        {/* Content */}
        <div className="p-4 bg-gray-100 max-h-[calc(90vh-120px)] overflow-auto relative">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
              <p className="font-medium">Error:</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => window.open(currentFile.url, '_blank')}
                className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
              >
                Coba buka langsung
              </button>
            </div>
          )}
          
          {isImage ? (
            <div className="flex justify-center">
              <img
                src={currentFile.url}
                alt={currentFile.filename}
                className="max-w-full max-h-full object-contain rounded shadow-lg"
                onLoad={handleImageLoad}
                onLoadStart={() => setLoading(true)}
                onError={handleImageError}
                crossOrigin="anonymous"
              />
            </div>
          ) : isPDF ? (
            <div className="w-full h-[60vh]">
              <iframe
                src={currentFile.url}
                className="w-full h-full border rounded shadow-lg"
                title={currentFile.filename}
                onLoad={() => setLoading(false)}
                onError={() => setError('Gagal memuat PDF')}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-600 mb-4">
                File tidak dapat ditampilkan dalam preview
              </p>
              <a
                href={currentFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-flex items-center"
              >
                📥 Download File
              </a>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <LoadingSpinner />
            </div>
          )}
        </div>
        
        {/* Footer dengan thumbnail jika ada multiple files */}
        {files.length > 1 && (
          <div className="p-4 border-t bg-gray-50 max-h-32 overflow-auto">
            <div className="flex space-x-2">
              {files.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 p-2 rounded border text-xs ${
                    index === currentIndex
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-16 h-12 flex items-center justify-center">
                    {file.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="max-w-full max-h-full object-cover rounded"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="text-lg">
                        {file.filename?.match(/\.pdf$/i) ? '📄' : '📎'}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 truncate max-w-16" title={file.filename}>
                    {file.filename}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileViewerModal