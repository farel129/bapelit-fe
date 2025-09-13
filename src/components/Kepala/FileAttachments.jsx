import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../../utils/api";
import { Download, ExternalLink, ChevronLeft, ChevronRight, FileText, Image, File } from "lucide-react";
import LoadingSpinner from "../Ui/LoadingSpinner";

const FileAttachments = ({ surat }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [blobCache, setBlobCache] = useState(new Map()); // Gunakan Map untuk caching
  const activeRequests = useRef(new Map()); // Untuk mencegah duplicate requests

  if (!surat.has_photos || !surat.photos || surat.photos.length === 0) {
    return null;
  }

  // Function to fetch file as blob using axios dengan caching
  const fetchFileAsBlob = useCallback(async (url, fileId) => {
    // Return cached blob jika sudah ada
    if (blobCache.has(fileId)) {
      return blobCache.get(fileId);
    }

    // Return promise jika sedang dalam proses fetching
    if (activeRequests.current.has(fileId)) {
      return activeRequests.current.get(fileId);
    }

    try {
      const isRelativeUrl = !url.startsWith('http');
      const requestUrl = isRelativeUrl ? url : url.replace(api.defaults.baseURL, '');

      const fetchPromise = api.get(requestUrl, {
        responseType: 'blob',
        headers: {
          'Accept': 'image/*,application/pdf,*/*',
        },
      }).then(response => {
        const blob = response.data;
        const blobUrl = URL.createObjectURL(blob);
        setBlobCache(prev => new Map(prev.set(fileId, blobUrl)));
        activeRequests.current.delete(fileId);
        return blobUrl;
      }).catch(error => {
        activeRequests.current.delete(fileId);
        throw error;
      });

      activeRequests.current.set(fileId, fetchPromise);
      return fetchPromise;

    } catch (error) {
      activeRequests.current.delete(fileId);
      throw error;
    }
  }, [blobCache]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      blobCache.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const openViewer = (startIndex = 0) => {
    setCurrentIndex(startIndex);
    setViewerOpen(true);
    setError(null);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setError(null);
    setLoading(false);
  };

  // FileViewerModal - versi yang dioptimasi
  const FileViewerModal = () => {
    if (!viewerOpen || !surat.photos || surat.photos.length === 0) return null;

    const currentFile = surat.photos[currentIndex];
    const isImage = currentFile.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const isPDF = currentFile.filename?.match(/\.pdf$/i);

    const nextFile = () => {
      setCurrentIndex((prev) => (prev + 1) % surat.photos.length);
      setError(null);
    };

    const prevFile = () => {
      setCurrentIndex((prev) => (prev - 1 + surat.photos.length) % surat.photos.length);
      setError(null);
    };

    const handleFileError = async (e) => {
      try {
        setLoading(true);
        const blobUrl = await fetchFileAsBlob(currentFile.url, currentFile.id);
        
        if (e.target) {
          e.target.src = blobUrl;
        } else if (e.target?.tagName === 'IFRAME') {
          e.target.src = blobUrl;
        }
        
        setError(null);
      } catch (axiosError) {
        const errorMsg = axiosError.response
          ? `Server error ${axiosError.response.status}: ${axiosError.response.statusText}`
          : `Network error: ${axiosError.message}`;
        setError(`Gagal memuat file. ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    const handleDownload = async () => {
      try {
        let blobUrl = blobCache.get(currentFile.id);
        if (!blobUrl) {
          blobUrl = await fetchFileAsBlob(currentFile.url, currentFile.id);
        }
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = currentFile.filename;
        a.click();
      } catch (error) {
        console.error('Download failed:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-[#EDE6E3] shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-[#EDE6E3] bg-white">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-bold" style={{ color: '#2E2A27' }}>
                {currentFile.filename}
              </h3>
              <span className="px-3 py-1.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white rounded-full text-sm font-semibold shadow-sm">
                {Math.round(currentFile.size / 1024)} KB
              </span>
              {surat.photos.length > 1 && (
                <span className="text-sm font-medium" style={{ color: '#6D4C41' }}>
                  {currentIndex + 1} dari {surat.photos.length}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {surat.photos.length > 1 && (
                <>
                  <button
                    onClick={prevFile}
                    className="p-2.5 text-[#6D4C41] hover:text-[#2E2A27] hover:bg-[#FDFCFB] rounded-xl transition-all border border-[#EDE6E3]"
                    title="File sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextFile}
                    className="p-2.5 text-[#6D4C41] hover:text-[#2E2A27] hover:bg-[#FDFCFB] rounded-xl transition-all border border-[#EDE6E3]"
                    title="File berikutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <a
                href={blobCache.get(currentFile.id) || currentFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 text-[#4CAF50] hover:text-[#2E7D32] hover:bg-green-50 rounded-xl transition-all border border-[#EDE6E3]"
                title="Buka di tab baru"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <button
                onClick={handleDownload}
                className="p-2.5 text-[#2196F3] hover:text-[#0D47A1] hover:bg-blue-50 rounded-xl transition-all border border-[#EDE6E3]"
                title="Download file"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={closeViewer}
                className="p-2.5 text-[#6D4C41] hover:text-[#2E2A27] hover:bg-[#FDFCFB] rounded-xl transition-all border border-[#EDE6E3]"
                title="Tutup"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 bg-[#FDFCFB] max-h-[calc(90vh-180px)] overflow-auto relative">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-4 shadow-sm">
                <p className="font-semibold">Error:</p>
                <p className="text-sm">{error}</p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => window.open(currentFile.url, '_blank')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    Coba buka langsung
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        await fetchFileAsBlob(currentFile.url, currentFile.id);
                        setError(null);
                        setCurrentIndex(prev => prev); // Force re-render
                      } catch (axiosError) {
                        const errorMsg = axiosError.response?.data?.message || axiosError.message;
                        setError(`Retry failed: ${errorMsg}`);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {isImage ? (
              <div className="flex justify-center">
                <img
                  key={currentFile.id}
                  src={blobCache.get(currentFile.id) || currentFile.url}
                  alt={currentFile.filename}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-lg border border-[#EDE6E3]"
                  onError={handleFileError}
                  crossOrigin="anonymous"
                />
              </div>
            ) : isPDF ? (
              <div className="w-full h-[60vh]">
                <iframe
                  key={currentFile.id}
                  src={blobCache.get(currentFile.id) || currentFile.url}
                  className="w-full h-full border rounded-2xl shadow-lg border-[#EDE6E3]"
                  title={currentFile.filename}
                  onError={handleFileError}
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-[#6D4C41]">📄</div>
                <p className="text-[#2E2A27] font-semibold mb-2">
                  File tidak dapat ditampilkan dalam preview
                </p>
                <p className="text-[#6D4C41] mb-4">
                  Format file tidak didukung untuk preview
                </p>
                <a
                  href={blobCache.get(currentFile.id) || currentFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white px-4 py-2.5 rounded-xl inline-flex items-center font-semibold transition-all shadow-md hover:shadow-lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </a>
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#EDE6E3]">
                  <LoadingSpinner />
                </div>
              </div>
            )}
          </div>

          {/* Footer dengan thumbnail */}
          {surat.photos.length > 1 && (
            <div className="p-4 border-t border-[#EDE6E3] bg-white max-h-32 overflow-auto">
              <div className="flex space-x-3">
                {surat.photos.map((file, index) => (
                  <button
                    key={file.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 p-2 rounded-xl border transition-all ${
                      index === currentIndex
                        ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white border-[#EDE6E3] shadow-md'
                        : 'bg-white text-[#2E2A27] border-[#EDE6E3] hover:bg-[#FDFCFB] hover:shadow-sm'
                    }`}
                  >
                    <div className="w-16 h-12 flex items-center justify-center bg-[#FDFCFB] rounded-lg border border-[#EDE6E3]">
                      {file.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img
                          src={blobCache.get(file.id) || file.url}
                          alt={file.filename}
                          className="max-w-full max-h-full object-cover rounded"
                          onError={async (e) => {
                            if (!blobCache.has(file.id)) {
                              try {
                                const blobUrl = await fetchFileAsBlob(file.url, file.id);
                                e.target.src = blobUrl;
                              } catch (error) {
                                e.target.style.display = 'none';
                              }
                            } else {
                              e.target.style.display = 'none';
                            }
                          }}
                        />
                      ) : (
                        <div className="text-lg">
                          {file.filename?.match(/\.pdf$/i) ? (
                            <FileText className="w-5 h-5 text-[#D9534F]" />
                          ) : (
                            <File className="w-5 h-5 text-[#6D4C41]" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs font-medium truncate max-w-16" title={file.filename} style={{ color: index === currentIndex ? 'white' : '#6D4C41' }}>
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

  return (
    <>
      <div className="mt-4 p-4 bg-gradient-to-br from-[#FDFCFB] to-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#6D4C41' }}>
            <FileText className="w-4 h-4" />
            Lampiran ({surat.photo_count} file)
          </h4>
          <button
            onClick={() => openViewer(0)}
            className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:shadow-md border border-[#EDE6E3] flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Lihat Semua
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {surat.photos.slice(0, 3).map((photo, index) => {
            const isImage = photo.filename?.match(/\.(jpg|jpeg|png|gif|webp)$/i);
            const isPDF = photo.filename?.match(/\.pdf$/i);

            return (
              <div
                key={photo.id}
                className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-[#EDE6E3] shadow-sm hover:shadow-md transition-all"
              >
                <div 
                  className="w-20 h-20 flex items-center justify-center bg-[#FDFCFB] rounded-lg cursor-pointer hover:bg-[#F8F6F4] transition-all border border-[#EDE6E3]"
                  onClick={() => openViewer(index)}
                  title={`Klik untuk melihat ${photo.filename}`}
                >
                  {isImage ? (
                    <img
                      src={blobCache.get(photo.id) || photo.url}
                      alt={photo.filename}
                      className="w-full h-full object-cover rounded"
                      onError={async (e) => {
                        if (!blobCache.has(photo.id)) {
                          try {
                            const blobUrl = await fetchFileAsBlob(photo.url, photo.id);
                            e.target.src = blobUrl;
                          } catch (error) {
                            console.error('Thumbnail load failed:', error);
                          }
                        }
                      }}
                    />
                  ) : (
                    <span className="text-2xl">
                      {isPDF ? (
                        <FileText className="w-8 h-8 text-[#D9534F]" />
                      ) : (
                        <File className="w-8 h-8 text-[#6D4C41]" />
                      )}
                    </span>
                  )}
                </div>                
              </div>
            );
          })}

          {surat.photos.length > 3 && (
            <div 
              className="flex items-center justify-center bg-white p-2 rounded-xl border border-[#EDE6E3] text-sm font-medium cursor-pointer hover:bg-[#FDFCFB] transition-all shadow-sm hover:shadow-md"
              onClick={() => openViewer(3)}
              style={{ color: '#6D4C41' }}
              title="Klik untuk melihat file lainnya"
            >
              +{surat.photos.length - 3} file lainnya
            </div>
          )}
        </div>
      </div>

      <FileViewerModal />
    </>
  );
};

export default FileAttachments;