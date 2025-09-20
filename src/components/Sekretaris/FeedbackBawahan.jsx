import React from 'react'
import StatusBadge from './StatusBadge';
import isImageFile from '../../utils/isImageFile';
import { AlertCircle, Calendar, Clock, FileText, Paperclip, User } from 'lucide-react';

const FeedbackBawahan = ({
    disposisi,
    setSelectedImage,
    subFeedbackError,
    subFeedbackLoading,
    subordinateFeedback,
}) => {
    return (
        <div>
            {disposisi.diteruskan_kepada_user_id && (
                <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] rounded-2xl shadow-md border-2 border-slate-200 p-2 md:p-6">
                    <div className="flex items-center mb-4">
                        <div className="p-3 bg-black rounded-xl shadow-lg mr-3">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold" >Feedback dari Bawahan</h3>
                            <p className="text-sm font-medium" >Tanggapan dari bawahan yang dituju disposisi</p>
                        </div>
                    </div>
                    {subFeedbackLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D4A373]"></div>
                        </div>
                    ) : subFeedbackError ? (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-sm">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="font-medium">{subFeedbackError}</span>
                            </div>
                        </div>
                    ) : !subordinateFeedback ? (
                        <div className="text-center py-10" >
                            Belum ada feedback dari bawahan atau bawahan belum memberikan feedback.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                            {/* Header Feedback */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm" >
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            Oleh: {subordinateFeedback.user_jabatan || subordinateFeedback.disposisi?.diteruskan_kepada_jabatan || 'Bawahan'}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            Dibuat: {new Date(subordinateFeedback.created_at).toLocaleString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                timeZone: 'Asia/Jakarta'
                                            })}
                                        </div>
                                        {subordinateFeedback.updated_at && subordinateFeedback.updated_at !== subordinateFeedback.created_at && (
                                            <div className="flex items-center bg-[#FDFCFB] text-[#6D4C41] px-3 py-1 rounded-lg border border-slate-200">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Diperbarui: {new Date(subordinateFeedback.updated_at).toLocaleString('id-ID', {
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
                            </div>
                            {/* Tampilan feedback */}
                            <div className="space-y-4">
                                <div className="mb-4">
                                    <p className="text-sm font-semibold mb-2" >Status:</p>
                                    <StatusBadge status={disposisi.status_dari_bawahan || 'diproses'} />
                                </div>
                                <div className="bg-[#FDFCFB] border border-slate-200 p-4 rounded-xl shadow-sm">
                                    <p className="whitespace-pre-wrap leading-relaxed" >{subordinateFeedback.notes}</p>
                                </div>
                                {subordinateFeedback.has_files && (
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <Paperclip className="w-4 h-4 mr-2" />
                                            <p className="text-sm font-semibold" >
                                                Lampiran ({subordinateFeedback.file_count} file)
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {subordinateFeedback.files.map((file) => {
                                                const isImage = isImageFile(file);
                                                return (
                                                    <div key={file.id} className="relative cursor-pointer rounded-xl hover:scale-105 transition-all duration-300 shadow-sm border border-slate-200 overflow-hidden">
                                                        <button
                                                            onClick={() => {
                                                                if (isImage) {
                                                                    setSelectedImage(file.url);
                                                                } else {
                                                                    // Non-gambar: buka di tab baru
                                                                    window.open(file.url, '_blank', 'noopener,noreferrer');
                                                                }
                                                            }}
                                                            className="w-20 md:w-32 h-20 md:h-32 cursor-pointer"
                                                        >
                                                            {file.type && file.type.startsWith('image/') ? (
                                                                <img
                                                                    src={file.url}
                                                                    alt={file.filename}
                                                                    className="w-20 md:w-32 h-20 md:h-32 object-cover"
                                                                    loading="lazy"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center p-2 bg-[#FDFCFB]">
                                                                    <FileText className="w-8 h-8 text-[#D9534F]" />
                                                                    <p className='text-[#D9534F] text-xs font-bold text-center break-words'>{file.filename.split('.').pop().toUpperCase()}</p>
                                                                </div>
                                                            )}
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default FeedbackBawahan