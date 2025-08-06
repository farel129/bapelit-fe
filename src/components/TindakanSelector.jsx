import { Clipboard, X } from 'lucide-react'

const TindakanSelector = ({ selectedTindakan, onTindakanChange, onRemoveTindakan }) => {
  const tindakanOptions = [
    "Tanggapan dan Saran",
    "Wakili / Hadir / Terima",
    "Mendampingi Saya",
    "Untuk Ditindaklanjuti",
    "Pelajari / Telaa'h / Sarannya",
    "Untuk Dikaji Sesuai dengan Ketentuan",
    "Untuk Dibantu / Dipertimbangkan / Sesuai dengan Ketentuan",
    "Selesaikan / Proses Sesuai Ketentuan",
    "Monitor Realisasinya / Perkembangannya",
    "Siapkan Pointers / Sambutan / Bahan",
    "Menghadap / Informasinya",
    "Membaca / File / Referensi",
    "Agendakan / Jadwalkan / Koordinasikan"
  ]

  return (
    <div className="space-y-4">
      <label className="flex items-center text-sm font-semibold text-slate-700">
        <Clipboard className="w-4 h-4 mr-2 text-blue-600" />
        Tindakan (Pilih satu atau lebih)
      </label>
      
      {/* Selected Actions Display */}
      {selectedTindakan.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-blue-50/50 rounded-xl border border-blue-200">
          {selectedTindakan.map((tindakan, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium shadow-sm"
            >
              {tindakan}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveTindakan(tindakan, e)
                }}
                className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 group"
              >
                <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Action Options */}
      <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="max-h-64 overflow-y-auto">
          {tindakanOptions.map((option, index) => (
            <div
              key={index}
              className={`flex items-center p-4 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer border-b border-slate-100 last:border-b-0 group ${
                selectedTindakan.includes(option) ? 'bg-blue-50/70' : ''
              }`}
              onClick={(e) => {
                if (e.target.type !== 'checkbox') {
                  onTindakanChange(option, e)
                }
              }}
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={selectedTindakan.includes(option)}
                  onChange={(e) => onTindakanChange(option, e)}
                  className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded-md focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 transition-all duration-200"
                />
                {selectedTindakan.includes(option) && (
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <label className="ml-4 text-sm text-slate-700 font-medium cursor-pointer select-none flex-1 group-hover:text-blue-700 transition-colors duration-200">
                {option}
              </label>
              <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TindakanSelector