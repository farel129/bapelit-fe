import { useEffect, useState } from 'react';
import { Trash2, Key, Users, Search, AlertTriangle, CheckCircle, X, Eye, EyeOff, Pencil, UserCircle2, Dot, Loader, FileBadge2, Filter, ChevronDown, RefreshCcw } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

// Modal Components
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all border-2 border-[#EDE6E3]">
                    {children}
                </div>
            </div>
        </div>
    );
};

const DeleteModal = ({ isOpen, onClose, onConfirm, userName }) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6 relative">
                <button
                    onClick={onClose}
                    className="p-3 absolute shadow-sm border cursor-pointer transition-all border-[#EDE6E3] -right-5 -top-5 bg-white hover:bg-[#FDFCFB] rounded-full duration-300"
                >
                    <X className="h-5 w-5 text-[#6D4C41]" />
                </button>

            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                    <p className="text-[#2E2A27] font-semibold">Yakin ingin menghapus user ini?</p>
                    <p className="text-[#6D4C41] text-sm mt-1">
                        User <span className="font-bold text-[#2E2A27]">{userName}</span> akan dihapus permanen
                    </p>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">
                    <strong>Peringatan:</strong> Tindakan ini tidak dapat dibatalkan. Semua data yang terkait dengan user ini akan hilang.
                </p>
            </div>

            <div className="flex space-x-3">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-[#2E2A27] bg-white border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] transition-colors font-semibold shadow-sm"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-3 bg-gradient-to-br from-[#D9534F] to-[#B52B27] text-white rounded-xl hover:from-[#B52B27] hover:to-[#8B0000] hover:-translate-y-0.5 cursor-pointer shadow-md transition-all duration-300 font-semibold border border-[#EDE6E3]"
                >
                    Hapus User
                </button>
            </div>
        </div>
    </Modal>
);

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
        <Modal isOpen={isOpen} onClose={handleClose}>
            <div className=' relative'>
                <button
                    onClick={handleClose}
                    className="p-3 absolute bg-white -right-5 cursor-pointer -top-5 hover:bg-[#FDFCFB] shadow-sm border border-[#EDE6E3] rounded-full transition-colors"
                >
                    <X className="h-5 w-5 text-[#6D4C41]" />
                </button>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Key className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[#2E2A27] font-semibold">Reset Password User</p>
                            <p className="text-[#6D4C41] text-sm">
                                Mengubah password untuk <span className="font-bold text-[#2E2A27]">{userName}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-[#6D4C41] mb-2">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-colors pr-12 text-[#2E2A27] shadow-sm ${errors.password ? 'border-red-500' : 'border-[#EDE6E3]'
                                        }`}
                                    placeholder="Masukkan password baru (min 6 karakter)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6D4C41] hover:text-[#2E2A27]"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#6D4C41] mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-colors pr-12 text-[#2E2A27] shadow-sm ${errors.confirmPassword ? 'border-red-500' : 'border-[#EDE6E3]'
                                        }`}
                                    placeholder="Ulangi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6D4C41] hover:text-[#2E2A27]"
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
                            className="flex-1 px-4 py-2 text-[#2E2A27] bg-white border border-[#EDE6E3] rounded-xl hover:bg-[#FDFCFB] transition-colors font-semibold shadow-sm"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-3 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] hover:bg-gradient-to-br hover:from-[#2E7D32] hover:to-[#1B5E20] text-white border-[#EDE6E3] border transition-all duration-300 rounded-xl hover:-translate-y-0.5 shadow-md cursor-pointer font-semibold"
                        >
                            Reset Password
                        </button>
                    </div>
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
    const [notification, setNotification] = useState(null);
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
            const res = await api.get('/admin/akun');
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
            await api.delete(`/admin/akun/${deleteModal.user.id}/delete`);
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
            await api.put(`/admin/akun/${resetPasswordModal.user.id}/reset`, { newPassword });
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
            <div className="min-h-screen flex flex-col items-center justify-center" style={{backgroundColor: '#FDFCFB'}}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
                <span className="ml-2 text-[#6D4C41]">Memuat...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-6 rounded-2xl" style={{backgroundColor: '#FDFCFB'}}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
                    <div>
                        <h1 className="text-xl font-bold" style={{color: '#2E2A27'}}>Daftar User</h1>
                        <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Kelola pengguna sistem</p>
                    </div>
                </div>
                <button
                    onClick={fetchUsers}
                    className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDE6E3] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#6D4C41] opacity-80">Total Admin</p>
                            <p className="text-3xl font-bold text-[#2E2A27] mt-2">{users.filter(u => u.role === 'admin').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] p-3 rounded-xl shadow-md">
                            <UserCircle2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDE6E3] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#6D4C41] opacity-80">Total Kabid</p>
                            <p className="text-3xl font-bold text-[#2E2A27] mt-2">{users.filter(u => u.role === 'user').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] p-3 rounded-xl shadow-md">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EDE6E3] hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#6D4C41] opacity-80">Total Staff</p>
                            <p className="text-3xl font-bold text-[#2E2A27] mt-2">{users.filter(u => u.role === 'staff').length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-[#D4A373] to-[#6D4C41] p-3 rounded-xl shadow-md">
                            <FileBadge2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md mb-6">
                <div className="flex items-center gap-3 mb-4">
                    {/* Search Input */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D4C41]" />
                            <input
                                type="text"
                                placeholder="Cari pengguna..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-[#EDE6E3] rounded-xl focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-colors outline-none text-[#2E2A27] placeholder-[#6D4C41] shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Bidang Filter Dropdown */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D4C41] z-10" />
                        <select
                            value={selectedBidang}
                            onChange={(e) => setSelectedBidang(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-white border border-[#EDE6E3] rounded-xl outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition-colors appearance-none text-[#2E2A27] min-w-[160px] shadow-sm"
                        >
                            <option value="">Semua Bidang</option>
                            {bidangOptions.map((bidang) => (
                                <option key={bidang} value={bidang}>
                                    {bidang}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6D4C41] pointer-events-none" />
                    </div>
                </div>

                {/* Active Filters Display */}
                {(searchTerm || selectedBidang) && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#6D4C41]">Filter aktif:</span>
                        {searchTerm && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs border border-blue-200">
                                Pencarian: "{searchTerm}"
                            </span>
                        )}
                        {selectedBidang && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs border border-green-200">
                                Bidang: {selectedBidang}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-[#EDE6E3] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-[#EDE6E3]">
                                <th className="text-left py-4 px-6 font-semibold text-[#2E2A27]">Pengguna</th>
                                <th className="text-left py-4 px-6 font-semibold text-[#2E2A27]">Jabatan</th>
                                <th className="text-left py-4 px-6 font-semibold text-[#2E2A27]">Bidang</th>
                                <th className="text-center py-4 px-6 font-semibold text-[#2E2A27]">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EDE6E3]">
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-[#FDFCFB] transition-colors relative text-sm">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            {/* Avatar dengan warna berbeda berdasarkan user.name */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm"
                                                style={{
                                                    backgroundColor: `hsl(${(user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137.509) % 360}, 70%, 60%)`,
                                                }}
                                            >
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#2E2A27]">{user.name}</p>
                                                <p className="text-sm text-[#6D4C41]">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-[#2E2A27]">{user.jabatan}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-[#2E2A27]">
                                            {user.bidang}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                className="p-2 hover:bg-[#FDFCFB] rounded-lg transition-colors border border-[#EDE6E3]"
                                            >
                                                <Pencil className="h-4 w-4 text-[#6D4C41]" />
                                            </button>

                                            {activeDropdown === user.id && (
                                                <div className={`absolute z-50 w-48 bg-white rounded-lg shadow-lg border border-[#EDE6E3] py-2 ${
                                                    // Jika ini adalah item terakhir atau kedua terakhir, dropdown muncul ke atas
                                                    index >= filteredUsers.length - 2
                                                        ? 'bottom-full mb-2 right-0'
                                                        : 'top-full mt-2 right-0'
                                                    }`}>
                                                    <div className="flex items-center justify-between px-4 py-2 border-b border-[#EDE6E3]">
                                                        <p className="text-sm font-semibold text-[#2E2A27]">{user.name}</p>
                                                        <button
                                                            onClick={() => setActiveDropdown(null)}
                                                            className="p-1 hover:bg-[#FDFCFB] rounded transition-colors"
                                                        >
                                                            <X className="h-4 w-4 text-[#6D4C41]" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleResetPasswordClick(user)}
                                                        className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-[#FDFCFB] transition-colors"
                                                    >
                                                        <Key className="h-4 w-4 text-[#4CAF50]" />
                                                        <span className="text-[#2E2A27]">Reset Password</span>
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
                        <Users className="h-12 w-12 text-[#6D4C41] mx-auto mb-4" />
                        <p className="text-[#2E2A27] text-lg mb-2">Tidak ada pengguna ditemukan</p>
                        <p className="text-[#6D4C41]">
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