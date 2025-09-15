import { AlertCircle, MessageSquare, Paperclip, Send } from 'lucide-react'
import React from 'react'

const FeedbackForm = ({
  showFeedbackForm,
  setShowFeedbackForm,
  showForwardModal,
  feedbackData,
  feedbackError,
  feedbackLoading,
  handleFeedbackChange,
  handleFeedbackSubmit,
  handleFileChange,
  editingFeedbackId

}) => {
  return (
    <div>
      {showFeedbackForm && !showForwardModal && !editingFeedbackId && (
        <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-slate-200 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 bg-white rounded-xl shadow-lg mr-1">
              <MessageSquare className="w-6 h-6 text-pink-400" />
            </div>
            <div>
              <h3 className=" font-semibold" >Beri Feedback</h3>
              <p className="text-sm font-medium" >Berikan tanggapan dan update status disposisi</p>
            </div>
          </div>
          {feedbackError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="font-medium">{feedbackError}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleFeedbackSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3" >
                Catatan Feedback *
              </label>
              <textarea
                name="notes"
                value={feedbackData.notes}
                onChange={handleFeedbackChange}
                required
                rows="5"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 resize-none text-[#2E2A27] shadow-sm"
                placeholder="Masukkan catatan feedback Anda..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3" >
                Status Disposisi *
              </label>
              <div className="flex gap-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="status"
                    value="diproses"
                    checked={feedbackData.status === 'diproses'}
                    onChange={handleFeedbackChange}
                    className="w-4 h-4 text-black border-slate-200 focus:ring-pink-400"
                  />
                  <span className="ml-3 font-medium" >Diproses</span>
                </label>
                <label className="flex items-center cursor-pointer group">
                  <input
                    type="radio"
                    name="status"
                    value="selesai"
                    checked={feedbackData.status === 'selesai'}
                    onChange={handleFeedbackChange}
                    className="w-4 h-4 text-black border-slate-200 focus:ring-pink-400"
                  />
                  <span className="ml-3 font-medium" >Selesai</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-3" >
                Lampiran File (maks. 5 file)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 shadow-sm"
              />
              {feedbackData.files.length > 0 && (
                <div className="mt-2 text-sm bg-[#FDFCFB] px-3 py-2 rounded-lg border border-slate-200 shadow-sm" >
                  <Paperclip className="w-4 h-4 inline mr-2" />
                  {feedbackData.files.length} file dipilih
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setShowFeedbackForm(false)}
                className="px-6 py-3 border border-slate-200 rounded-xl text-[#2E2A27] hover:bg-[#FDFCFB] font-semibold transition-colors shadow-sm"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={feedbackLoading}
                className={`
                        group inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-slate-200 shadow-sm
                        ${feedbackLoading
                    ? 'bg-black text-white opacity-75 cursor-not-allowed'
                    : 'bg-black text-white hover:shadow-md hover:-translate-y-0.5'
                  }
                      `}
              >
                {feedbackLoading ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Kirim Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default FeedbackForm