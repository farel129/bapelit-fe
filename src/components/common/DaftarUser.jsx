import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, RefreshCw, Award, Building, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

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

      const response = await api.get('/daftar-user');
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

  // Get avatar color based on name
  const getAvatarColor = (name) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-red-200 text-red-900',
      'bg-blue-200 text-blue-900',
      'bg-green-200 text-green-900'
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
        <span className="ml-2 text-[#6D4C41]">Memuat data user...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 rounded-2xl" style={{ backgroundColor: '#FDFCFB' }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-x-3">
          <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Daftar User</h1>
            <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Daftar pengguna sistem</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDE6E3] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6D4C41] opacity-80">Total User</p>
              <p className="text-3xl font-bold text-[#2E2A27] mt-2">{users.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] p-3 rounded-xl shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDE6E3] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6D4C41] opacity-80">Bidang Unik</p>
              <p className="text-3xl font-bold text-[#2E2A27] mt-2">{uniqueBidang.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] p-3 rounded-xl shadow-md">
              <Building className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDE6E3] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6D4C41] opacity-80">Hasil Filter</p>
              <p className="text-3xl font-bold text-[#2E2A27] mt-2">{filteredUsers.length}</p>
            </div>
            <div className="bg-gradient-to-br from-[#2196F3] to-[#0D47A1] p-3 rounded-xl shadow-md">
              <Filter className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6D4C41] w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-[#2E2A27] rounded-xl border border-[#EDE6E3] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-all duration-200 text-sm shadow-sm"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6D4C41] w-5 h-5" />
            <select
              value={filterBidang}
              onChange={(e) => setFilterBidang(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white text-[#2E2A27] rounded-xl border border-[#EDE6E3] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-all duration-200 text-sm appearance-none cursor-pointer shadow-sm"
            >
              <option value="" className="text-[#6D4C41]">Semua Bidang</option>
              {uniqueBidang.map(bidang => (
                <option key={bidang} value={bidang} className="text-[#2E2A27]">{bidang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-sm font-medium" style={{ color: '#6D4C41' }}>
            Menampilkan {filteredUsers.length} dari {users.length} user
          </div>
        </div>
      </div>

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
          <Users className="w-12 h-12 text-[#6D4C41] mx-auto mb-4" />
          <p className="text-[#2E2A27] text-lg font-semibold">
            {searchTerm || filterBidang ? 'Tidak ada hasil pencarian' : 'Tidak ada user'}
          </p>
          <p className="text-[#6D4C41] text-sm mt-1">
            {searchTerm || filterBidang ? 'Coba sesuaikan kata kunci atau filter' : 'Belum ada user yang terdaftar'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((userData) => (
            <div 
              key={userData.id} 
              className={`bg-white p-5 rounded-2xl border-2 border-[#EDE6E3] shadow-sm hover:shadow-lg transition-all duration-300 ${user && userData.id === user.id ? 'ring-2 ring-[#D4A373]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${getAvatarColor(userData.name)} rounded-full flex items-center justify-center font-semibold text-sm shadow-sm`}>
                    {getUserInitials(userData.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#2E2A27]">{userData.name}</h3>
                      {user && userData.id === user.id && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                          <Award className="w-3 h-3 mr-1" /> Anda
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#6D4C41] mt-1">
                      Jabatan: {userData.jabatan || 'Tidak diketahui'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center gap-2 bg-[#FDFCFB] px-3.5 py-2.5 rounded-xl border border-[#EDE6E3] shadow-sm">
                    <Building className="w-4 h-4 text-[#6D4C41]" />
                    <span className="text-sm font-medium text-[#2E2A27]">{userData.bidang}</span>
                  </div>
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