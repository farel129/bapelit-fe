import { Calendar, ChevronLeft, ChevronRight, Image, Loader2, MapPin, Search, Users, X } from 'lucide-react';
import React from 'react'
import LoadingSpinner from '../Ui/LoadingSpinner';

const GuestView = ({
    view,
    currentEvent,
    guestSearch,
    setGuestSearch,
    loading,
    guests,
    guestsPagination,
    actionLoading,
    setConfirmModal,
    setSelectedImage,
    setView,
    formatDate,
    formatTime

}) => {
    return (
        <div>
            {view === 'guests' && currentEvent && (
                <div className="space-y-4">
                    {/* Back Button */}
                    <div className="flex items-center gap-2 mt-7">
                        <button
                            onClick={() => setView('events')}
                            className="flex items-center text-black hover:text-gray-700 font-medium transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Kembali ke Daftar Acara
                        </button>
                    </div>

                    {/* Event Info Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-4">
                        <p className=' text-sm text-gray-400'>Nama Acara</p>
                        <h2 className='text-lg font-bold mt-1 mb-5'>{currentEvent.nama_acara}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-black">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 text-teal-400 mr-2" />
                                {formatDate(currentEvent.tanggal_acara)}
                            </div>
                            <div className="flex items-center">
                                <MapPin className="w-5 h-5 text-teal-400 mr-2" />
                                {currentEvent.lokasi}
                            </div>
                        </div>
                    </div>

                    {/* Guest Search */}
                    <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm p-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                            <input
                                type="text"
                                placeholder="Cari nama tamu atau instansi..."
                                value={guestSearch}
                                onChange={(e) => setGuestSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-white focus:border-white text-black placeholder-black shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <LoadingSpinner size="lg" text="Memuat data tamu..." />
                            </div>
                        ) : guests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                                <Users className="h-12 w-12 text-black mx-auto mb-4" />
                                <p className="text-black text-lg font-semibold">
                                    {guestsPagination.total_items === 0 ? 'Belum ada tamu' : 'Tidak ada tamu yang sesuai filter'}
                                </p>
                                <p className="text-black mt-1">
                                    {guestsPagination.total_items === 0 ? 'Belum ada tamu yang melakukan check-in untuk acara ini.' : 'Coba ubah filter pencarian'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-[#EDE6E3] bg-white rounded-2xl">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tamu</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Instansi</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Jabatan / Status / Pekerjaan</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Check In</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Foto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EDE6E3]">
                                        {guests.map((guest) => (
                                            <tr key={guest.id} className="hover:bg-[#FDFCFB] transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                                    {guest.nama_lengkap}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                    {guest.instansi || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                    <div className="space-y-1">
                                                        <div>{guest.email || '-'}</div>
                                                        <div className="text-gray-600">{guest.jabatan || '-'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                                                    <div className="space-y-1">
                                                        <div className="font-medium">{formatDate(guest.check_in_time)}</div>
                                                        <div className="text-gray-600">{formatTime(guest.check_in_time)}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {guest.foto_kehadiran_tamu && guest.foto_kehadiran_tamu.length > 0 ? (
                                                        <div className="flex flex-wrap gap-2">
                                                            {guest.foto_kehadiran_tamu.map((foto) => (
                                                                <div key={foto.id} className="relative group">
                                                                    <img
                                                                        src={foto.file_url}
                                                                        alt={foto.original_name}
                                                                        className="w-12 h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-[#EDE6E3]"
                                                                        onClick={() => {
                                                                            setSelectedImage(foto.file_url);
                                                                        }}
                                                                    />
                                                                    <button
                                                                        onClick={() => setConfirmModal({
                                                                            isOpen: true,
                                                                            data: {
                                                                                type: 'delete-photo',
                                                                                id: foto.id
                                                                            }
                                                                        })}
                                                                        disabled={actionLoading[`photo-${foto.id}`]}
                                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg disabled:opacity-50"
                                                                    >
                                                                        {actionLoading[`photo-${foto.id}`] ? (
                                                                            <Loader2 className="w-2 h-2 animate-spin" />
                                                                        ) : (
                                                                            <X className="w-2 h-2" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm italic">Tidak ada foto</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination — Disesuaikan gaya SuratMasukList */}
                        {guests.length > 0 && (
                            <div className="px-6 py-4 bg-white border-t border-[#EDE6E3] flex items-center justify-between">
                                <div className="text-sm font-medium text-black">
                                    Menampilkan {((guestsPagination.current_page - 1) * 10) + 1} - {Math.min(guestsPagination.current_page * 10, guestsPagination.total_items)} dari {guestsPagination.total_items} tamu
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => loadGuests(currentEvent.id, guestsPagination.current_page - 1, guestSearch)}
                                        disabled={guestsPagination.current_page === 1}
                                        className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <span className="px-3 py-2 bg-white text-black rounded-xl font-semibold border border-[#EDE6E3]">
                                            {guestsPagination.current_page}
                                        </span>
                                        <span className="text-sm text-black">dari</span>
                                        <span className="px-3 py-2 bg-white text-black rounded-xl font-semibold border border-[#EDE6E3]">
                                            {guestsPagination.total_pages}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => loadGuests(currentEvent.id, guestsPagination.current_page + 1, guestSearch)}
                                        disabled={guestsPagination.current_page === guestsPagination.total_pages}
                                        className="p-2 border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default GuestView