import React from 'react'
import StatusBadge from './StatusBadge';
import { AlertCircle, Calendar, Clock, Edit, FileText, MessageSquare, Paperclip, Save, Trash2, X } from 'lucide-react';
import isImageFile from '../../utils/isImageFile';

const MyFeedback = ({
    feedbackList,
    editFeedbackData,
    editingFeedbackId,
    editLoading,
    showFeedbackForm,
    showForwardModal,
    fetchFeedbackForEdit,
    feedbackError,
    handleEditFeedbackChange,
    handleEditFeedbackSubmit,
    handleEditFileChange,
    handleRemoveExistingFile,
    cancelEditFeedback,
    setSelectedImage
}) => {
    return (
        <div>
            {feedbackList.length > 0 && (
                <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-slate-200 p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-white rounded-xl shadow-md mr-3">
                            <MessageSquare className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold" >Feedback yang Telah Dikirim</h3>
                            <p className="text-sm font-medium" >Riwayat tanggapan yang telah Anda berikan</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {feedbackList.map((feedback) => (
                            <div key={feedback.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                                {/* Header Feedback */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                    <div className="space-y-2">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm" >
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Dibuat: {new Date(feedback.created_at).toLocaleString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    timeZone: 'Asia/Jakarta'
                                                })}
                                            </div>
                                            {feedback.updated_at && feedback.updated_at !== feedback.created_at && (
                                                <div className="flex items-center bg-[#FDFCFB] text-[#6D4C41] px-3 py-1 rounded-lg border border-slate-200">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Diperbarui: {new Date(feedback.updated_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        timeZone: 'Asia/Jakarta'
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {!editingFeedbackId && !showFeedbackForm && !showForwardModal && (
                                        <button
                                            onClick={() => fetchFeedbackForEdit(feedback.id)}
                                            disabled={editLoading}
                                            className="group inline-flex items-center px-4 py-2 bg-black text-white rounded-xl transition-all duration-200 hover:shadow-md border border-slate-200"
                                            title="Edit Feedback"
                                        >
                                            {editLoading ? (
                                                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                            )}
                                            <span className="font-semibold">Edit</span>
                                        </button>
                                    )}
                                </div>
                                {/* Jika sedang dalam mode edit untuk feedback ini */}
                                {editingFeedbackId === feedback.id ? (
                                    <div className="space-y-6">
                                        {feedbackError && (
                                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                                                <div className="flex items-center">
                                                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                                    <span className="font-medium">{feedbackError}</span>
                                                </div>
                                            </div>
                                        )}
                                        <form onSubmit={handleEditFeedbackSubmit} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-semibold mb-3" >
                                                    Catatan Feedback *
                                                </label>
                                                <textarea
                                                    name="notes"
                                                    value={editFeedbackData.notes}
                                                    onChange={handleEditFeedbackChange}
                                                    required
                                                    rows="5"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 resize-none text-[#2E2A27] shadow-sm"
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
                                                            checked={editFeedbackData.status === 'diproses'}
                                                            onChange={handleEditFeedbackChange}
                                                            className="w-4 h-4 text-black border-slate-200 focus:ring-teal-400"
                                                        />
                                                        <span className="ml-3 font-medium" >Diproses</span>
                                                    </label>
                                                    <label className="flex items-center cursor-pointer group">
                                                        <input
                                                            type="radio"
                                                            name="status"
                                                            value="selesai"
                                                            checked={editFeedbackData.status === 'selesai'}
                                                            onChange={handleEditFeedbackChange}
                                                            className="w-4 h-4 text-black border-slate-200 focus:ring-teal-400"
                                                        />
                                                        <span className="ml-3 font-medium" >Selesai</span>
                                                    </label>
                                                </div>
                                            </div>
                                            {/* File yang sudah ada */}
                                            {editFeedbackData.existingFiles.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-semibold mb-3" >
                                                        File yang sudah ada
                                                    </label>
                                                    <div className="space-y-3">
                                                        {editFeedbackData.existingFiles.map((file) => (
                                                            <div key={file.id} className="flex items-center justify-between bg-[#FDFCFB] p-4 rounded-xl border border-slate-200 shadow-sm">
                                                                <div className="flex items-center">
                                                                    <div className="p-2 bg-slate-600 rounded-lg mr-3">
                                                                        <FileText className="w-4 h-4 text-white" />
                                                                    </div>
                                                                    <span className="font-medium" >{file.filename}</span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveExistingFile(file.id)}
                                                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div>
                                                <label className="block text-sm font-semibold mb-3" >
                                                    Tambah File Baru (maks. 5 file)
                                                </label>
                                                <input
                                                    type="file"
                                                    multiple
                                                    onChange={handleEditFileChange}
                                                    accept="image/*,application/pdf"
                                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm"
                                                />
                                                {editFeedbackData.newFiles.length > 0 && (
                                                    <div className="mt-2 text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-200 shadow-sm">
                                                        <Paperclip className="w-4 h-4 inline mr-2" />
                                                        {editFeedbackData.newFiles.length} file baru dipilih
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={cancelEditFeedback}
                                                    className="px-6 py-3 border border-slate-200 rounded-xl text-[#2E2A27] hover:bg-[#FDFCFB] font-semibold transition-colors shadow-sm flex items-center"
                                                >
                                                    <X className="w-4 h-4 inline mr-2" />
                                                    Batal
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={editLoading}
                                                    className={`
                                  group inline-flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-slate-200 shadow-sm
                                  ${editLoading
                                                            ? 'bg-black text-white opacity-75 cursor-not-allowed'
                                                            : 'bg-black text-white hover:shadow-md hover:-translate-y-0.5'
                                                        }
                                `}
                                                >
                                                    {editLoading ? (
                                                        <>
                                                            <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Memperbarui...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                                            Perbarui Feedback
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    /* Tampilan normal feedback */
                                    <div className="space-y-4">
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold mb-2" >Status:</p>
                                            <StatusBadge status={feedback.disposisi?.status || 'diproses'} />
                                        </div>
                                        <div className="bg-[#FDFCFB] border border-slate-200 p-4 rounded-xl shadow-sm">
                                            <p className="whitespace-pre-wrap leading-relaxed" >{feedback.notes}</p>
                                        </div>
                                        {feedback.has_files && (
                                            <div>
                                                <div className="flex items-center mb-4">
                                                    <Paperclip className="w-4 h-4 mr-2" />
                                                    <p className="text-sm font-semibold" >
                                                        Lampiran ({feedback.file_count} file)
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">

                                                    {feedback.files.map((file, index) => {
                                                        const isImage = isImageFile(file);
                                                        return (
                                                            <div
                                                                key={file.id}
                                                                className="relative cursor-pointer rounded-xl hover:scale-105 transition-all duration-300 shadow-sm border border-slate-200 overflow-hidden"
                                                                onClick={() => {
                                                                    if (isImage) {
                                                                        setSelectedImage(file.url);
                                                                    } else {
                                                                        // Non-gambar: buka di tab baru
                                                                        window.open(file.url, '_blank', 'noopener,noreferrer');
                                                                    }
                                                                }}
                                                            >
                                                                <div className="w-32 h-32 bg-white border-slate-200 shadow-lg flex items-center justify-center">
                                                                    {isImage ? (
                                                                        <img
                                                                            src={file.url}
                                                                            alt={`Thumbnail ${index + 1}`}
                                                                            className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                                                                            onError={(e) => {
                                                                                e.target.src = 'https://via.placeholder.com/160x160?text=No+Image';
                                                                                e.target.className = "w-full h-full object-cover";
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="text-teal-400 flex flex-col justify-center items-center">
                                                                            <FileText className='w-9 h-9' />
                                                                            <p className='text-[#D9534F] text-xs font-bold text-center break-words'>{file.filename.split('.').pop().toUpperCase()}</p>

                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyFeedback