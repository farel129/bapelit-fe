// components/SuratCard.jsx
import React from 'react';
import { Calendar, Building, User, Eye, FileText } from 'lucide-react';
import { formatDate, getStatusBadge } from '../utils/suratHelpers';

const SuratCard = ({ surat, onOpenPhotos }) => {
    console.log('DATA SURAT:', surat);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-gray-300">
      <div className="p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="flex-1 space-y-3">
            {/* Status Badge */}
            <div className="flex items-center space-x-3 mb-4">
              <span className={`${getStatusBadge(surat.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                {surat.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            
            {/* Date */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Tanggal Dibuat</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(surat.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Photo Button */}
          {surat.has_photos && surat.photos && surat.photos.length > 0 && (
            <button
              onClick={() => {
                console.log('Opening photos for surat:', surat.id);
                console.log('Photos:', surat.photos);
                onOpenPhotos({ photos: surat.photos, info: surat });
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-[#262628] text-white rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              <Eye className="h-4 w-4" />
              <span>Lihat Foto ({surat.photo_count})</span>
            </button>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Asal Instansi */}
            <div className="flex items-start space-x-3 p-4 bg-blue-50/60 rounded-lg border border-blue-100/70 hover:bg-blue-50/80 transition-colors duration-200">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Asal Instansi</p>
                <p className="text-gray-900 font-medium">{surat.asal_instansi}</p>
              </div>
            </div>

            {/* Tujuan Jabatan */}
            <div className="flex items-start space-x-3 p-4 bg-emerald-50/60 rounded-lg border border-emerald-100/70 hover:bg-emerald-50/80 transition-colors duration-200">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Tujuan Jabatan</p>
                <p className="text-gray-900 font-medium">{surat.tujuan_jabatan}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Dibuat oleh */}
            <div className="flex items-start space-x-3 p-4 bg-purple-50/60 rounded-lg border border-purple-100/70 hover:bg-purple-50/80 transition-colors duration-200">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">Dibuat Oleh</p>
                <p className="text-gray-900 font-medium">{surat.users?.name || 'Tidak diketahui'}</p>
                <p className="text-sm text-gray-600">{surat.users?.jabatan}</p>
              </div>
            </div>

            {/* Diproses oleh */}
            {surat.processed_user && (
              <div className="flex items-start space-x-3 p-4 bg-amber-50/60 rounded-lg border border-amber-100/70 hover:bg-amber-50/80 transition-colors duration-200">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-100 rounded-lg">
                  <User className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Diproses Oleh</p>
                  <p className="text-gray-900 font-medium">{surat.processed_user.name}</p>
                  <p className="text-sm text-gray-600">{surat.processed_user.jabatan}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Keterangan Section */}
        {surat.keterangan && (
          <div className="p-4 bg-slate-50/60 rounded-lg border border-slate-100/70 hover:bg-slate-50/80 transition-colors duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="h-4 w-4 text-slate-600" />
              <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Keterangan</p>
            </div>
            <p className="text-gray-800 leading-relaxed">{surat.keterangan}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuratCard;