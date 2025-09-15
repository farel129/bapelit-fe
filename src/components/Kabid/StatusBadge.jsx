// components/Kabid/StatusBadge.jsx
import React from 'react';
import { AlertCircle, Eye, Check, Cog, Flag, Forward } from 'lucide-react';

const getStatusConfig = (status) => {
  const statusConfigs = {
    'belum dibaca': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: AlertCircle, label: 'Belum Dibaca' },
    'dibaca': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: Eye, label: 'Sudah Dibaca' },
    'diterima': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: Check, label: 'Diterima' },
    'diproses': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: Cog, label: 'Diproses' },
    'selesai': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200', icon: Flag, label: 'Selesai' },
    'diteruskan': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', icon: Forward, label: 'Diteruskan' }
  };
  return statusConfigs[status] || statusConfigs['belum dibaca'];
};

const StatusBadge = ({ status }) => {
  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${config.bg} ${config.text} border ${config.border} shadow-sm`}>
      <IconComponent className="w-4 h-4 mr-2" />
      {config.label}
    </div>
  );
};

export default StatusBadge;