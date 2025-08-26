import React, { useState, useEffect } from 'react';
import { Mail, FileText, ChartColumnBig } from 'lucide-react';
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
      icon: Mail,
      color: 'text-[#D4A373]'
    },
    {
      id: 'disposisi-saya',
      label: 'Disposisi Saya',
      icon: FileText,
      color: 'text-[#4CAF50]'
    },
    {
      id: 'statistik-disposisi',
      label: 'Statistik',
      icon: ChartColumnBig,
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
    <div className="min-h-screen p-4 md:p-6 rounded-2xl" style={{ backgroundColor: '#FDFCFB' }}>
      {/* Header Section with Glass Effect */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-white/95 border-b border-[#EDE6E3] shadow-sm rounded-2xl overflow-hidden">
        <div className="p-6">
          {/* Title and Description */}
          <div className="flex flex-col lg:flex-row lg:items-center mb-6">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="p-3 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-2xl shadow-md">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2E2A27' }}>
                  Dashboard Kepala Kantor
                </h1>
                <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Kelola surat masuk dan disposisi dengan elegan</p>
              </div>
            </div>
            <div className='h-40 w-40 lg:h-48 lg:w-48 ml-auto hidden lg:block absolute right-0 top-0'>
              <img src={Avatar} alt="" className='h-full w-full object-contain opacity-90' />
            </div>
          </div>

          {/* Modern Tab Navigation */}
          <div className="relative">
            <div className="flex space-x-2 p-1.5 bg-[#FDFCFB] rounded-2xl border-2 border-[#EDE6E3] shadow-sm w-fit">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-3 cursor-pointer px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-white text-[#2E2A27] shadow-md border border-[#EDE6E3] scale-[1.02]'
                        : 'text-[#6D4C41] hover:text-[#2E2A27] hover:bg-gray-50 hover:shadow-sm'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${
                      activeTab === tab.id 
                        ? tab.color
                        : 'text-[#6D4C41]'
                    } transition-colors duration-300`} />
                    <span>{tab.label}</span>
                    
                    {/* Active indicator */}
                    {activeTab === tab.id && (
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 rounded-full transition-all duration-300 ${
                        tab.id === 'surat-masuk' ? 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41]' :
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

      {/* Content Area */}
      <div className="mt-6">
        <div className=" transition-all duration-300">
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