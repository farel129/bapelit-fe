import React from 'react';
import {
  FileText,
  Eye,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  X
} from 'lucide-react';

// Fungsi getStatusBadge — DISAMAKAN DENGAN KABIDDASHBOARD (TIDAK DIUBAH LOGIKA)
const getStatusBadge = (status_dari_bawahan) => {
  const statusConfig = {
    'belum dibaca': {
      color: 'bg-red-100 text-red-800 border border-red-200',
      icon: AlertCircle,
      text: 'Belum Dibaca'
    },
    'dibaca': {
      color: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      icon: AlertCircle,
      text: 'Sudah Dibaca'
    },
    'diteruskan': {
      color: 'bg-purple-100 text-purple-800 border border-purple-200',
      icon: Clock,
      text: 'Diteruskan kebawahan'
    },
    'diterima': {
      color: 'bg-green-100 text-green-800 border border-green-200',
      icon: CheckCircle,
      text: 'Diterima'
    },
    'diproses': {
      color: 'bg-blue-100 text-blue-800 border border-blue-200',
      icon: Clock,
      text: 'Dalam Proses'
    },
    'selesai': {
      color: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
      icon: CheckCircle,
      text: 'Selesai'
    }
  };

  const config = statusConfig[status_dari_bawahan] || statusConfig['belum dibaca'];
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </span>
  );
};

// Fungsi formatDate — DISAMAKAN DENGAN DISPOSISICARD ASLI (TIDAK DIUBAH)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const DisposisiTable = ({ 
  disposisiList, 
  onRefresh, 
  searchHighlight, 
  onViewDetail // 👈 DITERIMA SEBAGAI PROP
}) => {
  // TIDAK ADA PERUBAHAN LOGIKA — HANYA MENAMPILKAN TABEL DAN MEMANGGIL FUNGSI DARI PROP
  return (
    <div className="overflow-x-auto rounded-2xl border-2 border-[#EDE6E3] shadow-sm bg-white">
      <table className="min-w-full divide-y divide-[#EDE6E3]">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Nomor Surat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Asal Instansi</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">No. Agenda</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Tanggal Surat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Sifat</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[#2E2A27] uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EDE6E3]">
          {disposisiList.map((item) => (
            <tr key={item.id} className="hover:bg-[#FDFCFB] transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#2E2A27]">
                {item.nomor_surat || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2A27]">
                {item.asal_instansi || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2A27]">
                {item.nomor_agenda || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-[#2E2A27]">
                {formatDate(item.tanggal_surat)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${item.sifat === 'Sangat Segera' ? 'bg-red-100 text-red-800 border-red-200' :
                    item.sifat === 'Segera' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      item.sifat === 'Rahasia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        item.sifat === 'Biasa' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                  {item.sifat || '-'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(item.status_dari_bawahan)} {/* ← TETAP PAKAI STATUS DARI BAWAHAN */}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onViewDetail(item.id)} // 👈 PANGGIL FUNGSI DARI PROP — TIDAK PAKE window.open!
                    className="flex items-center justify-center gap-x-1 text-black text-sm shadow-lg font-medium bg-white px-3 py-2 border border-slate-200 rounded-xl hover:-translate-y-1 transition-all"
                  >
                    <Eye className="w-4 h-4" /> Lihat
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};