import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Loader,
  FileText
} from 'lucide-react';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const ForwardModal = ({ isOpen, onClose, disposisi, onSuccess }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Reset form ketika modal dibuka
      setSelectedUserId('');
      setCatatan('');
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/bawahan');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Gagal memuat daftar user');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleForward = async () => {
    if (!selectedUserId) {
      alert('Silakan pilih penerima');
      return;
    }

    if (!user?.role) {
      alert('Role user tidak ditemukan');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(`/${user.role}/disposisi/teruskan/${disposisi.id}`, {
        diteruskan_kepada_user_id: selectedUserId,
        catatan_atasan: catatan
      });

      alert(response.data.message || 'Disposisi berhasil diteruskan');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error forwarding disposisi:', error);
      const message = error.response?.data?.error || 'Gagal meneruskan disposisi';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setCatatan('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 min-h-screen bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-bl from-[#101010] via-[#101010] to-[#202020] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-black/15 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/20">
          <h3 className="text-lg font-semibold text-gray-200">Teruskan Disposisi</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Disposisi */}
          <div className="bg-[#303030] rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-200 mb-2">Disposisi yang akan diteruskan:</h4>
            <p className="text-sm text-gray-300 mb-1">
              <span className="font-medium">Perihal:</span> {disposisi.perihal}
            </p>
            <p className="text-sm text-gray-300">
              <span className="font-medium">Sifat:</span> {disposisi.sifat}
            </p>
          </div>

          {/* Pilih Penerima */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Teruskan Kepada <span className="text-red-400">*</span>
            </label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-4 h-4 animate-spin mr-2 text-gray-200" />
                <span className="text-sm text-gray-300">Memuat daftar user...</span>
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-[#404040] border border-black/20 text-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="" className="bg-[#404040] text-gray-200">Pilih penerima</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="bg-[#404040] text-gray-200">
                    {user.name} - {user.jabatan}
                  </option>
                ))}
              </select>
            )}
            {users.length === 0 && !loadingUsers && (
              <p className="text-sm text-gray-400 mt-1">
                Tidak ada user lain di bidang yang sama
              </p>
            )}
          </div>

          {/* Catatan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Catatan Atasan (Opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan untuk penerima..."
              rows={3}
              className="w-full px-3 py-2 bg-[#404040] border border-black/20 text-gray-200 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Catatan ini akan disimpan sebagai catatan atasan
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-200 bg-[#404040] rounded-lg hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleForward}
              disabled={loading || !selectedUserId || loadingUsers}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-900 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Teruskan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardModal;