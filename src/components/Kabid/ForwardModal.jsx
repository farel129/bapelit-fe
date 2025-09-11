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
      const bawahanResponse = await api.get('/disposisi/atasan/list-bawahan');
      setUsers(bawahanResponse.data.data || []);
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
      const response = await api.post(`/disposisi/atasan/${user.role}/teruskan/${disposisi.id}`, {
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
    <div className="fixed inset-0 min-h-screen bg-gradient-to-br from-[#2E2A27]/60 via-[#6D4C41]/40 to-[#D4A373]/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-[#FDFCFB] via-[#F8F6F4] to-[#F0EDEA] rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#EDE6E3] shadow-2xl shadow-[#D4A373]/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EDE6E3]">
          <h3 className="text-lg font-semibold text-[#2E2A27]">Teruskan Disposisi</h3>
          <button
            onClick={handleClose}
            className="text-[#6D4C41] hover:text-[#2E2A27] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Info Disposisi */}
          <div className="bg-gradient-to-br from-white to-[#FDFCFB] rounded-lg p-4 mb-6 border border-[#EDE6E3] shadow-sm">
            <h4 className="font-medium text-[#2E2A27] mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4A373]" />
              Disposisi yang akan diteruskan:
            </h4>
            <p className="text-sm text-[#6D4C41] mb-1">
              <span className="font-medium">Perihal:</span> {disposisi.perihal}
            </p>
            <p className="text-sm text-[#6D4C41]">
              <span className="font-medium">Sifat:</span> {disposisi.sifat}
            </p>
          </div>

          {/* Pilih Penerima */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#6D4C41] mb-2">
              Teruskan Kepada <span className="text-red-500">*</span>
            </label>
            {loadingUsers ? (
              <div className="flex items-center justify-center py-4 bg-white/60 backdrop-blur-sm rounded-lg border border-[#EDE6E3]">
                <Loader className="w-4 h-4 animate-spin mr-2 text-[#6D4C41]" />
                <span className="text-sm text-[#6D4C41]">Memuat daftar user...</span>
              </div>
            ) : (
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-[#EDE6E3] text-[#2E2A27] rounded-lg focus:ring-2 focus:ring-[#D4A373] focus:border-transparent shadow-sm"
                disabled={loading}
              >
                <option value="" className="bg-white text-[#2E2A27]">Pilih penerima</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id} className="bg-white text-[#2E2A27]">
                    {user.name} - {user.jabatan}
                  </option>
                ))}
              </select>
            )}
            {users.length === 0 && !loadingUsers && (
              <p className="text-sm text-[#6D4C41]/70 mt-1">
                Tidak ada user lain di bidang yang sama
              </p>
            )}
          </div>

          {/* Catatan */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#6D4C41] mb-2">
              Catatan Atasan (Opsional)
            </label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tambahkan catatan untuk penerima..."
              rows={3}
              className="w-full px-3 py-2 bg-white/60 backdrop-blur-sm border border-[#EDE6E3] text-[#2E2A27] placeholder-[#6D4C41]/60 rounded-lg focus:ring-2 focus:ring-[#D4A373] focus:border-transparent resize-none shadow-sm"
              disabled={loading}
            />
            <p className="text-xs text-[#6D4C41]/70 mt-1">
              Catatan ini akan disimpan sebagai catatan atasan
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-[#6D4C41] bg-gradient-to-br from-white to-[#FDFCFB] rounded-lg hover:from-[#FDFCFB] hover:to-[#EDE6E3] border border-[#EDE6E3] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Batal
            </button>
            <button
              onClick={handleForward}
              disabled={loading || !selectedUserId || loadingUsers}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white rounded-lg disabled:from-[#EDE6E3] disabled:to-[#D4A373] disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl border border-[#EDE6E3]"
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