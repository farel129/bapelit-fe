import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Calendar, FileText, CheckCircle, File as FileIcon, Search, Filter, Clock, Mail } from 'lucide-react';
import LoadingSpinner from '../Ui/LoadingSpinner';
import CreateDisposisiModal from './CreateDisposisiModal';
import StatCard from '../Ui/StatCard';
import isImageFile from '../../utils/isImageFile';
import ImageModal from '../Ui/ImageModal';

const SuratMasukList = () => {
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);


  // ✅ State untuk Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'belum dibaca', 'sudah dibaca'

  useEffect(() => {
    const fetchSuratMasuk = async () => {
      try {
        setLoading(true);
        const response = await api.get('/surat-masuk/kepala');
        setSuratMasuk(response.data.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Gagal mengambil data surat masuk');
        setLoading(false);
      }
    };

    fetchSuratMasuk();
  }, []);

  // ✅ Fungsi untuk menandai surat sebagai "sudah dibaca"
  const handleMarkAsRead = async (id) => {
    try {
      const response = await api.put(`/surat-masuk/kepala/${id}`);
      setSuratMasuk(prev =>
        prev.map(surat =>
          surat.id === id ? { ...surat, ...response.data.data } : surat
        )
      );
    } catch (err) {
      console.error('Gagal menandai surat sebagai dibaca:', err);
      alert('Gagal memperbarui status. Silakan coba lagi.');
    }
  };

  // ✅ Fungsi buka modal disposisi
  const handleBuatDisposisi = (surat) => {
    setSelectedSurat(surat);
    setShowModal(true);
  };

  const handleDisposisiSuccess = () => {
    setSuratMasuk(prev =>
      prev.map(surat =>
        surat.id === selectedSurat.id
          ? { ...surat, has_disposisi: true }
          : surat
      )
    );

    setShowModal(false);
    setSelectedSurat(null);
  };

  const totalSurat = suratMasuk.length;
  const belumDibaca = suratMasuk.filter(surat => surat.status === 'belum dibaca').length;
  const sudahDibaca = suratMasuk.filter(surat => surat.status === 'sudah dibaca').length;

  // ✅ Logika Filter & Search
  const filteredSuratMasuk = suratMasuk.filter(surat => {
    const matchesSearch =
      surat.asal_instansi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (surat.nomor_surat && surat.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (surat.nomor_agenda && surat.nomor_agenda.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === 'all' ||
      surat.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 font-medium">Server Down atau Gagal Memuat Data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          <StatCard
            title="Total Surat"
            count={totalSurat}
            icon={Mail}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-white"
            iconColor="text-teal-400"
            borderColor="border-slate-200"
          />
          <StatCard
            title="Belum Dibaca"
            count={belumDibaca}
            icon={Clock}
            bgColor="bg-white"
            textColor="text-black"
            iconBg="bg-gray-500"
            borderColor="border-slate-200"
            iconColor="text-white"
          />
          <StatCard
            title="Sudah Dibaca"
            count={sudahDibaca}
            icon={CheckCircle}
            bgColor="bg-black"
            textColor="text-white"
            iconBg="bg-white"
            iconColor="text-black"
            borderColor="border-slate-200"
          />
        </div>

        {/* ✅ Search & Filter Bar */}
        <div className="mb-2 bg-white p-5 rounded-2xl shadow-lg">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan instansi, nomor surat, atau agenda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              >
                <option value="all">Semua Status</option>
                <option value="belum dibaca">Belum Dibaca</option>
                <option value="sudah dibaca">Sudah Dibaca</option>
              </select>
            </div>

          </div>
        </div>

        {filteredSuratMasuk.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-2">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak Ada Surat yang Cocok</h3>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
            {filteredSuratMasuk.map((surat) => {
              const isImage = (filename) => {
                return filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
              };

              return (
                <article
                  key={surat.id}
                  className="group relative bg-white space-y-2 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-slate-200"
                >
                  {/* Header */}
                  <div className="border-b border-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
                          {surat.asal_instansi}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          <span className="font-medium text-gray-700">Nomor Surat:</span> {surat.nomor_surat || '-'} •{' '}
                          <span className="font-medium text-gray-700">Nomor Agenda:</span> {surat.nomor_agenda || '-'}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-800 rounded-full text-sm font-medium shadow-sm">
                        {new Date(surat.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mt-0.5">
                          <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tgl Surat</p>
                          <p className="text-gray-800">{surat.tanggal_surat || '-'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-0.5">
                          <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">Tgl Diterima</p>
                          <p className="text-gray-800">{surat.diterima_tanggal}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div>
                          <p className="text-gray-500 font-medium">Status</p>
                          <p
                            className={`px-2 py-1 rounded-full text-sm font-medium ${surat.status === 'sudah dibaca'
                              ? 'bg-gray-100 text-gray-800'
                              : surat.status === 'belum dibaca'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {surat.status || 'Tidak diketahui'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Section */}
                  {surat.photos && surat.photos.length > 0 && (
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Lampiran: ({surat.photos.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {surat.photos.map((photo) => {
                          const isImage = isImageFile(photo);
                          return (
                            <div
                              key={photo.id}
                              onClick={() => {
                                if (isImage) {
                                  setSelectedImage(photo.url);
                                } else {
                                  window.open(photo.url, '_blank', 'noopener,noreferrer');
                                }
                              }}
                              className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                            >
                              {isImage ? (
                                <img
                                  src={photo.url}
                                  alt={photo.filename}
                                  className="w-20 h-20 object-cover group-hover:brightness-110 transition-transform duration-500 rounded-lg shadow-lg"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                                  }}
                                />
                              ) : (
                                <div className="text-[#D9534F] flex flex-col items-center justify-center w-20 h-20 bg-gray-100 rounded-lg">
                                  <FileText className="w-8 h-8" />
                                  <p className="text-xs font-bold mt-1 text-center break-words">
                                    {photo.filename.split('.').pop()?.toUpperCase() || 'FILE'}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Keterangan */}
                  <div className="border-t border-gray-50/50">
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      Keterangan:
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      {surat.keterangan ? (
                        surat.keterangan
                      ) : (
                        <span className="text-gray-400 italic">Tidak ada keterangan tambahan.</span>
                      )}
                    </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="space-y-2">
                    {surat.status === 'belum dibaca' && (
                      <button
                        onClick={() => handleMarkAsRead(surat.id)}
                        className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-white border border-teal-400 hover:-translate-y-0.5 cursor-pointer text-teal-400 rounded-full text-sm font-medium shadow transition-colors duration-200"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Tandai Sudah Dibaca
                      </button>
                    )}

                    {surat.has_disposisi ? (
                      <div className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-gray-100 text-gray-600 rounded-full text-sm font-medium cursor-not-allowed">
                        <FileIcon className="w-4 h-4" />
                        Disposisi sudah dibuat
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuatDisposisi(surat)}
                        className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-white border border-black hover:-translate-y-0.5 cursor-pointer text-black rounded-full text-sm font-medium shadow transition-colors duration-200"
                      >
                        <FileIcon className="w-4 h-4" />
                        Buat Disposisi
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* ✅ Render Modal jika showModal true */}
      {showModal && selectedSurat && (
        <CreateDisposisiModal
          surat={selectedSurat}
          onClose={() => setShowModal(false)}
          onSuccess={handleDisposisiSuccess}
        />
      )}

      <ImageModal
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  );
};

export default SuratMasukList;