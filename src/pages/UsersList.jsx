import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, RefreshCw, Award, Sparkles, Building, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

const UsersList = () => {
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

      const response = await api.get('/users/basic');
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
      'bg-cyan-100',
      'bg-blue-100',
      'bg-green-100',
      'bg-red-100',
      'bg-gray-100'
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-2 justify-center items-center h-screen">
        <Loader className='w-8 h-8 animate-spin' />
        <p>Memuat</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-8">
        <div className='p-5 rounded-3xl shadow-lg bg-gradient-to-tl from-gray-50 via-white to-gray-50 border border-black/5 space-y-5'>
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div className='flex gap-x-2 items-center'>
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#fff] rounded-2xl shadow-lg border border-black/5">
                  <Users className="w-6 h-6 text-black" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#262628] mb-1">Daftar User</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400 font-medium">User Management</span>
            </div>
          </div>

          {/* Elegant Stats Cards */}
          <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-blue-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 animate-bounce bg-red-100 rounded-xl shadow-lg">
                    <Users className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercaser">
                    Total User
                  </p>
                  <p className="text-base font-bold text-[#262628] ">
                    {users.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-green-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 animate-bounce bg-green-100 rounded-xl shadow-lg">
                    <Building className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercaser">
                    Bidang Unik
                  </p>
                  <p className="text-base font-bold text-[#262628] ">
                    {uniqueBidang.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-fuchsia-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-yellow-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 animate-bounce bg-fuchsia-100 rounded-xl shadow-lg">
                    <Filter className="h-4 w-4 text-fuchsia-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-black animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500 uppercaser">
                    Hasil Filter
                  </p>
                  <p className="text-base font-bold text-[#262628] ">
                    {filteredUsers.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refined Search and Filter */}
        <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100 overflow-hidden p-5 space-y-6">
          <h2 className="text-lg font-medium text-[#262628] flex items-center mb-5">
            <div className="p-3 animate-bounce bg-purple-100 rounded-xl mr-2 shadow-lg">
              <Users className="w-4 h-4 text-black" />
            </div>
            Daftar Pengguna Sistem
          </h2>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Cari nama ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white text-sm rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#262628] focus:border-transparent transition-all duration-300 shadow-lg"
                />
              </div>

              <div className="relative text-sm">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterBidang}
                  onChange={(e) => setFilterBidang(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-200 focus:ring-2 focus:ring-[#262628] focus:border-transparent transition-all duration-300 shadow-lg appearance-none cursor-pointer"
                >
                  <option value="">Semua Bidang</option>
                  {uniqueBidang.map(bidang => (
                    <option key={bidang} value={bidang}>{bidang}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group relative text-sm inline-flex items-center justify-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-black font-medium rounded-2xl shadow-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <RefreshCw className={`w-5 h-5 mr-3 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 font-medium">
              Menampilkan: <span className="text-[#262628] font-semibold">{filteredUsers.length}</span> dari <span className="text-[#262628] font-semibold">{users.length}</span> user
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercaser">User</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-600 uppercaser">Bidang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.map((userData, index) => (
                  <tr
                    key={userData.id}
                    className={`group transition-all duration-300 ${user && userData.id === user.id
                      ? 'bg-gradient-to-r from-gray-50 to-white border-l-4 border-[#262628] shadow-lg'
                      : 'hover:bg-gradient-to-r hover:from-gray-25 hover:to-white'
                      }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div>
                          <div className={`w-12 h-12 ${getAvatarColor(userData.name)} rounded-full flex items-center justify-center text-black font-semibold text-xs shadow-lg mr-4`}>
                            {getUserInitials(userData.name)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#262628] flex items-center">
                            {userData.name}
                            {user && userData.id === user.id && (
                              <span className=" ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#262628] text-white shadow-lg">
                                <Award className="w-3 h-3" />
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Jabatan: {userData.jabatan || 'Tidak diketahui'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <Building className="w-4 h-4 text-gray-400 mr-3" />
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                          {userData.bidang}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-8 py-16 text-center text-gray-500">
                      <div className="flex flex-col items-center space-y-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                          <Users className="w-12 h-12 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-light text-[#262628] mb-2">
                            {searchTerm || filterBidang ? 'Tidak ada hasil' : 'Belum ada user'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {searchTerm || filterBidang
                              ? 'Coba sesuaikan kata kunci pencarian atau filter yang Anda gunakan.'
                              : 'Belum ada pengguna yang terdaftar dalam sistem.'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>        
      </div>
    </div>
  );
};

export default UsersList;