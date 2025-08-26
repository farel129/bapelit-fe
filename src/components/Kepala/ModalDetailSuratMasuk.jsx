import FileAttachments from "./FileAttachments";

const ModalDetailSuratMasuk = ({ surat, onClose }) => {
  if (!surat) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-[#EDE6E3] shadow-lg">
        <div className="flex justify-between items-center p-6 border-b border-[#EDE6E3] bg-white">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Detail Surat Masuk</h2>
            <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Nomor: {surat.nomor_surat || '-'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-colors border border-[#EDE6E3]"
          >
            <span className="text-2xl font-bold leading-none" style={{ color: '#6D4C41' }}>×</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              surat.status === 'sudah dibaca' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
            }`}>
              {surat.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Nomor Surat</label>
              <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
                <p className="font-semibold text-[#2E2A27]">{surat.nomor_surat || '-'}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Tanggal Surat</label>
              <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
                <p className="font-semibold text-[#2E2A27]">{surat.tanggal_surat || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Asal Instansi</label>
              <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
                <p className="font-semibold text-[#2E2A27]">{surat.asal_instansi || '-'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Tujuan Jabatan</label>
              <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
                <p className="font-semibold text-[#2E2A27] capitalize">{surat.tujuan_jabatan?.replace(/-/g, ' ') || '-'}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Keterangan</label>
            <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
              <p className="text-[#2E2A27] whitespace-pre-wrap">{surat.keterangan || '-'}</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3" style={{ color: '#6D4C41' }}>Lampiran</label>
            {surat.has_photos && surat.photos && surat.photos.length > 0 ? (
              <FileAttachments surat={surat} />
            ) : (
              <div className="p-6 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm text-center">
                <p className="text-[#6D4C41]">Tidak ada lampiran</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>Status Disposisi</label>
            <div className="p-4 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm">
              {surat.has_disposisi ? (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                  ✓ Disposisi Sudah Dibuat
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
                  ⏳ Belum Ada Disposisi
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center p-6 border-t border-[#EDE6E3] bg-white space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[#2E2A27] bg-white border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] font-semibold transition-all shadow-sm"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetailSuratMasuk;