const KepalaFeedbackPhotoModal = ({ photo, onClose }) => {
  if (!photo) return null;
  const photoUrl = photo.url;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">{photo.foto_original_name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        {/* Image */}
        <div className="p-4 bg-gray-50">
          <img
            src={photoUrl}
            alt={photo.foto_original_name}
            className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg object-contain"
            onError={(e) => {
              console.error('Modal image failed to load:', {
                photoId: photo.id,
                url: photoUrl,
                error: e
              });
            }}
          />
        </div>
        
        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <p>Ukuran: {(photo.file_size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    </div>
  );
};
export default KepalaFeedbackPhotoModal