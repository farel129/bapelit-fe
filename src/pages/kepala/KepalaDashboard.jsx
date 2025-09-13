import React, { useState, useEffect } from 'react';
import { Mail, FileText, BarChart3 } from 'lucide-react';
import DisposisiList from '../../components/Kepala/DisposisiList';
import SuratMasukList from '../../components/Kepala/SuratMasukList';
import KepalaStatistikDisposisi from '../../components/Kepala/KepalaStatistikDisposisi';
import Avatar from '../../assets/img/adminrobot.png'
const KepalaDashboard = () => {
  const [activeTab, setActiveTab] = useState('surat-masuk');

  const tabs = [
    {
      id: 'surat-masuk',
      label: 'Surat Masuk',
      shortLabel: 'Surat',
      icon: Mail,
      color: 'text-[#D4A373]'
    },
    {
      id: 'disposisi-saya',
      label: 'Disposisi Saya',
      shortLabel: 'Disposisi',
      icon: FileText,
      color: 'text-[#4CAF50]'
    },
    {
      id: 'statistik-disposisi',
      label: 'Statistik',
      shortLabel: 'Statistik',
      icon: BarChart3,
      color: 'text-[#D9534F]'
    }
  ];

  // Scroll to top saat komponen pertama kali dimount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Scroll to top saat tab berubah
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white p-5 rounded-3xl shadow-lg">
      {/* Mobile Header */}
      <div className=" z-20 backdrop-blur-xl bg-white/95 border-b border-slate-200 shadow-lg rounded-2xl">
        <div className="px-4 py-4 sm:px-6 sm:py-6">
          {/* Title and Description - Mobile Optimized */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-lg flex-shrink-0">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg lg:text-xl font-bold text-black truncate">
                Dashboard Kepala Kantor
              </h1>
              <p className="text-xs sm:text-sm font-medium text-black mt-1 line-clamp-2">
                Kelola surat masuk dan buat disposisi untuk bawahan
              </p>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="relative">
            {/* Mobile: Horizontal scrollable tabs */}
            <div className="sm:hidden">
              <div className="flex space-x-1 p-1 bg-[#FDFCFB] rounded-xl border border-[#EDE6E3] shadow-sm overflow-x-auto scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex flex-col items-center space-y-1 cursor-pointer px-3 py-3 rounded-lg font-semibold text-xs transition-all duration-300 flex-shrink-0 min-w-[80px] ${
                        activeTab === tab.id
                          ? 'bg-white text-[#2E2A27] shadow-sm border border-[#EDE6E3]'
                          : 'text-pink-500 hover:text-[#2E2A27] hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${
                        activeTab === tab.id 
                          ? tab.color
                          : 'text-pink-500'
                      } transition-colors duration-300`} />
                      <span className="text-center leading-tight">{tab.shortLabel}</span>
                      
                      {/* Active indicator for mobile */}
                      {activeTab === tab.id && (
                        <div className={`absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-6 h-0.5 rounded-full transition-all duration-300 ${
                          tab.id === 'surat-masuk' ? 'bg-gradient-to-r from-[#D4A373] to-pink-500' :
                          tab.id === 'disposisi-saya' ? 'bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]' :
                          'bg-gradient-to-r from-[#D9534F] to-[#B52B27]'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop: Original tab design */}
            <div className="hidden sm:block">
              <div className="flex space-x-2 p-1.5 bg-[#FDFCFB] rounded-2xl border-2 border-[#EDE6E3] shadow-sm w-fit">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center space-x-3 cursor-pointer px-4 lg:px-6 py-3 lg:py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white text-[#2E2A27] shadow-md border border-[#EDE6E3] scale-[1.02]'
                          : 'text-pink-500 hover:text-[#2E2A27] hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${
                        activeTab === tab.id 
                          ? tab.color
                          : 'text-pink-500'
                      } transition-colors duration-300`} />
                      <span className="hidden md:inline">{tab.label}</span>
                      <span className="md:hidden">{tab.shortLabel}</span>
                      
                      {/* Active indicator for desktop */}
                      {activeTab === tab.id && (
                        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 lg:w-10 h-1 rounded-full transition-all duration-300 ${
                          tab.id === 'surat-masuk' ? 'bg-gradient-to-r from-[#D4A373] to-pink-500' :
                          tab.id === 'disposisi-saya' ? 'bg-gradient-to-r from-[#4CAF50] to-[#2E7D32]' :
                          'bg-gradient-to-r from-[#D9534F] to-[#B52B27]'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Mobile Optimized */}
      <div className="py-4">
        <div className="transition-all duration-300">
          <div className="transition-all duration-300">
            {activeTab === 'surat-masuk' && <SuratMasukList />}
            {activeTab === 'disposisi-saya' && <DisposisiList />}
            {activeTab === 'statistik-disposisi' && <KepalaStatistikDisposisi />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KepalaDashboard;