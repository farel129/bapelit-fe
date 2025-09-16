import React from 'react'

const ImageModal = ({
  selectedImage,
  setSelectedImage
}) => {
  return (
    <div>
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300">
          {/* Container Modal */}
          <div className="relative w-full max-w-7xl mx-auto max-h-full animate-in zoom-in-95 duration-300">

            {/* Tombol Close */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 sm:top-4 sm:right-4 z-20 
                   bg-white/20 hover:bg-white/30 active:bg-white/40
                   backdrop-blur-md rounded-full p-2 sm:p-3
                   text-white hover:text-gray-200 
                   transition-all duration-200 ease-out
                   hover:scale-110 active:scale-95
                   border border-white/20 hover:border-white/30
                   shadow-lg hover:shadow-xl"
              aria-label="Tutup modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Container Gambar */}
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl 
                      border border-white/20 shadow-2xl overflow-hidden
                      hover:shadow-3xl transition-shadow duration-300">

              {/* Gradient Overlay untuk Estetika */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none rounded-2xl sm:rounded-3xl"></div>

              {/* Gambar */}
              <img
                src={selectedImage}
                alt="Preview gambar"
                className="w-full max-h-[85vh] sm:max-h-[90vh] object-contain 
                     rounded-2xl sm:rounded-3xl
                     transition-transform duration-300 ease-out"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x600?text=Gambar+Tidak+Dapat+Ditampilkan';
                }}
                loading="lazy"
              />

              {/* Loading Shimmer Effect (Optional) */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                        -translate-x-full animate-pulse duration-1000 pointer-events-none"></div>
            </div>

            {/* Info atau Actions (Optional) */}
            <div className="absolute bottom-4 left-4 right-4 
                      bg-black/30 backdrop-blur-md rounded-xl p-3
                      border border-white/10 opacity-0 hover:opacity-100
                      transition-opacity duration-300 pointer-events-none">
              <p className="text-white/80 text-sm text-center">
                Klik di luar gambar atau tombol × untuk menutup
              </p>
            </div>
          </div>

          <div
            className="absolute inset-0 -z-10"
            onClick={() => setSelectedImage(null)}
          />
        </div>
      )}
    </div>
  )
}

export default ImageModal