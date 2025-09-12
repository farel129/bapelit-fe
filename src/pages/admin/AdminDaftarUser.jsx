import { useEffect, useState } from 'react';
import {
  Trash2,
  Key,
  Users,
  Search,
  AlertTriangle,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Pencil,
  UserCircle2,
  Dot,
  Loader2,
  FileBadge2,
  Filter,
  ChevronDown,
  RefreshCcw,
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

// === Modal Component — Disesuaikan dengan AdminJadwalAcara ===
const Modal = ({ isOpen, onClose, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
        <div className={`relative bg-white rounded-2xl shadow-2xl ${maxWidth} w-full transform transition-all border-2 border-gray-200`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// === Delete Modal ===
const DeleteModal = ({ isOpen, onClose, onConfirm, userName }) => (
  <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
    <div className="p-6 relative">
      <button
        onClick={onClose}
        className="p-2 absolute -top-3 -right-3 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-200 transition-colors"
        aria-label="Tutup"
      >
        <X className="h-5 w-5 text-[#000000]" />
      </button>

      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-red-50 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="text-[#000000] font-semibold">Yakin ingin menghapus user ini?</p>
          <p className="text-[#6b7280] text-sm mt-1">
            User <span className="font-bold text-[#000000]">{userName}</span> akan dihapus permanen.
          </p>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-700 text-sm">
          <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Semua data terkait user ini akan hilang.
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="flex-1 px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
        >
          Batal
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          Hapus User
        </button>
      </div>
    </div>
  </Modal>
);

// === Reset Password Modal ===
const ResetPasswordModal = ({ isOpen, onClose, onConfirm, userName }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePasswords = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Password wajib diisi';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validatePasswords()) {
      onConfirm(password);
      handleClose();
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-md">
      <div className="p-6 relative">
        <button
          onClick={handleClose}
          className="p-2 absolute -top-3 -right-3 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-200 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5 text-[#000000]" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Key className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-[#000000] font-semibold">Reset Password User</p>
            <p className="text-[#6b7280] text-sm">
              Mengubah password untuk <span className="font-bold text-[#000000]">{userName}</span>
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-[#000000] mb-2">
              Password Baru
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-colors pr-12 text-[#000000] shadow-sm ${
                  errors.password ? 'border-red-500' : ''
                }`}
                placeholder="Masukkan password baru (min 6 karakter)"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b7280] hover:text-[#000000]"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#000000] mb-2">
              Konfirmasi Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-colors pr-12 text-[#000000] shadow-sm ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
                placeholder="Ulangi password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6b7280] hover:text-[#000000]"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700 text-sm">
            <strong>Info:</strong> Password baru akan langsung aktif setelah direset. User perlu login ulang menggunakan password baru.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            Reset Password
          </button>
        </div>
      </div>
    </Modal>
  );
};

function AdminDaftarUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBidang, setSelectedBidang] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, user: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/admin/daftar-user');
      if (Array.isArray(res.data.data)) {
        setUsers(res.data.data);
      } else {
        console.error('Data dari /admin/akun bukan array:', res.data);
        setUsers([]);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteModal({ isOpen: true, user });
    setActiveDropdown(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/users/${deleteModal.user.id}`);
      setUsers(users.filter(user => user.id !== deleteModal.user.id));
      toast.success('User berhasil dihapus');
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Gagal menghapus user';
      toast.error(errorMsg);
    }
    setDeleteModal({ isOpen: false, user: null });
  };

  const handleResetPasswordClick = (user) => {
    setResetPasswordModal({ isOpen: true, user });
    setActiveDropdown(null);
  };

  const handleResetPasswordConfirm = async (newPassword) => {
    try {
      await api.put(`/users/${resetPasswordModal.user.id}`, { newPassword });
      toast.success('Password berhasil direset');
    } catch (err) {
      const errorMsg = err?.response?.data?.error || 'Gagal mereset password';
      toast.error(errorMsg);
    }
    setResetPasswordModal({ isOpen: false, user: null });
  };

  // Get unique bidang options
  const bidangOptions = [...new Set(users.map(user => user.bidang).filter(bidang => bidang))].sort();

  // Filter users based on search term and selected bidang
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.jabatan.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBidang = selectedBidang === '' || user.bidang === selectedBidang;

    return matchesSearch && matchesBidang;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600 mx-auto mb-4" />
          <p className="text-[#000000] font-semibold">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 bg-white shadow-lg rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-x-3">
          <div className="p-2 bg-white rounded-xl shadow-lg">
            <Users className="h-6 w-6 text-[#f6339a]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#000000]">Daftar User</h1>
            <p className="text-sm font-medium text-[#6b7280]">Kelola pengguna sistem</p>
          </div>
        </div>
        <button
          onClick={fetchUsers}
          className="px-6 py-3 bg-white hover:bg-gray-50 text-[#000000] border border-[#e5e7eb] rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#f6339a]"
        >
          <RefreshCcw className="w-4 h-4 mr-2 inline" />
          Refresh
        </button>
      </div>

      {/* Stat Cards — Disesuaikan style AdminJadwalAcara */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6b7280] opacity-80">Total Admin</p>
              <p className="text-3xl font-bold text-[#000000] mt-2">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <UserCircle2 className="w-6 h-6 text-[#f6339a]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6b7280] opacity-80">Total Kabid</p>
              <p className="text-3xl font-bold text-[#000000] mt-2">{users.filter(u => u.role === 'user').length}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <Users className="w-6 h-6 text-[#f6339a]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#6b7280] opacity-80">Total Staff</p>
              <p className="text-3xl font-bold text-[#000000] mt-2">{users.filter(u => u.role === 'staff').length}</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
              <FileBadge2 className="w-6 h-6 text-[#f6339a]" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-colors outline-none text-[#000000] placeholder-[#6b7280] shadow-sm"
            />
          </div>

          {/* Bidang Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6b7280] z-10" />
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-[#f6339a] focus:border-transparent transition-colors appearance-none text-[#000000] min-w-[160px] shadow-sm"
            >
              <option value="">Semua Bidang</option>
              {bidangOptions.map((bidang) => (
                <option key={bidang} value={bidang}>
                  {bidang}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6b7280] pointer-events-none" />
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || selectedBidang) && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-[#6b7280]">Filter aktif:</span>
            {searchTerm && (
              <span className="px-3 py-1.5 bg-gray-100 text-[#000000] rounded-full text-xs border border-gray-200">
                Pencarian: "{searchTerm}"
              </span>
            )}
            {selectedBidang && (
              <span className="px-3 py-1.5 bg-gray-100 text-[#000000] rounded-full text-xs border border-gray-200">
                Bidang: {selectedBidang}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-[#000000]">Pengguna</th>
                <th className="text-left py-4 px-6 font-semibold text-[#000000]">Jabatan</th>
                <th className="text-left py-4 px-6 font-semibold text-[#000000]">Bidang</th>
                <th className="text-center py-4 px-6 font-semibold text-[#000000]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors relative text-sm">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      {/* Avatar dengan warna berbeda berdasarkan user.name */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm border border-gray-200"
                        style={{
                          backgroundColor: `hsl(${(user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137.509) % 360}, 70%, 60%)`,
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#000000]">{user.name}</p>
                        <p className="text-sm text-[#6b7280]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#000000]">{user.jabatan}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[#000000]">
                      {user.bidang || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
                        aria-label="Menu aksi"
                      >
                        <Pencil className="h-5 w-5 text-[#6b7280]" />
                      </button>

                      {activeDropdown === user.id && (
                        <div className={`absolute z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${
                          index >= filteredUsers.length - 2 ? 'bottom-full mb-2 right-0' : 'top-full mt-2 right-0'
                        }`}>
                          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-semibold text-[#000000]">{user.name}</p>
                            <button
                              onClick={() => setActiveDropdown(null)}
                              className="p-1 hover:bg-gray-50 rounded transition-colors"
                              aria-label="Tutup menu"
                            >
                              <X className="h-4 w-4 text-[#6b7280]" />
                            </button>
                          </div>
                          <button
                            onClick={() => handleResetPasswordClick(user)}
                            className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                          >
                            <Key className="h-4 w-4 text-[#f6339a]" />
                            <span className="text-[#000000]">Reset Password</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                            <span className="text-red-700">Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-[#6b7280] mx-auto mb-4" />
            <p className="text-[#000000] text-lg mb-2">Tidak ada pengguna ditemukan</p>
            <p className="text-[#6b7280]">
              {searchTerm || selectedBidang
                ? 'Coba ubah kata kunci pencarian atau filter'
                : 'Belum ada data pengguna'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDeleteConfirm}
        userName={deleteModal.user?.name || ''}
      />

      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onClose={() => setResetPasswordModal({ isOpen: false, user: null })}
        onConfirm={handleResetPasswordConfirm}
        userName={resetPasswordModal.user?.name || ''}
      />
    </div>
  );
}

export default AdminDaftarUser;