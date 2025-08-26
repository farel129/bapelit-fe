import { Download, Eye, FileText, X } from "lucide-react";
import { useState } from "react";

const FeedbackFileViewer = ({ file }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = file.filename?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  const isPDF = file.filename?.match(/\.pdf$/i);

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* File icon/preview */}
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {isImage && !imageError ? (
            <img
              src={file.url}
              alt={file.filename}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowPreview(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => setShowPreview(true)}
            >
              <div className="text-center">
                <FileText className={`w-12 h-12 mx-auto mb-2 ${
                  isPDF ? 'text-red-500' : 'text-gray-400'
                }`} />
                <p className="text-xs text-gray-600">
                  {isPDF ? 'PDF' : file.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                </p>
              </div>
            </div>
          )}
          
          {/* Overlay button */}
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
              }}
              className="bg-black bg-opacity-50 text-white p-1.5 rounded hover:bg-opacity-70 transition-colors"
              title="Lihat"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* File info */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 truncate pr-2">
              {file.filename}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {Math.round(file.size / 1024)} KB
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex-1 justify-center"
            >
              <Eye className="w-3 h-3" />
              Lihat
            </button>
            <a
              href={file.url}
              download={file.filename}
              className="flex items-center gap-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors flex-1 justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
              <div className="text-white">
                <h3 className="font-semibold truncate max-w-96">{file.filename}</h3>
                <p className="text-sm text-gray-300">{Math.round(file.size / 1024)} KB</p>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href={file.url}
                  download={file.filename}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </a>
                
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              {isImage && !imageError ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="max-w-full max-h-full object-contain"
                  onError={() => setImageError(true)}
                />
              ) : isPDF ? (
                <div className="w-full h-full bg-white rounded">
                  <iframe
                    src={file.url}
                    className="w-full h-full border-0 rounded"
                    title={file.filename}
                  />
                </div>
              ) : (
                <div className="text-center text-white">
                  <FileText className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Preview tidak tersedia</p>
                  <p className="text-gray-300 mb-4">File: {file.filename}</p>
                  <a
                    href={file.url}
                    download={file.filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default FeedbackFileViewer