import { FileText, Save } from 'lucide-react'

const SuratForm = ({
  processing,
  onSubmit,
  onCancel,
}) => {
  return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="p-8">
            <div className="flex items-center space-x-3">
              <div className="">
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-blue-500">Proses Surat</h2>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-8 py-3 text-slate-600 cursor-pointer font-semibold bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-slate-300/30"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="inline-flex cursor-pointer items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 focus:ring-4 focus:ring-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-3" />
                      Proses Surat
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  )
}

export default SuratForm