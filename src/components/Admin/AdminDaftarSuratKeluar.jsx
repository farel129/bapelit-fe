import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { RefreshCcw, Trash2, Paperclip, Calendar, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDaftarSuratKeluar = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSuratKeluar = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/admin/surat-keluar/all');
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
    if (!window.confirm('Apakah Anda yakin ingin menghapus surat ini?')) return;
    
    try {
      await api.delete(`/api/admin/surat-keluar/${id}`);
      toast.success('Surat berhasil dihapus');
      fetchSuratKeluar(); // Refresh data
    } catch (err) {
      const errorMessage = 'Gagal menghapus surat keluar';
      toast.error(errorMessage);
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuratKeluar();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
        <span className="ml-2 text-[#6D4C41]">Memuat surat keluar...</span>
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
          <div>
            <h1 className="text-xl font-bold" style={{color: '#2E2A27'}}>Daftar Surat Keluar</h1>
            <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Kelola surat keluar dengan elegan</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-white text-[#2E2A27] text-sm font-semibold px-3 py-1.5 rounded-full border border-[#EDE6E3] shadow-sm">
            Total: {suratList.length}
          </span>
          <button
            onClick={fetchSuratKeluar}
            className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
          >
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-600" />
            <p className="font-semibold">{error}</p>
          </div>
        </div>
      )}

      {suratList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
          <FileText className="h-12 w-12 text-[#6D4C41] mx-auto mb-4" />
          <p className="text-[#2E2A27] text-lg font-semibold">Tidak ada surat keluar</p>
          <p className="text-[#6D4C41] mt-1">Belum ada surat keluar yang dibuat</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {suratList.map((surat) => (
            <div key={surat.id} className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-[#2E2A27]">{surat.nama_surat}</h3>
                    <p className="text-sm font-medium text-[#6D4C41] mt-1">
                      Ditujukan ke: {surat.ditujukan_ke}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(surat.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 border border-[#EDE6E3]"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm font-medium text-[#6D4C41]">
                    <Calendar className="h-4 w-4 mr-2 text-[#6D4C41]" />
                    Tanggal Surat: {new Date(surat.tanggal_surat).toLocaleDateString('id-ID')}
                  </div>
                  
                  <div className="flex items-center text-sm font-medium text-[#6D4C41]">
                    <Clock className="h-4 w-4 mr-2 text-[#6D4C41]" />
                    Dibuat: {new Date(surat.created_at).toLocaleDateString('id-ID')}
                  </div>
                </div>

                {surat.keterangan && (
                  <div className="mt-4">
                    <div className="bg-[#FDFCFB] p-3 rounded-xl border border-[#EDE6E3]">
                      <p className="text-sm text-[#2E2A27]">
                        <span className="font-semibold text-[#6D4C41]">Keterangan:</span> {surat.keterangan}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-[#EDE6E3]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Paperclip className="h-5 w-5 text-[#6D4C41] mr-2" />
                      <span className="text-sm font-semibold text-[#2E2A27]">
                        {surat.lampiran_count} Lampiran
                      </span>
                    </div>
                    
                    {surat.has_lampiran && (
                      <div className="flex space-x-2">
                        {surat.lampiran.slice(0, 3).map((file, index) => (
                          <a
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#4CAF50] hover:text-[#2E7D32] text-sm font-medium transition-colors underline"
                          >
                            Lampiran {index + 1}
                          </a>
                        ))}
                        {surat.lampiran.length > 3 && (
                          <span className="text-sm text-[#6D4C41] font-medium">
                            +{surat.lampiran.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDaftarSuratKeluar;