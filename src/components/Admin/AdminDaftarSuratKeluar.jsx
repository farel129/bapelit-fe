import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { RefreshCcw, Trash2, Paperclip, Calendar, Clock, FileText, Eye, Download, User, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Ui/LoadingSpinner';

const AdminDaftarSuratKeluar = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSurat, setSelectedSurat] = useState(null);

  const fetchSuratKeluar = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/surat-keluar');
      setSuratList(response.data.data || []);
    } catch (err) {
      const errorMessage = 'Gagal memuat daftar surat keluar';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus surat ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      await api.delete(`/surat-keluar/${id}`);
      toast.success('Surat berhasil dihapus');
      fetchSuratKeluar();
    } catch (err) {
      const errorMessage = 'Gagal menghapus surat keluar';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuratKeluar();
  }, []);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Status badge (konsisten dengan style masuk)
  const getStatusBadge = (status) => {
    const styles = {
      'draft': 'bg-slate-100 text-gray-800 border border-slate-200',
      'terkirim': 'bg-green-50 text-green-800 border border-green-200',
      'dibatalkan': 'bg-red-50 text-red-800 border border-red-200'
    };
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {status === 'draft' ? 'Draft' : status === 'terkirim' ? 'Terkirim' : status === 'dibatalkan' ? 'Dibatalkan' : status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
       <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header Section — Gunakan warna utama sistem */}
      

      {/* Error State — Sesuai pola sistem */}
      {error && (
        <div className="mb-6 mx-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State — Sesuai pola sistem */}
      {suratList.length === 0 && !error && (
        <div className="text-center py-16 px-6">
          <FileText className="h-16 w-16 text-[#6b7280] mx-auto mb-4 opacity-70" />
          <p className="text-[#000000] text-lg font-semibold mb-1">Tidak ada surat keluar</p>
          <p className="text-[#6b7280] text-sm">Belum ada surat yang dikirimkan atau disimpan.</p>
        </div>
      )}

      {/* Main Grid — Semua card menggunakan palet sistem */}
      {suratList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 mb-12">
          {suratList.map((surat) => (
            <div
              key={surat.id}
              className="bg-white rounded-2xl border-2 border-[#e5e7eb] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="p-6">
                {/* Header Card — Gunakan ikon gradient utama sistem */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {/* Ikon utama: gradient pink-magenta (primary sistem) */}
                    <div className="p-2 bg-gradient-to-br from-[#f6339a] to-[#e02c88] rounded-xl shadow-md">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#000000] truncate max-w-[180px]">{surat.nama_surat}</h3>
                      <p className="text-xs text-[#6b7280] capitalize mt-1">
                        Ditujukan ke: {surat.ditujukan_ke || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(surat.status || 'draft')}
                    <button
                      onClick={() => handleDelete(surat.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200"
                      aria-label="Hapus surat"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center text-sm text-[#6b7280]">
                    <Calendar className="h-4 w-4 mr-2" />
                    Tanggal Surat: {formatDate(surat.tanggal_surat)}
                  </div>
                  <div className="flex items-center text-sm text-[#6b7280]">
                    <Clock className="h-4 w-4 mr-2" />
                    Dibuat: {formatDate(surat.created_at)}
                  </div>
                </div>

                {/* Keterangan */}
                {surat.keterangan && (
                  <div className="mb-5">
                    <div className="bg-white p-4 rounded-xl border border-[#e5e7eb] shadow-sm">
                      <p className="text-sm text-[#000000] leading-relaxed">
                        <span className="font-semibold text-[#6b7280]">Keterangan:</span> {surat.keterangan}
                      </p>
                    </div>
                  </div>
                )}

                {/* Lampiran */}
                {surat.lampiran_count > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-5 w-5 text-[#6b7280]" />
                        <span className="text-sm font-medium text-[#000000]">
                          {surat.lampiran_count} Lampiran
                        </span>
                      </div>

                      {surat.has_lampiran && (
                        <div className="flex items-center gap-2">
                          {surat.lampiran.slice(0, 2).map((file, index) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-500 hover:text-green-600 text-sm font-medium transition-colors underline flex items-center gap-1"
                              title={`Lihat lampiran ${index + 1}`}
                            >
                              <Download className="w-3 h-3" />
                              {index === 0 ? 'Lampiran' : ''}
                            </a>
                          ))}
                          {surat.lampiran.length > 2 && (
                            <span className="text-xs text-[#6b7280] font-medium">
                              +{surat.lampiran.length - 2} lainnya
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button - Detail */}
                <div className="mt-6">
                  <button
                    onClick={() => setSelectedSurat(surat)}
                    className="w-full bg-white text-[#000000] py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 border border-[#e5e7eb]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Detail Surat — 100% konsisten dengan AdminDaftarSuratMasuk */}
      {selectedSurat && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl h-[90vh] overflow-y-auto">
            {/* Background glassmorphism */}
            <div className="absolute inset-0 bg-white backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#e5e7eb]"></div>
            {/* Content */}
            <div className="relative h-full overflow-y-auto rounded-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white backdrop-blur-sm border-b border-[#e5e7eb] px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#f6339a] to-[#e02c88] rounded-xl shadow-md">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#000000]">Detail Surat Keluar</h3>
                      <p className="text-sm font-medium text-[#6b7280]">Informasi lengkap dokumen</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSurat(null)}
                    className="p-2 hover:bg-[#f9f9f9] rounded-xl transition-all duration-200 group border border-[#e5e7eb]"
                    aria-label="Tutup detail"
                  >
                    <Trash2 className="h-5 w-5 text-[#000000] group-hover:text-[#6b7280]" />
                  </button>
                </div>
              </div>

              {/* Content Body */}
              <div className="px-8 py-6">
                {/* Status Badge */}
                <div className="mb-8">
                  {getStatusBadge(selectedSurat.status || 'draft')}
                </div>

                {/* Main Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                        <FileText className="h-4 w-4 text-[#000000]" />
                        Nama Surat
                      </label>
                      <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                        <p className="text-[#000000]">{selectedSurat.nama_surat}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                        <User className="h-4 w-4 text-[#000000]" />
                        Ditujukan ke
                      </label>
                      <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                        <p className="text-[#000000] capitalize">{selectedSurat.ditujukan_ke || '-'}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                        <Calendar className="h-4 w-4 text-[#000000]" />
                        Tanggal Surat
                      </label>
                      <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                        <p className="text-[#000000]">{formatDate(selectedSurat.tanggal_surat)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                        <Clock className="h-4 w-4 text-[#000000]" />
                        Dibuat pada
                      </label>
                      <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                        <p className="text-[#000000]">{formatDate(selectedSurat.created_at)}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                        <User className="h-4 w-4 text-[#000000]" />
                        Dibuat oleh
                      </label>
                      <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                        <p className="text-[#000000] font-semibold">{selectedSurat.created_by?.name || '-'}</p>
                        <p className="text-sm text-[#6b7280]">{selectedSurat.created_by?.jabatan || '-'}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-[#000000]">
                        <FileText className="h-4 w-4 text-[#000000]" />
                        Nomor Surat
                      </label>
                      <div className="p-4 bg-[#f9f9f9] rounded-xl border-l-4 border-[#f6339a] border">
                        <p className={`${selectedSurat.nomor_surat ? 'text-[#000000]' : 'text-[#6b7280] italic'}`}>
                          {selectedSurat.nomor_surat || 'Belum ditetapkan'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                {selectedSurat.keterangan && (
                  <div className="mb-8">
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-[#000000]">
                      <FileText className="h-4 w-4 text-[#000000]" />
                      Keterangan
                    </label>
                    <div className="p-6 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]">
                      <p className="text-[#000000] leading-relaxed">{selectedSurat.keterangan}</p>
                    </div>
                  </div>
                )}

                {/* Lampiran */}
                {selectedSurat.lampiran_count > 0 && (
                  <div className="mb-8">
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3 text-[#000000]">
                      <Paperclip className="h-4 w-4 text-[#000000]" />
                      Lampiran ({selectedSurat.lampiran_count})
                    </label>
                    <div className="space-y-2">
                      {selectedSurat.lampiran.map((file, index) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-[#f9f9f9] rounded-xl border border-[#e5e7eb]"
                        >
                          <div className="flex items-center gap-3">
                            <Paperclip className="h-5 w-5 text-[#6b7280]" />
                            <span className="text-sm text-[#000000] font-medium">
                              {file.filename || `Lampiran ${index + 1}`}
                            </span>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-green-500 hover:text-green-600 text-sm font-medium transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Unduh
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Catatan Internal (jika ada) */}
                {selectedSurat.catatan_internal && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-[#f9f9f9]/50 to-[#ffffff]/50 rounded-xl border border-[#e5e7eb]">
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-[#000000]">
                      <MessageSquare className="h-5 w-5 text-[#6b7280]" />
                      Catatan Internal
                    </h4>
                    <p className="text-[#000000] leading-relaxed">{selectedSurat.catatan_internal}</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-[#e5e7eb] px-8 py-6">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedSurat(null)}
                    className="inline-flex items-center gap-2 bg-white hover:bg-[#f9f9f9] text-[#000000] px-6 py-3 rounded-xl font-semibold transition-all border border-[#e5e7eb] shadow-sm hover:shadow-md"
                  >
                    Tutup
                  </button>
                  {selectedSurat.has_lampiran && selectedSurat.lampiran.length > 0 && (
                    <button
                      onClick={() => {
                        const firstFile = selectedSurat.lampiran[0];
                        window.open(firstFile.url, '_blank');
                      }}
                      className="inline-flex text-sm items-center gap-2 bg-white text-green-500 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 border border-[#e5e7eb]"
                    >
                      <Download className="h-4 w-4" />
                      Unduh Lampiran Pertama
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDaftarSuratKeluar;