import { Calendar, ChevronLeft, ChevronRight, Edit, Eye, Loader2, MapPin, Search, Trash2, Users, X } from 'lucide-react';
import React from 'react';
import LoadingSpinner from '../Ui/LoadingSpinner';

const BukuTamuView = ({
  view,
  eventSearch,
  setEventSearch,
  statusFilter,
  setStatusFilter,
  loading,
  events,
  eventsPagination,
  formatDate,
  loadGuests,
  setView,
  toggleEventStatus,
  actionLoading,
  setConfirmModal,
  loadEvents,
}) => {
  // Fungsi reset filter
  const clearFilters = () => {
    setEventSearch('');
    setStatusFilter('');
  };

  // Filter data berdasarkan pencarian dan status
  const filteredEvents = events.filter((event) => {
    const matchesSearch = eventSearch
      ? event.nama_acara?.toLowerCase().includes(eventSearch.toLowerCase()) ||
        event.lokasi?.toLowerCase().includes(eventSearch.toLowerCase()) ||
        event.deskripsi?.toLowerCase().includes(eventSearch.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? event.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Render status badge (disesuaikan gaya SuratKeluar — tanpa border, lebih soft)
  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-800">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          Aktif
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-yellow-800">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        Tidak Aktif
      </span>
    );
  };

  if (view !== 'events') return null;

  return (
    <div className="min-h-screen">
      <main className="">

        {/* ✅ Search & Filter Section — Disesuaikan gaya SuratKeluar */}
        <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama acara atau lokasi..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 text-sm rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              {eventSearch && (
                <button
                  onClick={() => setEventSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-50 rounded-r-full transition-all"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown — disesuaikan gaya input */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm outline-none transition min-w-[140px]"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>

            {/* Clear Filters Button — hanya muncul jika ada filter aktif */}
            {(eventSearch || statusFilter) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-full hover:bg-gray-50 font-medium transition flex items-center gap-2"
              >
                <X className="h-4 w-4" /> Reset
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-gray-600 mt-4">
            <span>
              Menampilkan {filteredEvents.length} dari {events.length} acara
              {eventSearch && (
                <span className="ml-1">
                  untuk pencarian "{eventSearch}"
                </span>
              )}
              {statusFilter && (
                <span className="ml-1">
                  dengan status "{statusFilter === 'active' ? 'Aktif' : 'Tidak Aktif'}"
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ✅ Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* ✅ Empty State — jika tidak ada hasil setelah filter */}
        {!loading && filteredEvents.length === 0 && events.length > 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tidak Ada Hasil yang Cocok</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Reset pencarian
            </button>
          </div>
        )}

        {/* ✅ Empty State — jika belum ada acara sama sekali */}
        {!loading && events.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Calendar className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum Ada Acara</h3>
            <p className="text-gray-500">Buat acara pertama Anda untuk memulai.</p>
          </div>
        )}

        {/* ✅ Daftar Acara — Card-based Grid (seperti SuratKeluar) */}
        {!loading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="group relative bg-white space-y-3 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-slate-200"
              >
                {/* Header */}
                <div className="border-b border-gray-50/50 pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {event.nama_acara}
                      </h3>
                      {event.deskripsi && (
                        <p className="text-gray-600 text-sm leading-relaxed mt-1 line-clamp-2">
                          {event.deskripsi}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(event.status)}
                      <span className="text-xs text-gray-500 mt-1">{formatDate(event.tanggal_acara)}</span>
                    </div>
                  </div>
                </div>

                {/* Detail Acara */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mt-0.5">
                        <Calendar className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Tanggal Acara</p>
                        <p className="text-gray-800">{formatDate(event.tanggal_acara)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mt-0.5">
                        <MapPin className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Lokasi</p>
                        <p className="text-gray-800">{event.lokasi || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jumlah Tamu */}
                <div className="border-t border-gray-50/50 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium text-sm">Jumlah Tamu</p>
                      <p className="text-gray-800 font-semibold">
                        {event.kehadiran_tamu?.[0]?.count || 0} tamu
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tombol Aksi — disesuaikan gaya SuratKeluar */}
                <div className="space-y-3 pt-3 border-t border-gray-50/50">
                  <button
                    onClick={() => {
                      loadGuests(event.id);
                      setView('guests');
                    }}
                    className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-white border border-teal-400 hover:-translate-y-0.5 text-teal-400 rounded-full text-sm font-medium shadow transition-all duration-200"
                  >
                    <Eye className="w-4 h-4" />
                    Lihat Tamu
                  </button>

                  <button
                    onClick={() => toggleEventStatus(event.id, event.status)}
                    disabled={actionLoading[`status-${event.id}`]}
                    className={`inline-flex w-full justify-center items-center gap-2 px-4 py-3 rounded-full text-sm font-medium shadow transition-all duration-200 hover:-translate-y-0.5 ${
                      event.status === 'active'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-300 hover:bg-yellow-100'
                        : 'bg-green-50 text-green-800 border border-green-300 hover:bg-green-100'
                    } disabled:opacity-50`}
                  >
                    {actionLoading[`status-${event.id}`] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Edit className="w-4 h-4" />
                    )}
                    {event.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <button
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        data: {
                          type: 'delete-event',
                          id: event.id,
                          name: event.nama_acara,
                        },
                      })
                    }
                    disabled={actionLoading[`delete-${event.id}`]}
                    className="inline-flex w-full justify-center items-center gap-2 px-4 py-3 bg-white border border-red-400 hover:-translate-y-0.5 text-red-400 rounded-full text-sm font-medium shadow transition-all duration-200 disabled:opacity-50"
                  >
                    {actionLoading[`delete-${event.id}`] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ✅ Pagination — disesuaikan gaya SuratKeluar */}
        {!loading && filteredEvents.length > 0 && eventsPagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
            <div className="text-sm text-gray-600">
              Halaman {eventsPagination.current_page} dari {eventsPagination.total_pages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadEvents(eventsPagination.current_page - 1, eventSearch, statusFilter)}
                disabled={eventsPagination.current_page === 1}
                className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium text-sm">
                {eventsPagination.current_page}
              </span>

              <button
                onClick={() => loadEvents(eventsPagination.current_page + 1, eventSearch, statusFilter)}
                disabled={eventsPagination.current_page === eventsPagination.total_pages}
                className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BukuTamuView;