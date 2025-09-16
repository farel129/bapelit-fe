import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Award,
  BarChart3,
  Crown,
  Star,
  Trophy,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '../../utils/api';
import LoadingSpinner from '../Ui/LoadingSpinner';

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
      const response = await api.get(`/disposisi/leaderboard/${activeTab}`);
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
    if (index === 0) return { icon: Crown, color: 'text-amber-600', bg: 'bg-white border border-gray-200', shadow: 'shadow-md' };
    if (index === 1) return { icon: Trophy, color: 'text-slate-600', bg: 'bg-white border border-gray-200', shadow: 'shadow-md' };
    if (index === 2) return { icon: Award, color: 'text-orange-600', bg: 'bg-white border border-gray-200', shadow: 'shadow-md' };
    return { icon: null, color: 'text-gray-500', bg: 'bg-white border border-gray-200', shadow: 'shadow-sm' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner text='Memuat peringkat' />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-red-50 shadow-lg">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-sm font-semibold text-[#000000]">{error}</p>
            <button
              onClick={fetchLeaderboardData}
              className="px-8 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Consistent Style */}
        <div className="text-center mb-8 relative">
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-4 shadow-lg transform hover:scale-110 transition-all duration-300 bg-white"
              style={{ border: '2px solid #e5e7eb' }}>
              <BarChart3 className="w-8 h-8 text-teal-400" />
            </div>
            <h1 className="text-lg font-bold mb-1 text-black">
              Papan Disposisi
            </h1>
            <p className="text-base max-w-3xl mx-auto font-medium leading-relaxed text-[#6b7280]">
              Papan ranking penerima disposisi terbanyak
            </p>
          </div>
        </div>

        {/* Enhanced Tabs — Match AdminJadwalAcara Style */}
        <div className="flex justify-center mb-4">
          <div className="rounded-2xl shadow-lg border border-gray-200 p-2 flex backdrop-blur-sm bg-white/80">
            <button
              onClick={() => setActiveTab('atasan')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${activeTab === 'atasan'
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'text-[#000000] hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <Users className="w-5 h-5" />
              <span>Kepala Bidang</span>
            </button>
            <button
              onClick={() => setActiveTab('bawahan')}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${activeTab === 'bawahan'
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'text-[#000000] hover:bg-gray-50 hover:shadow-md'
                }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Bawahan</span>
            </button>
          </div>
        </div>

        {/* Enhanced Leaderboard Content */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {leaderboardData.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 rounded-xl flex items-center justify-center mx-auto mb-6 bg-gray-50 shadow-sm">
                <BarChart3 className="w-10 h-10 text-[#6b7280]" />
              </div>
              <p className="text-sm font-semibold text-[#000000] mb-1">Belum ada data disposisi</p>
              <p className="text-sm text-[#6b7280]">Data akan muncul setelah ada aktivitas disposisi</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboardData.map((item, index) => {
                const fieldName = getFieldName();
                const maxValue = Math.max(...leaderboardData.map(d => d.jumlah_disposisi));
                const progressWidth = (item.jumlah_disposisi / maxValue) * 100;
                const rankBadge = getRankBadge(index);
                const IconComponent = rankBadge.icon;

                return (
                  <div
                    key={index}
                    className={`p-6 transition-all duration-500 hover:shadow-lg ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      {/* Rank Badge */}
                      <div className={`w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center ${rankBadge.bg} ${rankBadge.shadow}`}>
                        {IconComponent ? (
                          <>
                            <IconComponent className={`w-8 h-8 ${rankBadge.color}`} />
                            {index === 0 && (
                              <Star className="absolute -top-1 -right-1 w-4 h-4 text-amber-400 animate-pulse" />
                            )}
                          </>
                        ) : (
                          <span className="text-sm font-bold text-[#000000]">{index + 1}</span>
                        )}
                      </div>

                      {/* Info Section */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[#000000] mb-1 text-sm">
                          {item[fieldName]}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white"
                            style={{ color: '#6b7280' }}>
                            {item.bidang}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-[#6b7280] flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          {item.jumlah_disposisi} disposisi ditangani
                        </p>
                      </div>

                      {/* Progress Bar - Desktop */}
                      <div className="hidden sm:block w-40">
                        <div className="h-2 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                          <div
                            className="h-full rounded-full transition-all duration-1500 ease-out"
                            style={{
                              width: `${progressWidth}%`,
                              background: 'linear-gradient(135deg, #00d5be, #000)',
                              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1 font-medium text-[#6b7280]">
                          {Math.round(progressWidth)}% dari tertinggi
                        </div>
                      </div>

                      {/* Count */}
                      <div className="text-center sm:text-right flex-shrink-0">
                        <span className="text-lg font-bold bg-gradient-to-r from-[#000000] to-[#6b7280] bg-clip-text text-transparent">
                          {item.jumlah_disposisi}
                        </span>
                        <div className="text-xs uppercase tracking-wider font-medium text-[#6b7280] mt-1">
                          Disposisi
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar - Mobile */}
                    <div className="mt-4 sm:hidden">
                      <div className="flex justify-between text-sm font-medium text-[#6b7280] mb-2">
                        <span>Progress</span>
                        <span>{Math.round(progressWidth)}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        <div
                          className="h-full rounded-full transition-all duration-1500 ease-out"
                          style={{
                            width: `${progressWidth}%`,
                            background: 'linear-gradient(135deg, #f6339a, #e51b8c)'
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

        {/* Enhanced Footer Stats — Match AdminJadwalAcara Style */}
        {leaderboardData.length > 0 && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-center mb-6 text-[#000000]">
              Statistik Keseluruhan
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-lg font-bold bg-gradient-to-r from-[#000000] to-[#6b7280] bg-clip-text text-transparent mb-2">
                  {leaderboardData.reduce((sum, item) => sum + item.jumlah_disposisi, 0)}
                </div>
                <div className="text-sm font-medium text-[#6b7280]">Total Disposisi</div>
                <div className="text-xs text-[#6b7280] mt-1">Keseluruhan sistem</div>
              </div>
              <div className="text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-lg font-bold bg-gradient-to-r from-[#000000] to-[#6b7280] bg-clip-text text-transparent mb-2">
                  {Math.round(leaderboardData.reduce((sum, item) => sum + item.jumlah_disposisi, 0) / leaderboardData.length)}
                </div>
                <div className="text-sm font-medium text-[#6b7280]">Rata-rata per Orang</div>
                <div className="text-xs text-[#6b7280] mt-1">Distribusi kerja</div>
              </div>
              <div className="text-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="text-lg font-bold bg-gradient-to-r from-[#000000] to-[#6b7280] bg-clip-text text-transparent mb-2">
                  {leaderboardData.length}
                </div>
                <div className="text-sm font-medium text-[#6b7280]">Total Partisipan</div>
                <div className="text-xs text-[#6b7280] mt-1">Peserta aktif</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;