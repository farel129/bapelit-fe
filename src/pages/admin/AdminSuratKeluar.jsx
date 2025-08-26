import React, { useState } from 'react';
import AdminBuatSuratKeluar from '../../components/Admin/AdminBuatSuratKeluar';
import AdminDaftarSuratKeluar from '../../components/Admin/AdminDaftarSuratKeluar';
import { Mail, FileText, Plus, List, RefreshCcw } from 'lucide-react';

const AdminSuratKeluar = () => {
  const [activeTab, setActiveTab] = useState('buat');

  return (
    <div className="min-h-screen p-4 md:p-6 rounded-2xl" style={{backgroundColor: '#FDFCFB'}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
          <div>
            <h1 className="text-xl font-bold" style={{color: '#2E2A27'}}>Surat Keluar</h1>
            <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Kelola surat keluar dengan elegan</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl border-2 border-[#EDE6E3] shadow-sm">
        <button
          onClick={() => setActiveTab('buat')}
          className={`flex items-center gap-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'buat'
              ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white shadow-md'
              : 'text-[#6D4C41] hover:text-[#2E2A27] hover:bg-[#FDFCFB]'
          }`}
        >
          <Plus className="w-4 h-4" />
          Buat Surat
        </button>
        
        <button
          onClick={() => setActiveTab('daftar')}
          className={`flex items-center gap-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            activeTab === 'daftar'
              ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white shadow-md'
              : 'text-[#6D4C41] hover:text-[#2E2A27] hover:bg-[#FDFCFB]'
          }`}
        >
          <List className="w-4 h-4" />
          Daftar Surat
        </button>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'buat' ? (
          <div className="animate-fadeIn">
            <AdminBuatSuratKeluar />
          </div>
        ) : (
          <div className="animate-fadeIn">
            <AdminDaftarSuratKeluar />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSuratKeluar;