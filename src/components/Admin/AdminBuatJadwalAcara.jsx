import { Calendar, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import Skeleton from '../Ui/Skeleton';

// ✅ Helper: cek apakah waktu mulai di masa lalu
const isPastDateTime = (tanggal, waktu) => {
  if (!tanggal || !waktu) return false;
  const inputDateTime = new Date(`${tanggal}T${waktu}:00+07:00`);
  const now = new Date();
  return inputDateTime < now;
};

// ✅ Helper: cek apakah waktu selesai <= waktu mulai
const isInvalidEndTime = (tanggalMulai, waktuMulai, tanggalSelesai, waktuSelesai) => {
  if (!tanggalMulai || !waktuMulai || !tanggalSelesai || !waktuSelesai) return false;
  const start = new Date(`${tanggalMulai}T${waktuMulai}:00+07:00`);
  const end = new Date(`${tanggalSelesai}T${waktuSelesai}:00+07:00`);
  return end <= start;
};

const AdminBuatJadwalAcara = ({
  showForm,
  editingId,
  resetForm,
  handleSubmit,
  formData,
  setFormData,
  searchLocation,
  showRecommendations,
  recommendations,
  selectRecommendation,
  loading,
}) => {
  const waktuMulaiRef = useRef(null);
  const waktuSelesaiRef = useRef(null);

  // Auto-focus jika error waktu mulai
  useEffect(() => {
    if (formData.tanggal_mulai && formData.waktu_mulai && isPastDateTime(formData.tanggal_mulai, formData.waktu_mulai)) {
      waktuMulaiRef.current?.focus();
    }
  }, [formData.tanggal_mulai, formData.waktu_mulai]);

  // Auto-focus jika error waktu selesai
  useEffect(() => {
    if (isInvalidEndTime(formData.tanggal_mulai, formData.waktu_mulai, formData.tanggal_selesai, formData.waktu_selesai)) {
      waktuSelesaiRef.current?.focus();
    }
  }, [formData.tanggal_selesai, formData.waktu_selesai]);

  // ✅ State validasi
  const hasPastTimeError = formData.tanggal_mulai && formData.waktu_mulai && isPastDateTime(formData.tanggal_mulai, formData.waktu_mulai);
  const hasInvalidEndTimeError = isInvalidEndTime(formData.tanggal_mulai, formData.waktu_mulai, formData.tanggal_selesai, formData.waktu_selesai);
  const hasAnyError = hasPastTimeError || hasInvalidEndTimeError;

  return (
    <div>
      {showForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl h-[90vh] overflow-y-auto">
            {/* Background glassmorphism */}
            <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#e5e7eb]"></div>
            {/* Content */}
            <div className="relative h-full overflow-y-auto rounded-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-[#e5e7eb] px-8 py-6 z-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white rounded-xl shadow-lg">
                      <Calendar className="h-6 w-6 text-teal-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#000000]">
                        {editingId ? 'Edit Jadwal Acara' : 'Tambah Jadwal Acara'}
                      </h2>
                      <p className="text-sm font-medium text-[#6b7280]">Isi detail jadwal acara dengan lengkap</p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-[#e5e7eb]"
                    aria-label="Tutup form"
                  >
                    <X className="h-5 w-5 text-[#000000] group-hover:text-[#6b7280]" />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="px-8 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Nama Acara *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nama_acara}
                        onChange={(e) => setFormData({ ...formData, nama_acara: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                        placeholder="Contoh: Rapat Koordinasi Bulanan"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        value={formData.deskripsi}
                        onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                        placeholder="Tulis deskripsi singkat tentang acara ini..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Tanggal Mulai *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.tanggal_mulai}
                        onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Tanggal Selesai
                      </label>
                      <input
                        type="date"
                        value={formData.tanggal_selesai}
                        onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Waktu Mulai *
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.waktu_mulai}
                        onChange={(e) => setFormData({ ...formData, waktu_mulai: e.target.value })}
                        ref={waktuMulaiRef}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                          hasPastTimeError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-[#e5e7eb] focus:ring-teal-400'
                        } focus:border-transparent text-sm text-[#000000]`}
                      />
                      {hasPastTimeError && (
                        <p className="text-red-600 text-xs mt-1 flex items-center">
                          <X className="w-3 h-3 mr-1" />
                          Waktu mulai tidak boleh di masa lalu
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Waktu Selesai
                      </label>
                      <input
                        type="time"
                        value={formData.waktu_selesai}
                        onChange={(e) => setFormData({ ...formData, waktu_selesai: e.target.value })}
                        ref={waktuSelesaiRef}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:ring-2 ${
                          hasInvalidEndTimeError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-[#e5e7eb] focus:ring-teal-400'
                        } focus:border-transparent text-sm text-[#000000]`}
                      />
                      {hasInvalidEndTimeError && (
                        <p className="text-red-600 text-xs mt-1 flex items-center">
                          <X className="w-3 h-3 mr-1" />
                          Waktu selesai harus setelah waktu mulai
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Lokasi *
                      </label>
                      <div className="relative location-input-container">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            required
                            value={formData.lokasi}
                            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                            className="flex-1 px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                            placeholder="Masukkan alamat atau nama lokasi"
                          />
                          <button
                            type="button"
                            onClick={() => searchLocation(formData.lokasi)}
                            disabled={loading || !formData.lokasi.trim()}
                            className="px-5 py-3 bg-white border border-[#e5e7eb] rounded-xl text-sm font-medium text-[#000000] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Mencari...' : 'Cari'}
                          </button>
                        </div>

                        {/* Skeleton Dropdown Rekomendasi */}
                        {showRecommendations && recommendations.length === 0 && loading && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="px-4 py-3 border-b border-[#e5e7eb] last:border-b-0">
                                <Skeleton width="100%" height="16px" radius="md" className="mb-1" />
                                <Skeleton width="80%" height="14px" radius="md" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Dropdown Rekomendasi Asli */}
                        {showRecommendations && recommendations.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-[#e5e7eb] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {recommendations.map((rec, index) => (
                              <div
                                key={index}
                                onClick={() => selectRecommendation(rec)}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-[#e5e7eb] last:border-b-0"
                              >
                                <div className="font-medium text-[#000000]">{rec.title}</div>
                                {rec.address && (
                                  <div className="text-sm text-[#6b7280] mt-1">{rec.address}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Peta Lokasi
                      </label>
                      <div className="h-64 w-full border border-[#e5e7eb] rounded-xl overflow-hidden">
                        {loading ? (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Skeleton width="100%" height="100%" radius="xl" />
                          </div>
                        ) : formData.lokasi ? (
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps?q=${encodeURIComponent(formData.lokasi)}&output=embed`}
                            allowFullScreen
                            title="Lokasi Acara"
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[#6b7280]">
                            Masukkan lokasi dan klik "Cari" untuk melihat peta
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#6b7280] mt-1">
                        {formData.serp_data ?
                          "Lokasi ditemukan melalui pencarian otomatis" :
                          "Menampilkan peta berdasarkan input manual"
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        PIC Nama *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.pic_nama}
                        onChange={(e) => setFormData({ ...formData, pic_nama: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                        placeholder="Nama petugas penanggung jawab"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        PIC Kontak
                      </label>
                      <input
                        type="text"
                        value={formData.pic_kontak}
                        onChange={(e) => setFormData({ ...formData, pic_kontak: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                        placeholder="Nomor HP / Email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Kategori
                      </label>
                      <select
                        value={formData.kategori}
                        onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                      >
                        <option value="umum">Umum</option>
                        <option value="rapat">Rapat</option>
                        <option value="pelatihan">Pelatihan</option>
                        <option value="seminar">Seminar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Prioritas
                      </label>
                      <select
                        value={formData.prioritas}
                        onChange={(e) => setFormData({ ...formData, prioritas: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                      >
                        <option value="biasa">Biasa</option>
                        <option value="penting">Penting</option>
                        <option value="sangat penting">Sangat Penting</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Target Peserta
                      </label>
                      <input
                        type="number"
                        value={formData.peserta_target}
                        onChange={(e) => setFormData({ ...formData, peserta_target: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                        min="1"
                        placeholder="Jumlah peserta yang diharapkan"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#000000] mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm text-[#000000]"
                      >
                        <option value="aktif">Aktif</option>
                        <option value="selesai">Selesai</option>
                        <option value="dibatalkan">Dibatalkan</option>
                        <option value="ditunda">Ditunda</option>
                      </select>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex justify-end gap-4 pt-6 border-t border-[#e5e7eb]">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading || hasAnyError}
                      className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                        loading || hasAnyError
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-black hover:opacity-90 text-white'
                      }`}
                    >
                      {loading ? 'Menyimpan...' : editingId ? 'Perbarui' : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuatJadwalAcara;