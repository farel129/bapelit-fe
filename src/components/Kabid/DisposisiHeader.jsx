// components/Kabid/DisposisiHeader.jsx
import React from 'react';
import { AlertCircle, ArrowLeft, Check, FileText, Forward, MessageSquare } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';

const DisposisiHeader = ({ 
  disposisi, 
  onDownloadPDF, 
  downloadLoading, 
  onAcceptDisposisi, 
  acceptLoading, 
  acceptError,
  onShowForwardModal,
  onShowFeedbackForm,
  showForwardModal,
  showFeedbackForm,
  editingFeedbackId
}) => {
  const navigate = useNavigate();

  // Helper function untuk cek kondisi tombol
  const canAcceptDisposisi = () => disposisi && 
    disposisi.status === 'dibaca' && 
    disposisi.status_dari_kabid !== 'diterima' && 
    disposisi.status_dari_kabid !== 'diteruskan';

  const canForwardDisposisi = () => disposisi && disposisi.status_dari_kabid === 'diterima';
  
  const canGiveFeedback = () => disposisi && 
    !disposisi.has_feedback && 
    (disposisi.status_dari_kabid === 'diterima' || disposisi.status === 'diproses');

  return (
    <div className="mb-4">
      <button
        onClick={() => navigate(-1)}
        className="group inline-flex items-center mb-3"
      >
        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold">Kembali</span>
      </button>

      <div className="px-4 mb-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2">
          <div className="flex-1">
            <h1 className="lg:text-lg text-lg font-bold">Detail Disposisi</h1>
            <p className="text-sm font-medium mt-1">Kelola dan berikan feedback terhadap disposisi yang diterima</p>

            <button
              onClick={onDownloadPDF}
              disabled={downloadLoading}
              className={`group inline-flex mt-2 items-center px-6 py-3 shadow-lg rounded-xl font-medium transition-all duration-200 border border-slate-200 shadow-sm${
                downloadLoading
                  ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-black opacity-75 cursor-not-allowed'
                  : 'bg-gradient-to-br from-gray-500 to-gray-700 hover:from-gray-700 hover:to-gray-900 text-black hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {downloadLoading ? (
                <>
                  <div className="w-5 h-5 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Mengunduh...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Download PDF
                </>
              )}
            </button>
          </div>

          {disposisi && (
            <div className="flex flex-col items-center lg:items-end space-y-4">
              {/* Status Badge */}
              <StatusBadge status={disposisi.status_dari_kabid} />

              {/* Tombol Aksi */}
              <div className="flex flex-col sm:flex-row gap-2">
                {canAcceptDisposisi() && (
                  <button
                    onClick={onAcceptDisposisi}
                    disabled={acceptLoading}
                    className={`
                      group inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-slate-200 shadow-sm
                      ${acceptLoading
                        ? 'bg-black text-white opacity-75 cursor-not-allowed'
                        : 'bg-black text-white hover:shadow-md hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {acceptLoading ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Terima Disposisi
                      </>
                    )}
                  </button>
                )}

                {canForwardDisposisi() && !showForwardModal && !showFeedbackForm && !editingFeedbackId && (
                  <button
                    onClick={onShowForwardModal}
                    className="group inline-flex items-center px-6 py-3 rounded-xl bg-neutral-800 text-white font-semibold hover:shadow-md hover:-translate-y-0.5 shadow-sm transition-all duration-200 border border-slate-200"
                  >
                    <Forward className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Teruskan
                  </button>
                )}

                {canGiveFeedback() && !showForwardModal && !showFeedbackForm && !editingFeedbackId && (
                  <button
                    onClick={onShowFeedbackForm}
                    className="group inline-flex items-center px-6 py-3 rounded-xl bg-black text-white font-semibold hover:shadow-md hover:-translate-y-0.5 shadow-sm transition-all duration-200 border border-slate-200"
                  >
                    <MessageSquare className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Beri Feedback
                  </button>
                )}
              </div>

              {/* Error message */}
              {acceptError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-medium">{acceptError}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisposisiHeader;