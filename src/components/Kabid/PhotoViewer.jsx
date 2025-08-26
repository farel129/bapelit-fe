import { Download, Eye, FileIcon, FileText, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

const PhotoViewer = ({ photo }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const isImage = photo.filename?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
  const isPDF = photo.filename?.match(/\.pdf$/i);

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          {isImage && !imageError ? (
            <img
              src={photo.url}
              alt={photo.filename}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
              onClick={() => {
                setShowPreview(true);
                resetTransforms();
              }}
              onError={() => setImageError(true)}
            />
          ) : isPDF ? (
            <div 
              className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => setShowPreview(true)}
            >
              <div className="text-center">
                <FileText className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-xs text-gray-600">PDF Document</p>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <FileIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">File</p>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(true);
                resetTransforms();
              }}
              className="bg-black bg-opacity-50 text-white p-1.5 rounded hover:bg-opacity-70 transition-colors"
              title="Lihat"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 truncate pr-2">
              {photo.filename}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {Math.round(photo.size / 1024)} KB
            </span>
          </div>
          
          
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 bg-black bg-opacity-50">
              <div className="text-white">
                <h3 className="font-semibold truncate max-w-96">{photo.filename}</h3>
                <p className="text-sm text-gray-300">{Math.round(photo.size / 1024)} KB</p>
              </div>
              
              <div className="flex items-center gap-2">
                {isImage && !imageError && (
                  <>
                    <button
                      onClick={handleZoomOut}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <span className="text-white text-sm min-w-16 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleRotate}
                      className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
                      title="Rotate"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                <a
                  href={photo.url}
                  download={photo.filename}
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
                  src={photo.url}
                  alt={photo.filename}
                  className="max-w-full max-h-full object-contain transition-transform"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                  onError={() => setImageError(true)}
                />
              ) : isPDF ? (
                <div className="w-full h-full bg-white rounded">
                  <iframe
                    src={photo.url}
                    className="w-full h-full border-0 rounded"
                    title={photo.filename}
                  />
                </div>
              ) : (
                <div className="text-center text-white">
                  <FileIcon className="w-24 h-24 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg mb-2">Preview tidak tersedia</p>
                  <p className="text-gray-300 mb-4">File: {photo.filename}</p>
                  <a
                    href={photo.url}
                    download={photo.filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download File
                  </a>
                </div>
              )}
            </div>

            {isImage && !imageError && (
              <div className="p-2 bg-black bg-opacity-50 text-center">
                <p className="text-gray-300 text-sm">
                  Click dan drag untuk scroll • Scroll mouse untuk zoom • Gunakan tombol kontrol di atas
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
export default PhotoViewer