import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, User, Filter, Search, X, ChevronRight, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

const JadwalAcara = () => {
    const [jadwalList, setJadwalList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedLocations, setExpandedLocations] = useState({});

    // State filter
    const [filter, setFilter] = useState({
        status: '',
        kategori: '',
        bulan: '',
        tahun: new Date().getFullYear(),
    });

    // State pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10; // Sesuai backend

    // Fetch jadwal acara berdasarkan filter + pagination
    const fetchJadwal = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.kategori) params.append('kategori', filter.kategori);
            if (filter.bulan) params.append('bulan', filter.bulan);
            params.append('tahun', filter.tahun);
            params.append('page', currentPage);  // ← Pagination
            params.append('limit', limit);       // ← Pagination

            const response = await api.get(`/jadwal-acara?${params}`);
            setJadwalList(response.data?.data || []);

            const pagination = response.data?.pagination || {};
            setTotalCount(pagination.total || 0);
            setTotalPages(pagination.total ? Math.ceil(pagination.total / limit) : 1);
        } catch (error) {
            console.error('Error fetching data:', error);
            setJadwalList([]);
            setTotalPages(1);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // Fetch ulang saat filter atau halaman berubah
    useEffect(() => {
        fetchJadwal();
    }, [filter, currentPage]);

    // Reset semua filter
    const resetFilters = () => {
        setFilter({
            status: '',
            kategori: '',
            bulan: '',
            tahun: new Date().getFullYear(),
        });
        setCurrentPage(1); // Reset ke halaman 1
    };

    // Status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            aktif: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm',
            selesai: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm',
            dibatalkan: 'bg-gradient-to-r from-rose-50 to-rose-100 text-rose-700 border border-rose-200 shadow-sm',
            ditunda: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200 shadow-sm',
        };

        const labelMap = {
            aktif: 'Aktif',
            selesai: 'Selesai',
            dibatalkan: 'Dibatalkan',
            ditunda: 'Ditunda',
        };

        const className = styles[status] || 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200 shadow-sm';
        const label = labelMap[status] || status;

        return (
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${className} backdrop-blur-sm`}>
                {label}
            </span>
        );
    };

    // Priority styling
    const getPriorityStyle = (priority) => {
        const styles = {
            'sangat penting': 'bg-red-400 text-white',
            'penting': 'bg-yellow-400 text-white',
            'biasa': 'bg-neutral-400 text-white',
        };
        return styles[priority] || 'bg-gradient-to-r from-slate-400 to-slate-500 text-white';
    };

    // Format waktu HH:mm:ss → HH:mm
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.split(':').slice(0, 2).join(':');
    };

    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-4 mb-2">
                <div className="flex items-center gap-2 mb-3">
                    <div className="relative">
                        <div className="p-3 bg-white rounded-xl shadow-lg">
                            <Calendar className="h-6 w-6 text-teal-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Jadwal Acara
                        </h1>
                        <p className="text-gray-600 text-sm">Jadwal acara kantor yang dibuat admin</p>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl border border-gray-200/50 backdrop-blur-sm">
                    {/* Status */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Status Acara</label>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                        >
                            <option value="">Semua Status</option>
                            <option value="aktif">Aktif</option>
                            <option value="selesai">Selesai</option>
                            <option value="dibatalkan">Dibatalkan</option>
                            <option value="ditunda">Ditunda</option>
                        </select>
                    </div>

                    {/* Bulan */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Bulan</label>
                        <select
                            value={filter.bulan}
                            onChange={(e) => setFilter({ ...filter, bulan: e.target.value })}
                            className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                        >
                            <option value="">Semua Bulan</option>
                            <option value="1">Januari</option>
                            <option value="2">Februari</option>
                            <option value="3">Maret</option>
                            <option value="4">April</option>
                            <option value="5">Mei</option>
                            <option value="6">Juni</option>
                            <option value="7">Juli</option>
                            <option value="8">Agustus</option>
                            <option value="9">September</option>
                            <option value="10">Oktober</option>
                            <option value="11">November</option>
                            <option value="12">Desember</option>
                        </select>
                    </div>

                    {/* Tahun */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Tahun</label>
                        <input
                            type="number"
                            value={filter.tahun}
                            onChange={(e) => setFilter({ ...filter, tahun: parseInt(e.target.value) || '' })}
                            min="2020"
                            max="2030"
                            className="w-full px-4 py-3 bg-white/90 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
                        />
                    </div>
                </div>

                {/* Reset Filter Button */}
                {(filter.status || filter.kategori || filter.bulan || filter.tahun !== new Date().getFullYear()) && (
                    <div className="mt-4">
                        <button
                            onClick={resetFilters}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 px-4 py-2.5 rounded-xl border border-teal-200 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                            <X className="h-4 w-4" />
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Jadwal List */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {[...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden animate-pulse"
                        >
                            <div className="p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4"></div>
                                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                                    </div>
                                </div>
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md w-full mb-3"></div>
                                ))}
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-20"></div>
                                        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-16"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {jadwalList.length === 0 ? (
                        <div className="text-center py-20 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl">
                            <div className="relative inline-block mb-2">
                                <Calendar className="h-20 w-20 text-gray-300 mx-auto" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"></div>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada jadwal acara</h3>
                            <p className="text-gray-600 max-w-md mx-auto">
                                {filter.status || filter.kategori || filter.bulan || filter.tahun !== new Date().getFullYear()
                                    ? "Tidak ada data yang sesuai dengan filter yang dipilih."
                                    : "Tidak ada data yang tersedia untuk ditampilkan."}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
                                {jadwalList.map((jadwal) => (
                                    <div
                                        key={jadwal.id}
                                        className="group bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2 cursor-pointer"
                                    >
                                        <div className="p-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <div className="p-3 bg-white rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                                            <Calendar className="h-4 w-4 text-teal-400" />
                                                        </div>
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-teal-700 transition-colors duration-200">
                                                            {jadwal.nama_acara}
                                                        </h3>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(jadwal.status)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metadata */}
                                            <div className="space-y-2 mb-2">
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50/80 rounded-lg px-3 py-2">
                                                    <Calendar className="h-4 w-4 mr-3 text-teal-500 flex-shrink-0" />
                                                    <span className="font-medium">
                                                        {jadwal.tanggal_mulai}
                                                        {jadwal.tanggal_selesai && jadwal.tanggal_selesai !== jadwal.tanggal_mulai &&
                                                            ` - ${jadwal.tanggal_selesai}`}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50/80 rounded-lg px-3 py-2">
                                                    <Clock className="h-4 w-4 mr-3 text-orange-500 flex-shrink-0" />
                                                    <span className="font-medium">
                                                        {formatTime(jadwal.waktu_mulai)}
                                                        {jadwal.waktu_selesai && ` - ${formatTime(jadwal.waktu_selesai)}`}
                                                    </span>
                                                </div>

                                                {/* Lokasi Expandable */}
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-start justify-between bg-gray-50/80 rounded-lg px-3 py-2">
                                                        <div className="flex items-start gap-3 flex-1">
                                                            <MapPin className="h-4 w-4 mt-1 text-red-500 flex-shrink-0" />
                                                            <span className={`font-medium text-sm text-gray-600 transition-all duration-200 ${expandedLocations[jadwal.id]
                                                                    ? 'whitespace-normal'
                                                                    : 'line-clamp-1'
                                                                }`}>
                                                                {jadwal.lokasi}
                                                            </span>
                                                        </div>
                                                        {jadwal.lokasi && jadwal.lokasi.length > 50 && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedLocations(prev => ({
                                                                        ...prev,
                                                                        [jadwal.id]: !prev[jadwal.id]
                                                                    }));
                                                                }}
                                                                className="text-gray-400 hover:text-teal-500 transition-colors duration-200 flex-shrink-0 ml-2"
                                                                aria-label={expandedLocations[jadwal.id] ? "Sembunyikan alamat" : "Lihat alamat lengkap"}
                                                            >
                                                                <ChevronRight
                                                                    className={`h-4 w-4 transition-transform duration-300 ${expandedLocations[jadwal.id] ? 'rotate-90' : 'rotate-0'
                                                                        }`}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center text-sm text-gray-600 bg-gray-50/80 rounded-lg px-3 py-2">
                                                    <User className="h-4 w-4 mr-3 text-blue-500 flex-shrink-0" />
                                                    <span className="font-medium">{jadwal.pic_nama}</span>
                                                </div>
                                            </div>

                                            {/* Deskripsi */}
                                            {jadwal.deskripsi && (
                                                <div className="mb-2">
                                                    <p className="text-sm text-gray-600 bg-gradient-to-r from-slate-50/80 to-gray-50/80 p-4 rounded-xl border border-gray-100 line-clamp-2 leading-relaxed">
                                                        {jadwal.deskripsi}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Priority Badge */}
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getPriorityStyle(jadwal.prioritas)} shadow-md`}>
                                                    {jadwal.prioritas?.toUpperCase()}
                                                </span>
                                            </div>

                                            {/* Google Maps Embed */}
                                            {jadwal.lokasi && (
                                                <div className="mt-5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-red-500" />
                                                            Lokasi Acara
                                                        </p>
                                                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-teal-500 transition-colors duration-200" />
                                                    </div>
                                                    <div className="relative h-44 w-full border border-gray-200/50 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            frameBorder="0"
                                                            loading="lazy"
                                                            style={{ border: 0 }}
                                                            src={`https://www.google.com/maps?q=${encodeURIComponent(jadwal.lokasi)}&output=embed`}
                                                            allowFullScreen
                                                            title={`Lokasi ${jadwal.nama_acara}`}
                                                            aria-label={`Lokasi acara ${jadwal.nama_acara}`}
                                                            className="w-full h-full transition-all duration-300 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ✅ PAGINATION CONTROLS */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 p-4 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-xl">
                                    <div className="text-sm text-gray-600 font-medium">
                                        Menampilkan halaman <span className="font-bold text-teal-600">{currentPage}</span> dari <span className="font-bold text-teal-600">{totalPages}</span> ({totalCount} total acara)
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setCurrentPage(prev => Math.max(prev - 1, 1));
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                                        >
                                            <ChevronRight className="h-4 w-4 rotate-180" />
                                            Sebelumnya
                                        </button>

                                        <button
                                            onClick={() => {
                                                setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                                        >
                                            Selanjutnya
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default JadwalAcara;