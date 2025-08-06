import { useEffect, useState } from 'react';
import { Trash2, Key, Users, Search, AlertTriangle, CheckCircle, X, Eye, EyeOff, Pencil, UserCircle2, Dot, Loader, FileBadge2, Filter, ChevronDown } from 'lucide-react';
import Admin from '../assets/img/admindaftaruser.png'
import { api } from '../utils/api';

// Modal Components
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full transform transition-all">
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
                    className="p-3 absolute shadow-lg border cursor-pointer transition-all border-black/5 -right-5 -top-5 bg-gray-100 hover:bg-gray-200 rounded-full duration-300"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

            <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-xl animate-bounce">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                    <p className="text-gray-900 font-medium">Yakin ingin menghapus user ini?</p>
                    <p className="text-gray-600 text-sm mt-1">
                        User <span className="font-semibold">{userName}</span> akan dihapus permanen
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
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                    Batal
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 px-4 py-3 bg-red-100 text-black rounded-lg hover:bg-red-200 hover:-translate-y-0.5 cursor-pointer shadow-lg transition-all duration-300 font-medium"
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
                    className="p-3 absolute bg-gray-100 -right-5 cursor-pointer -top-5 hover:bg-gray-200 shadow-lg border border-black/5 rounded-full transition-colors"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-blue-100 animate-bounce rounded-xl">
                            <Key className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-gray-900 font-medium">Reset Password User</p>
                            <p className="text-gray-600 text-sm">
                                Mengubah password untuk <span className="font-bold">{userName}</span>
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password Baru
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${errors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Masukkan password baru (min 6 karakter)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-12 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Ulangi password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
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
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 px-4 py-3 bg-green-100 hover:bg-green-200 text-black border-black/5 border transition-all duration-300 rounded-xl hover:-translate-y-0.5 shadow-lg cursor-pointer font-medium"
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
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                if (Array.isArray(res.data.data)) {
                    setUsers(res.data.data);
                } else {
                    console.error('Data dari /users bukan array:', res.data);
                    setUsers([]);
                }
            } catch (err) {
                console.error(err);
                setUsers([]);
                showNotification('Gagal memuat data pengguna', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleDeleteClick = (user) => {
        setDeleteModal({ isOpen: true, user });
        setActiveDropdown(null);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/admin/users/${deleteModal.user.id}`);
            setUsers(users.filter(user => user.id !== deleteModal.user.id));
            showNotification('User berhasil dihapus', 'success');
        } catch (err) {
            const errorMsg = err?.response?.data?.error || 'Gagal menghapus user';
            showNotification(errorMsg, 'error');
        }
        setDeleteModal({ isOpen: false, user: null });
    };

    const handleResetPasswordClick = (user) => {
        setResetPasswordModal({ isOpen: true, user });
        setActiveDropdown(null);
    };

    const handleResetPasswordConfirm = async (newPassword) => {
        try {
            await api.put(`/admin/users/${resetPasswordModal.user.id}/reset-password`, { newPassword });
            showNotification('Password berhasil direset', 'success');
        } catch (err) {
            const errorMsg = err?.response?.data?.error || 'Gagal mereset password';
            showNotification(errorMsg, 'error');
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
            <div className="min-h-screen flex flex-col items-center justify-center">
                <Loader className='text-[#262628] w-8 h-8 animate-spin' />
                <p className="text-gray-600">Memuat</p>
            </div>
        );
    }

    return (
        <div className="">
            {/* Header */}
            <div className="flex justify-between bg-gradient-to-tl from-gray-50 via-white to-gray-50 p-5 rounded-2xl mb-6 overflow-hidden shadow-lg border border-black/5">
                <div className='flex flex-col gap-y-2 '>
                    <h1 className="text-xl font-bold text-[#262628]">Daftar User</h1>
                    <div className='flex relative'>
                        <div className="inline-flex items-center rounded-full justify-center w-10 h-10 bg-gray-300 shadow-lg">
                            <UserCircle2 className="w-4 h-4 text-[#262628]" />
                        </div>
                        <div className="inline-flex absolute ml-7 items-center rounded-full justify-center w-10 h-10 bg-[#fff] shadow-lg">
                            <FileBadge2 className="w-4 h-4 text-[#262628]" />
                        </div>
                    </div>

                    {/* Search and Filter Section */}
                    <div className="flex items-center gap-3 mt-5">
                        {/* Search Input */}
                        <div className="bg-white rounded-full shadow-sm">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari pengguna..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors outline-none"
                                />
                            </div>
                        </div>

                        {/* Bidang Filter Dropdown */}
                        <div className="bg-white rounded-full shadow-sm">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={selectedBidang}
                                    onChange={(e) => setSelectedBidang(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none bg-white min-w-[160px]"
                                >
                                    <option value="">Semua Bidang</option>
                                    {bidangOptions.map((bidang) => (
                                        <option key={bidang} value={bidang}>
                                            {bidang}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || selectedBidang) && (
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-gray-500">Filter aktif:</span>
                            {searchTerm && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                    Pencarian: "{searchTerm}"
                                </span>
                            )}
                            {selectedBidang && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    Bidang: {selectedBidang}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className='flex items-center gap-x-3'>
                    <div className="grid grid-cols-1 gap-2">
                        <div className="bg-transparent border-2 border-white rounded-xl shadow-sm p-3">
                            <div className="flex items-center justify-between gap-x-5">
                                <div className='flex items-center gap-x-3'>
                                    <p className="text-sm font-bold text-[#7e7e7e]">Total Admin</p>
                                    <p className="text-sm font-bold text-[#7e7e7e]">
                                        {users.filter(u => u.role === 'admin').length}
                                    </p>
                                </div>
                                <div className="">
                                    <Dot className="h-6 w-6 text-[#7e7e7e]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-transparent border-2 border-white rounded-xl shadow-sm p-3">
                            <div className="flex items-center justify-between gap-x-5">
                                <div className='flex items-center gap-x-3'>
                                    <p className="text-sm font-bold text-[#7e7e7e]">Total Kabid</p>
                                    <p className="text-sm font-bold text-[#7e7e7e]">
                                        {users.filter(u => u.role === 'user').length}
                                    </p>
                                </div>
                                <div className="">
                                    <Dot className="h-6 w-6 text-[#7e7e7e]" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-transparent border-2 border-white rounded-xl shadow-sm p-3">
                            <div className="flex items-center gap-x-5 justify-between">
                                <div className='flex items-center gap-x-3'>
                                    <p className="text-sm font-bold text-[#7e7e7e]">Total Staff</p>
                                    <p className="text-sm font-bold text-[#7e7e7e]">
                                        {users.filter(u => u.role === 'staff').length}
                                    </p>
                                </div>
                                <div className="">
                                    <Dot className="h-6 w-6 text-[#7e7e7e]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='w-50 h-full relative'>
                        <div className='w-50 h-50 bg-white absolute rounded-full border-40 border-purple-100'></div>
                        <div className='w-10 self-start h-10 bg-[#999999] absolute rounded-full animate-bounce flex justify-center items-center'><UserCircle2 className='text-white w-6 h-6' /></div>
                        <img src={Admin} alt="Admin Dashboard" className='z-20 absolute h-60 -top-6' />
                    </div>
                </div>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300 ${notification.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                    <div className="flex items-center space-x-2">
                        {notification.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <p className="font-medium">{notification.message}</p>
                    </div>
                </div>
            )}

            <div className="mt-6">
                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-lg border border-black/5 mb-10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Pengguna</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Jabatan</th>
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Bidang</th>
                                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors relative text-xs">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                {/* Avatar dengan warna berbeda berdasarkan user.name */}
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-black font-semibold text-sm"
                                                    style={{
                                                        backgroundColor: `hsl(${(user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 137.509) % 360}, 70%, 94%)`, // Menggunakan hash nama untuk warna
                                                    }}
                                                >
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-900">{user.jabatan}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-gray-900">
                                                {user.bidang}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Pencil className="h-4 w-4 text-gray-500" />
                                                </button>

                                                {activeDropdown === user.id && (
                                                    <div className={`absolute z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 ${
                                                        // Jika ini adalah item terakhir atau kedua terakhir, dropdown muncul ke atas
                                                        index >= filteredUsers.length - 2
                                                            ? 'bottom-full mb-2 right-0'
                                                            : 'top-full mt-2 right-0'
                                                        }`}>
                                                        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                            <button
                                                                onClick={() => setActiveDropdown(null)}
                                                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <X className="h-4 w-4 text-gray-400" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => handleResetPasswordClick(user)}
                                                            className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Key className="h-4 w-4 text-blue-500" />
                                                            <span className="text-gray-700">Reset Password</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(user)}
                                                            className="flex items-center space-x-2 w-full text-left px-4 py-2 hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
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
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-2">Tidak ada pengguna ditemukan</p>
                            <p className="text-gray-400">
                                {searchTerm || selectedBidang
                                    ? 'Coba ubah kata kunci pencarian atau filter'
                                    : 'Belum ada data pengguna'
                                }
                            </p>
                        </div>
                    )}
                </div>
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