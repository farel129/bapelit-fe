import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Award, BarChart3, Crown, Star, Trophy } from 'lucide-react';
import { api } from '../../utils/api';

// Mock API for demonstration

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState('atasan');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboardData();
  }, [activeTab]);

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/leaderboard/${activeTab}`);
      setLeaderboardData(response.data);
    } catch (err) {
      setError('Gagal memuat data leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFieldName = () => {
    return activeTab === 'atasan' ? 'jabatan' : 'name';
  };

  const getRankBadge = (index) => {
    if (index === 0) return { icon: Crown, color: 'text-amber-500', bg: 'bg-gradient-to-br from-amber-50 to-amber-100', border: 'border-amber-200' };
    if (index === 1) return { icon: Trophy, color: 'text-slate-400', bg: 'bg-gradient-to-br from-slate-50 to-slate-100', border: 'border-slate-200' };
    if (index === 2) return { icon: Award, color: 'text-amber-600', bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-200' };
    return { icon: null, color: 'text-slate-500', bg: 'bg-gradient-to-br from-slate-50 to-slate-100', border: 'border-slate-200' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#FDFCFB'}}>
        <div className="bg-white rounded-xl shadow-xl border p-6 w-full max-w-md backdrop-blur-sm" style={{borderColor: '#EDE6E3'}}>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EDE6E3] border-t-[#D4A373]"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#D4A373] to-[#6D4C41] opacity-20 animate-pulse"></div>
            </div>
            <p className="font-semibold text-lg" style={{color: '#6D4C41'}}>Memuat data leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{backgroundColor: '#FDFCFB'}}>
        <div className="bg-white rounded-xl shadow-xl border p-6 w-full max-w-md text-center backdrop-blur-sm" style={{borderColor: '#EDE6E3'}}>
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg" style={{backgroundColor: '#EDE6E3'}}>
              <TrendingUp className="w-8 h-8" style={{color: '#D9534F'}} />
            </div>
            <p className="font-semibold text-lg" style={{color: '#2E2A27'}}>{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #D4A373, #6D4C41)',
                color: 'white'
              }}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#FDFCFB'}}>
      <div className="max-w-6xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="text-center mb-4 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5">
            <BarChart3 className="w-32 h-32" style={{color: '#D4A373'}} />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 shadow-xl transform hover:scale-110 transition-all duration-300"
                 style={{background: 'linear-gradient(135deg, #D4A373, #6D4C41)'}}>
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl md:text-xl font-bold mb-1 bg-gradient-to-r from-[#2E2A27] to-[#6D4C41] bg-clip-text text-transparent">
              Papan Disposisi
            </h1>
            <p className="text-base max-w-3xl mx-auto font-medium leading-relaxed" style={{color: '#6D4C41'}}>
              Papan ranking penerima disposisi terbanyak
            </p>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex justify-center mb-6">
          <div className="rounded-xl shadow-xl border-2 p-2 flex backdrop-blur-sm" 
               style={{backgroundColor: 'white', borderColor: '#EDE6E3'}}>
            <button
              onClick={() => setActiveTab('atasan')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 ${
                activeTab === 'atasan'
                  ? 'shadow-xl text-white scale-105'
                  : 'hover:bg-[#FDFCFB] hover:shadow-md'
              }`}
              style={{
                background: activeTab === 'atasan' 
                  ? 'linear-gradient(135deg, #D4A373, #6D4C41)' 
                  : 'transparent',
                color: activeTab === 'atasan' ? 'white' : '#6D4C41'
              }}
            >
              <Users className="w-4 h-4" />
              <span className="text-base">Kepala Bidang</span>
            </button>
            <button
              onClick={() => setActiveTab('bawahan')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 transform hover:scale-105 ${
                activeTab === 'bawahan'
                  ? 'shadow-xl text-white scale-105'
                  : 'hover:bg-[#FDFCFB] hover:shadow-md'
              }`}
              style={{
                background: activeTab === 'bawahan' 
                  ? 'linear-gradient(135deg, #D4A373, #6D4C41)' 
                  : 'transparent',
                color: activeTab === 'bawahan' ? 'white' : '#6D4C41'
              }}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-base">Bawahan</span>
            </button>
          </div>
        </div>

        {/* Enhanced Leaderboard Content */}
        <div className="rounded-xl shadow-xl border-2 overflow-hidden backdrop-blur-sm" 
             style={{backgroundColor: 'white', borderColor: '#EDE6E3'}}>
          {leaderboardData.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-xl" 
                   style={{background: 'linear-gradient(135deg, #EDE6E3, #F5F5F5)'}}>
                <BarChart3 className="w-10 h-10" style={{color: '#6D4C41'}} />
              </div>
              <p className="text-xl font-bold" style={{color: '#6D4C41'}}>
                Belum ada data disposisi
              </p>
              <p className="text-base mt-2 opacity-75" style={{color: '#6D4C41'}}>
                Data akan muncul setelah ada aktivitas disposisi
              </p>
            </div>
          ) : (
            <div className="divide-y-[2px] divide-black/10">
              {leaderboardData.map((item, index) => {
                const fieldName = getFieldName();
                const maxValue = Math.max(...leaderboardData.map(d => d.jumlah_disposisi));
                const progressWidth = (item.jumlah_disposisi / maxValue) * 100;
                const rankBadge = getRankBadge(index);
                
                return (
                  <div
                    key={index}
                    className={`p-4 transition-all duration-500 hover:shadow-lg ${
                      index < 3 ? 'bg-gradient-to-r from-[#FDFCFB] via-transparent to-[#FDFCFB]' : ''
                    }`}
                    style={{
                      backgroundColor: index % 2 === 0 ? 'white' : '#FDFCFB'
                    }}
                  >
                    <div className="flex items-center">
                      {/* Enhanced Rank Badge */}
                      <div className="w-16 flex justify-center">
                        {rankBadge.icon ? (
                          <div className={`w-12 h-12 ${rankBadge.bg} ${rankBadge.border} border-2 rounded-xl flex items-center justify-center shadow-xl transform hover:rotate-12 transition-all duration-300`}>
                            <rankBadge.icon className={`w-6 h-6 ${rankBadge.color}`} />
                            {index === 0 && <Star className="absolute -top-1 -right-1 z-10 w-3 h-3 text-amber-400 animate-pulse" />}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border-2" 
                               style={{backgroundColor: '#EDE6E3', borderColor: '#D4A373'}}>
                            <span className="text-lg font-bold" style={{color: '#6D4C41'}}>
                              {index + 1}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Info Section */}
                      <div className="flex-1 min-w-0 px-4">
                        <h3 className=" font-bold mb-1" style={{color: '#2E2A27'}}>
                          {item[fieldName]}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="px-2 py-1 rounded-full text-xs font-bold border-2" 
                               style={{backgroundColor: '#FDFCFB', borderColor: '#D4A373', color: '#6D4C41'}}>
                            {item.bidang}
                          </div>
                        </div>
                        <p className="text-sm font-semibold flex items-center space-x-2" style={{color: '#6D4C41'}}>
                          <BarChart3 className="w-4 h-4" />
                          <span>{item.jumlah_disposisi} disposisi ditangani</span>
                        </p>
                      </div>

                      {/* Enhanced Progress Bar - Desktop */}
                      <div className="w-32 hidden lg:block mx-4">
                        <div className="h-3 rounded-full overflow-hidden shadow-inner border-2" style={{backgroundColor: '#EDE6E3', borderColor: '#D4A373'}}>
                          <div
                            className="h-full rounded-full transition-all duration-1500 ease-out shadow-lg"
                            style={{ 
                              width: `${progressWidth}%`,
                              background: 'linear-gradient(135deg, #D4A373, #6D4C41)',
                              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1 font-semibold" style={{color: '#6D4C41'}}>
                          {Math.round(progressWidth)}% dari tertinggi
                        </div>
                      </div>

                      {/* Enhanced Count */}
                      <div className="text-center">
                        <span className="text-xl md:text-xl font-bold bg-gradient-to-r from-[#2E2A27] to-[#6D4C41] bg-clip-text text-transparent">
                          {item.jumlah_disposisi}
                        </span>
                        <div className="text-xs uppercase tracking-wider font-bold mt-1" style={{color: '#6D4C41'}}>
                          Disposisi
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Progress Bar - Mobile */}
                    <div className="mt-4 lg:hidden">
                      <div className="flex justify-between text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
                        <span>Progress</span>
                        <span>{Math.round(progressWidth)}%</span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden shadow-inner border-2" style={{backgroundColor: '#EDE6E3', borderColor: '#D4A373'}}>
                        <div
                          className="h-full rounded-full transition-all duration-1500 ease-out"
                          style={{ 
                            width: `${progressWidth}%`,
                            background: 'linear-gradient(135deg, #D4A373, #6D4C41)'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enhanced Footer Stats */}
        {leaderboardData.length > 0 && (
          <div className="mt-4 rounded-xl shadow-xl border-2 p-6 backdrop-blur-sm" 
               style={{backgroundColor: 'white', borderColor: '#EDE6E3'}}>
            <h3 className="text-xl font-bold text-center mb-6" style={{color: '#2E2A27'}}>
              Statistik Keseluruhan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                   style={{backgroundColor: '#FDFCFB', borderColor: '#EDE6E3'}}>
                <div className="text-xl font-bold mb-2 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] bg-clip-text text-transparent">
                  {leaderboardData.reduce((sum, item) => sum + item.jumlah_disposisi, 0)}
                </div>
                <div className="text-base font-bold" style={{color: '#6D4C41'}}>Total Disposisi</div>
                <div className="text-sm mt-1 opacity-75" style={{color: '#6D4C41'}}>Keseluruhan sistem</div>
              </div>
              <div className="text-center p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                   style={{backgroundColor: '#FDFCFB', borderColor: '#EDE6E3'}}>
                <div className="text-xl font-bold mb-2 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] bg-clip-text text-transparent">
                  {Math.round(leaderboardData.reduce((sum, item) => sum + item.jumlah_disposisi, 0) / leaderboardData.length)}
                </div>
                <div className="text-base font-bold" style={{color: '#6D4C41'}}>Rata-rata per Orang</div>
                <div className="text-sm mt-1 opacity-75" style={{color: '#6D4C41'}}>Distribusi kerja</div>
              </div>
              <div className="text-center p-4 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300" 
                   style={{backgroundColor: '#FDFCFB', borderColor: '#EDE6E3'}}>
                <div className="text-xl font-bold mb-2 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] bg-clip-text text-transparent">
                  {leaderboardData.length}
                </div>
                <div className="text-base font-bold" style={{color: '#6D4C41'}}>Total Partisipan</div>
                <div className="text-sm mt-1 opacity-75" style={{color: '#6D4C41'}}>Peserta aktif</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;