import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const DisposisiCard = ({ disposisi, onRefresh }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/staff/disposisi/${disposisi.id}`);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'belum dibaca': {
                class: 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800 border border-amber-200 shadow-sm',
                icon: 'fas fa-clock',
                dot: 'bg-amber-500'
            },
            'dibaca': {
                class: 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border border-blue-200 shadow-sm',
                icon: 'fas fa-eye',
                dot: 'bg-blue-500'
            },
            'diterima': {
                class: 'bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm',
                icon: 'fas fa-check-circle',
                dot: 'bg-emerald-500'
            },
            'diteruskan': {
                class: 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm',
                icon: 'fas fa-share',
                dot: 'bg-indigo-500'
            }
        };

        const config = statusConfig[status] || {
            class: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-sm',
            icon: 'fas fa-question-circle',
            dot: 'bg-gray-500'
        };

        return (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${config.class}`}>
                <div className={`w-2 h-2 rounded-full ${config.dot} mr-2 animate-pulse`}></div>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getPriorityIndicator = () => {
        const isHighPriority = disposisi.status === 'belum dibaca';
        if (isHighPriority) {
            return (
                <div className="absolute top-3 left-3 w-1 h-6 bg-gradient-to-b from-red-400 to-red-600 rounded-full shadow-sm"></div>
            );
        }
        return null;
    };

    return (
        <div className="group relative">
            <div
                className="relative bg-gradient-to-br from-white via-white to-[#FDFCFB] rounded-2xl shadow-sm border-2 border-[#EDE6E3] hover:shadow-lg hover:border-[#D4A373] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
                {getPriorityIndicator()}

                <div className="relative p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-xs font-medium text-[#6D4C41] tracking-wide uppercase">
                                Status
                            </span>
                            {getStatusBadge(disposisi.status_dari_bawahan)}
                        </div>
                    </div>

                    <div className="mb-5">
                        <div className="flex items-start space-x-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-[#2E2A27] text-lg leading-tight hover:text-[#6D4C41] transition-colors line-clamp-2">
                                    <span className='text-[#6D4C41] font-normal'>Asal Instansi: </span> {disposisi.asal_instansi}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-lg p-3 border border-[#EDE6E3] shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                                <i className="fas fa-file-alt text-[#6D4C41] text-xs"></i>
                                <span className="text-[#6D4C41] text-xs font-medium tracking-wide">Nomor Surat</span>
                            </div>
                            <p className="font-semibold text-[#2E2A27] text-sm truncate">
                                {disposisi.nomor_surat || 'Belum ada nomor'}
                            </p>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-[#EDE6E3] shadow-sm">
                            <div className="flex items-center space-x-2 mb-1">
                                <i className="fas fa-calendar-alt text-[#6D4C41] text-xs"></i>
                                <span className="text-[#6D4C41] text-xs font-medium tracking-wide">Tanggal Surat</span>
                            </div>
                            <p className="font-semibold text-[#2E2A27] text-sm">
                                {formatDate(disposisi.tanggal_surat)}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-[#EDE6E3]">
                        <button
                            onClick={handleCardClick}
                            className="flex-1 inline-flex items-center hover:-translate-y-1 hover:shadow-md justify-center px-4 py-3 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] text-white text-sm font-semibold rounded-xl border border-[#EDE6E3] transition-all duration-200 hover:from-[#6D4C41] hover:to-[#2E2A27] shadow-sm"
                        >
                            Lihat Detail
                            <ChevronRight className='ml-1 w-4 h-4' />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};