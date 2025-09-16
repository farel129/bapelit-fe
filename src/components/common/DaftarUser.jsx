import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, RefreshCw, Award, Building, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import LoadingSpinner from '../Ui/LoadingSpinner';

const DaftarUser = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBidang, setFilterBidang] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users data
  const fetchUsers = async (showLoadingToast = false) => {
    try {
      if (showLoadingToast) {
        setRefreshing(true);
        toast.loading('Memuat data user...');
      }

      const response = await api.get('/users/daftar-user');
      const data = response.data;
      setUsers(data.data || []);

      if (showLoadingToast) {
        toast.dismiss();
        toast.success(`Berhasil memuat ${data.total || data.data?.length || 0} user`);
      }

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Gagal memuat data user');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term and bidang
  const filteredUsers = users.filter(userData => {
    const matchesSearch = (userData.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userData.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBidang = !filterBidang || userData.bidang === filterBidang;
    return matchesSearch && matchesBidang;
  });

  // Get unique bidang for filter dropdown
  const uniqueBidang = [...new Set(users.map(userData => userData.bidang).filter(Boolean))];

  // Handle refresh
  const handleRefresh = () => {
    fetchUsers(true);
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  // ✅ AVATAR DINAMIS — ABU-ABU TERANG (karena hanya 3 warna)
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-100 text-gray-600';
    const hue = (name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137.509) % 360;
    return `hsl(${hue}, 15%, 90%)`; // Abu-abu sangat terang, netral, tidak mencolok
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-5 rounded-3xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-1.5 bg-black rounded-full shadow-sm"></div>
          <div>
            <h1 className="text-lg font-bold text-black">Daftar User</h1>
            <p className="text-sm text-gray-600">Daftar pengguna sistem</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white hover:bg-gray-50 border border-gray-200 gap-x-2 flex items-center text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-teal-400"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards — White + Black + teal Accent */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 opacity-80">Total User</p>
              <p className="text-lg font-bold text-black mt-2">{users.length}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl shadow-sm border border-teal-100">
              <Users className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 opacity-80">Bidang Unik</p>
              <p className="text-lg font-bold text-black mt-2">{uniqueBidang.length}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl shadow-sm border border-teal-100">
              <Building className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 opacity-80">Hasil Filter</p>
              <p className="text-lg font-bold text-black mt-2">{filteredUsers.length}</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-xl shadow-sm border border-teal-100">
              <Filter className="w-6 h-6 text-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter — GLASSMORPHISM WITH ONLY 3 COLORS */}
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-md mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 text-sm appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="text-gray-600">Semua Bidang</option>
              {uniqueBidang.map(bidang => (
                <option key={bidang} value={bidang} className="text-black">{bidang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-sm font-medium text-gray-600">
            Menampilkan {filteredUsers.length} dari {users.length} user
          </div>
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-black text-lg font-semibold">
            {searchTerm || filterBidang ? 'Tidak ada hasil pencarian' : 'Tidak ada user'}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            {searchTerm || filterBidang ? 'Coba sesuaikan kata kunci atau filter' : 'Belum ada user yang terdaftar'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((userData) => (
            <div 
              key={userData.id} 
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              style={user && userData.id === user.id ? { borderLeft: '4px solid #ec4899', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' } : {}}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* ✅ MODERN AVATAR — ABU-ABU TERANG DENGAN HSL */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-black shadow-sm"
                    style={{ backgroundColor: getAvatarColor(userData.name) }}
                  >
                    {getUserInitials(userData.name)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-black">{userData.name}</h3>
                      {user && userData.id === user.id && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                          <Award className="w-3 h-3 mr-1" /> Anda
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      Jabatan: {userData.jabatan || 'Tidak diketahui'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-gray-100 shadow-sm">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-black">{userData.bidang}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DaftarUser;