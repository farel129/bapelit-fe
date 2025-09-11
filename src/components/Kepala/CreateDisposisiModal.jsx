import { useState } from "react";
import { api } from "../../utils/api";
import { File } from "lucide-react";
import toast from 'react-hot-toast';

const CreateDisposisiModal = ({ surat, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    sifat: '',
    perihal: '',
    disposisi_kepada_jabatan: '',
    dengan_hormat_harap: '',
    catatan: ''
  });
  const [loading, setLoading] = useState(false);

  const sifatOptions = ['Sangat Segera', 'Segera', 'Rahasia'];
  const jabatanOptions = [
    'Sekretaris',
    'Kasubag Umum dan Kepegawaian',
    'Kasubag Keuangan',
    'Kabid Pendanaan, Pengendalian, dan Evaluasi',
    'Kabid Pemerintahan dan Pembangunan Manusia',
    'Kabid Perekonomian, Infrastruktur, dan Kewilayahan',
    'Kabid Penelitian dan Pengembangan'
  ];
  const instruksiOptions = [
    'Tanggapan dan Saran',
    'Wakili / Hadir / Terima',
    'Mendampingi Saya',
    'Untuk Ditindaklanjuti',
    'Pelajari / Telaah / Sarannya',
    'Untuk Dikaji Sesuai dengan Ketentuan',
    'Untuk Dibantu / Dipertimbangkan / Sesuai dengan Ketentuan',
    'Selesaikan / Proses Sesuai Ketentuan',
    'Monitor Realisasinya / Perkembangannya',
    'Siapkan Pointers / Sambutan / Bahan',
    'Menghadap / Informasinya',
    'Membaca / File / Referensi',
    'Agendakan / Jadwalkan / Koordinasikan'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.sifat || !formData.perihal || !formData.disposisi_kepada_jabatan || !formData.dengan_hormat_harap) {
      toast.error('Semua field harus diisi!');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/disposisi/${surat.id}`, formData);
      toast.success('Disposisi berhasil dibuat!');
      onSuccess();
    } catch (error) {
      console.error('Error creating disposisi:', error);
      toast.error('Gagal membuat disposisi: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#EDE6E3] shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
                <File className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Buat Lembar Disposisi</h3>
                <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Form pembuatan disposisi surat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#FDFCFB] rounded-xl transition-colors border border-[#EDE6E3]"
            >
              <span className="text-2xl font-bold leading-none" style={{ color: '#6D4C41' }}>×</span>
            </button>
          </div>

          <div className="bg-[#FDFCFB] p-4 rounded-xl mb-6 border border-[#EDE6E3] shadow-sm">
            <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#6D4C41' }}>
              <span className="text-lg">📧</span> Informasi Surat
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold" style={{ color: '#6D4C41' }}>Nomor:</span>
                <span className="ml-2 font-medium text-[#2E2A27]">{surat.nomor_surat || '-'}</span>
              </div>
              <div>
                <span className="font-semibold" style={{ color: '#6D4C41' }}>Tanggal:</span>
                <span className="ml-2 font-medium text-[#2E2A27]">{surat.tanggal_surat || '-'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold" style={{ color: '#6D4C41' }}>Dari:</span>
                <span className="ml-2 font-medium text-[#2E2A27]">{surat.asal_instansi || '-'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Sifat <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.sifat}
                onChange={(e) => setFormData({ ...formData, sifat: e.target.value })}
                className="w-full bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] shadow-sm"
                required
              >
                <option value="" className="text-[#6D4C41]">-- Pilih Sifat --</option>
                {sifatOptions.map(option => (
                  <option key={option} value={option} className="text-[#2E2A27]">{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Perihal <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.perihal}
                onChange={(e) => setFormData({ ...formData, perihal: e.target.value })}
                className="w-full bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] placeholder-[#6D4C41] shadow-sm"
                rows={3}
                placeholder="Masukkan perihal disposisi..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Diteruskan Kepada <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.disposisi_kepada_jabatan}
                onChange={(e) => setFormData({ ...formData, disposisi_kepada_jabatan: e.target.value })}
                className="w-full bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] shadow-sm"
                required
              >
                <option value="" className="text-[#6D4C41]">-- Pilih Jabatan --</option>
                {jabatanOptions.map(option => (
                  <option key={option} value={option} className="text-[#2E2A27]">{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Dengan Hormat Harap <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.dengan_hormat_harap}
                onChange={(e) => setFormData({ ...formData, dengan_hormat_harap: e.target.value })}
                className="w-full bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] shadow-sm"
                required
              >
                <option value="" className="text-[#6D4C41]">-- Pilih Instruksi --</option>
                {instruksiOptions.map(option => (
                  <option key={option} value={option} className="text-[#2E2A27]">{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Catatan <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full bg-white border border-[#EDE6E3] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] text-[#2E2A27] placeholder-[#6D4C41] shadow-sm"
                rows={3}
                placeholder="Masukkan catatan disposisi..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-[#EDE6E3]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-[#2E2A27] border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] font-semibold transition-all shadow-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md border border-[#EDE6E3] flex items-center gap-x-2 ${
                  loading
                    ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white hover:from-[#6D4C41] hover:to-[#2E2A27] hover:-translate-y-0.5 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <File className="w-4 h-4" /> Simpan Disposisi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateDisposisiModal;