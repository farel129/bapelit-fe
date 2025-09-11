import React, { useState } from 'react';
import { Mail, FileText, Plus, List, RefreshCcw } from 'lucide-react';
import AdminBuatSuratKeluar from '../../components/Admin/AdminBuatSuratKeluar';
import AdminDaftarSuratKeluar from '../../components/Admin/AdminDaftarSuratKeluar';

const AdminSuratKeluar = () => {
    const [activeTab, setActiveTab] = useState('buat');

    return (
        <div className="min-h-screen p-2 lg:p-5 rounded-3xl bg-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <div className="h-8 w-1.5 bg-pink-500 rounded-full shadow-sm"></div>
                    <div>
                        <h1 className="text-xl font-bold">Surat Keluar</h1>
                        <p className="text-sm font-medium">Arsip digital untuk surat keluar</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl border-2 border-[#EDE6E3] shadow-sm">
                <button
                    onClick={() => setActiveTab('buat')}
                    className={`flex items-center gap-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'buat'
                        ? 'bg-black text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                        }`}
                >
                    <Plus className="w-4 h-4" />
                    Buat Surat
                </button>

                <button
                    onClick={() => setActiveTab('daftar')}
                    className={`flex items-center gap-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'daftar'
                        ? 'bg-black text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
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