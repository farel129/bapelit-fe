import React from 'react'
import isImageFile from '../../utils/isImageFile';
import { FileText, MessageSquare, User } from 'lucide-react';

export const DisposisiContentSection = ({disposisi, onImageClick}) => {
  return (
    <div className="mt-4 space-y-2">
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-semibold mb-4 flex items-center" >
          <MessageSquare className="w-5 h-5 mr-3" />
          Dengan hormat harap:
        </h4>
        <div className="bg-[#FDFCFB] border border-slate-200 p-4 rounded-lg shadow-sm">
          <p className="whitespace-pre-wrap leading-relaxed" >
            {disposisi.dengan_hormat_harap}
          </p>
        </div>
      </div>
      {disposisi.catatan && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="font-semibold mb-4 flex items-center" >
            <User className="w-5 h-5 mr-3" />
            Catatan dari Kepala
          </h4>
          <div className="bg-[#FDFCFB] border border-slate-200 p-4 rounded-lg shadow-sm">
            <p className="leading-relaxed" >{disposisi.catatan}</p>
          </div>
        </div>
      )}
      {disposisi.catatan_atasan && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="font-semibold mb-4 flex items-center" >
            <User className="w-5 h-5 mr-3" />
            Keterangan dari Anda
          </h4>
          <div className="bg-[#FDFCFB] border border-slate-200 p-4 rounded-lg shadow-sm">
            <p className="leading-relaxed" >{disposisi.catatan_atasan}</p>
          </div>
        </div>
      )}
      {disposisi.surat_masuk?.has_photos && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 mr-3" />
            <h3 className="font-semibold">Lampiran</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {disposisi.surat_masuk.photos.map((photo, index) => {
              const isImage = isImageFile(photo);
              return (
                <div
                  key={photo.id}
                  className="relative rounded-xl overflow-hidden cursor-pointer border border-slate-200 hover:scale-105 transition-all duration-300 shadow-sm"
                  onClick={() => {
                    if (isImage) {
                      onImageClick(photo.url);
                    } else {
                      // Non-gambar: buka di tab baru
                      window.open(photo.url, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  <div className="w-20 md:w-32 h-20 md:h-32 flex items-center justify-center bg-gray-50">
                    {isImage ? (
                      <img
                        src={photo.url}
                        alt={`Surat foto ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/128x128?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="text-[#D9534F] flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8" />
                        <p className="text-xs font-bold mt-1 text-center break-words">
                          {photo.filename.split('.').pop()?.toUpperCase()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
