import { Image, ChevronDown, ChevronUp, Calendar, Building2, FileText, Clock } from "lucide-react";
import { useState } from "react";

const SuratInfo = ({ surat, onOpenPhotos }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  
  console.log('DATA SURAT:', surat);

  return (
    <div className="bg-gradient-to-tl from-gray-50 via-white to-gray-50 shadow-lg rounded-2xl p-6 border border-black/5">
      {/* Header with Photo Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-1">Informasi Surat</h2>
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        </div>
        {surat.has_photos && surat.photos && surat.photos.length > 0 && (
          <button
            onClick={() => {
              console.log('Opening photos for surat:', surat.id);
              console.log('Photos:', surat.photos);
              onOpenPhotos({ photos: surat.photos, info: surat });
            }}
            className="flex items-center space-x-2 px-3 py-3 bg-gray-100 text-black rounded-xl hover:bg-green-100 cursor-pointer transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg"
          >
            <Image className="h-4 w-4" />
            <span className="text-sm font-semibold">
              Lihat Foto ({surat.photo_count})
            </span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Always visible essential info with modern cards */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-lg transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl animate-bounce">
                <FileText className="h-4 w-4 text-black" />
              </div>
              <label className="text-sm font-semibold text-gray-700 uppercase ">Nomor Surat</label>
            </div>
            <p className="text-sm text-gray-900 font-medium">{surat.nomor_surat}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-lg transition-colors">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-xl animate-bounce">
                <Building2 className="h-4 w-4 text-black" />
              </div>
              <label className="text-sm font-semibold text-gray-700 uppercase ">Asal Instansi</label>
            </div>
            <p className="text-sm text-gray-900 font-medium">{surat.asal_instansi}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg transition-colors">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-green-100 rounded-xl animate-bounce">
              <FileText className="h-4 w-4 text-black" />
            </div>
            <label className="text-sm font-semibold text-gray-700 uppercase ">Perihal</label>
          </div>
          <p className="text-gray-900 font-medium">{surat.perihal}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl animate-bounce">
                <Clock className="h-4 w-4 text-black" />
              </div>
              <label className="text-sm font-semibold text-gray-700 uppercase ">Status</label>
            </div>
            <span className={`inline-flex items-center px-4 py-2 text-sm font-bold rounded-full shadow-sm ${
              surat.status === 'pending' 
                ? 'bg-yellow-100 text-black' 
                : 'bg-green-100 text-black'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                surat.status === 'pending' ? 'bg-black' : 'bg-black'
              }`}></div>
              {surat.status === 'pending' ? 'Pending' : 'Diproses'}
            </span>
          </div>
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="space-y-4 pt-6 border-t-2 border-gradient-to-r from-blue-200 to-purple-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-indigo-100 rounded-xl animate-bounce">
                    <Calendar className="h-4 w-4 text-black" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 uppercase ">Tanggal Surat</label>
                </div>
                <p className="text-gray-900 text-sm font-medium">{formatDate(surat.created_at)}</p>
              </div>
              
              <div className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-rose-300 transition-colors">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-rose-100 rounded-lg animate-bounce">
                    <Calendar className="h-4 w-4 text-black" />
                  </div>
                  <label className="text-sm font-semibold text-gray-700 uppercase ">Diterima Tanggal</label>
                </div>
                <p className="text-gray-900 text-sm font-medium">{formatDate(surat.processed_at)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-cyan-300 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-cyan-100 rounded-xl animate-bounce">
                  <Building2 className="h-4 w-4 text-black" />
                </div>
                <label className="text-sm font-semibold text-gray-700 uppercase ">Tujuan Jabatan</label>
              </div>
              <p className="text-gray-900 text-sm font-medium">{surat.tujuan_jabatan}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-amber-300 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <FileText className="h-4 w-4 text-amber-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700 uppercase ">Sifat Surat</label>
              </div>
              <p className="text-gray-900 text-sm font-medium">{surat.sifat}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-violet-300 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-violet-100 rounded-lg">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700 uppercase ">Dengan hormat harap</label>
              </div>
              <p className="text-gray-900 text-sm font-medium">{surat.tindakan}</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-emerald-300 transition-colors">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700 uppercase ">Keterangan</label>
              </div>
              <p className="text-gray-900 text-sm font-medium">{surat.keterangan}</p>
            </div>
          </div>
        )}

        {/* Modern Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center space-x-3 w-full py-4 mt-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-200 group"
        >
          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
            {isExpanded ? 'Sembunyikan Detail' : 'Lihat Selengkapnya'}
          </span>
          <div className="p-1 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </div>
        </button>
      </div>
    </div>
  )
}

export default SuratInfo