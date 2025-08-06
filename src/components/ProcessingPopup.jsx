import { Download, CheckCircle, Loader } from 'lucide-react'

const ProcessingPopup = ({
  showProcessingPopup,
  processingComplete,
  isDownloading,
  downloadProgress,
  onDownloadPDF,
  onClose
}) => {
  if (!showProcessingPopup) return null

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        {!processingComplete ? (
          // Processing State
          <div className="text-center">
            <Loader className='w-8 h-8 animate-spin text-black' />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Memproses Surat</h3>
            <p className="text-gray-600">Mohon tunggu, surat sedang diproses...</p>
          </div>
        ) : (
          // Processing Complete State
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Surat Berhasil Diproses!</h3>
            <p className="text-gray-600 mb-6">Lembar disposisi siap untuk diunduh.</p>
            
            {isDownloading && downloadProgress > 0 && (
              // Download Progress State
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Mengunduh PDF...</span>
                  <span>{downloadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gray-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 justify-center">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 cursor-pointer hover:text-gray-800"
              >
                Tutup
              </button>
              <button
                onClick={onDownloadPDF}
                disabled={isDownloading}
                className="inline-flex items-center font-bold px-4 py-3 bg-[#262628] hover:bg-black cursor-pointer text-white rounded-xl disabled:opacity-50 text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {isDownloading ? 'Mengunduh...' : 'Download PDF'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProcessingPopup