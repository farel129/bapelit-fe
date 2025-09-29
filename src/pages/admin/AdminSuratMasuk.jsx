import React, { useState } from 'react';
import { Plus, List, BookPlus } from 'lucide-react';
import AdminBuatSuratMasuk from '../../components/Admin/AdminBuatSuratMasuk';
import AdminDaftarSuratMasuk from '../../components/Admin/AdminDaftarSuratMasuk';

const AdminSuratMasuk = () => {
    const [activeTab, setActiveTab] = useState('buat');

    return (
        <div className="min-h-screen">
            {/* Card Wrapper - konsisten dengan Surat Keluar */}
            <div className="hidden md:block bg-white pt-4 px-4 rounded-3xl shadow-lg">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-x-3">
                        <div className="p-3 bg-white text-teal-400 rounded-xl shadow-lg">
                            <BookPlus className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold">Surat Masuk</h1>
                            <p className="text-sm font-medium">Kelola surat masuk untuk kepala kantor</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-4 bg-white p-1 w-fit rounded-xl border-2 border-[#EDE6E3] shadow-sm">
                    <button
                        onClick={() => setActiveTab('buat')}
                        className={`flex items-center gap-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'buat'
                                ? 'bg-black text-white shadow-md'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <Plus className="w-4 h-4" />
                        Buat Surat
                    </button>

                    <button
                        onClick={() => setActiveTab('daftar')}
                        className={`flex items-center gap-x-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                            activeTab === 'daftar'
                                ? 'bg-black text-white shadow-md'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <List className="w-4 h-4" />
                        Daftar Surat
                    </button>
                </div>
            </div>

            {/* Tab Content - tetap di luar card agar tetap muncul di mobile */}
            <div className="transition-all duration-300">
                {activeTab === 'buat' ? (
                    <div className="animate-fadeIn">
                        <AdminBuatSuratMasuk />
                    </div>
                ) : (
                    <div className="animate-fadeIn">
                        <AdminDaftarSuratMasuk />
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSuratMasuk;