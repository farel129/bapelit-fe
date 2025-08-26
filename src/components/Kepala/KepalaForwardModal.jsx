import { FileText, Loader, Search, SendHorizontalIcon, X } from "lucide-react";
import { useEffect } from "react";
import { useState } from "react";

const KepalaForwardModal = ({ open, onClose, onSubmit, userOptions, loading }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = userOptions.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.jabatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    if (!acc[user.jabatan]) {
      acc[user.jabatan] = [];
    }
    acc[user.jabatan].push(user);
    return acc;
  }, {});

  const handleUserSelect = (user) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser({ nama: user.name, jabatan: user.jabatan, id: user.id });
    }
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      toast.error('Pilih satu user untuk diteruskan');
      return;
    }
    onSubmit([selectedUser], catatan);
  };

  const resetForm = () => {
    setSelectedUser(null);
    setCatatan('');
    setSearchTerm('');
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-xl border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className='flex items-center gap-3'>
            <div className='p-3 rounded-xl bg-indigo-100 animate-bounce'>
              <SendHorizontalIcon className='w-4 h-4 text-black' />
            </div>
            <h2 className="font-bold text-gray-900 text-lg">Teruskan ke Satu Bawahan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center flex flex-col gap-y-2 items-center justify-center">
              <Loader className='h-8 w-8 animate-spin' />
              <p className="text-gray-500 font-medium">Memuat daftar bawahan...</p>
            </div>
          </div>
        ) : userOptions.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center text-gray-400">
              <FileText className="w-14 h-14 mx-auto mb-3 opacity-60" />
              <p className="font-medium">Tidak ada bawahan dalam bidang yang sama</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6">
              <div className="py-4 sticky top-0 bg-white z-10">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama"
                    className="w-full border text-sm border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedUser && (
                <div className="mb-4 p-4 bg-indigo-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-indigo-700">
                      Dipilih:
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-full text-sm shadow-sm">
                      <span className="truncate max-w-[120px]">{selectedUser.nama}</span>
                      <span className="text-indigo-400">•</span>
                      <span className="truncate max-w-[80px]">{selectedUser.jabatan}</span>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors flex-shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-4 border border-gray-200 rounded-xl bg-gray-50/50 overflow-hidden">
                {Object.keys(groupedUsers).length === 0 ? (
                  <div className="p-6 text-center text-gray-400">
                    Tidak ada user yang sesuai dengan pencarian
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(groupedUsers).map(([jabatan, users]) => (
                      <div key={jabatan} className="border-b border-gray-100 last:border-b-0">
                        <div className="bg-gray-100 px-4 py-2.5 font-semibold text-gray-700 text-sm sticky top-0">
                          {jabatan} <span className="text-gray-500 font-normal">({users.length})</span>
                        </div>
                        {users.map(user => {
                          const isSelected = selectedUser?.id === user.id;
                          return (
                            <label
                              key={user.id}
                              className="flex items-center px-4 py-3 hover:bg-indigo-50/50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              <input
                                type="radio"
                                name="selectedUser"
                                checked={isSelected}
                                onChange={() => handleUserSelect(user)}
                                className="mr-3 w-4 h-4 text-indigo-600 bg-white border-gray-300 focus:ring-indigo-500 focus:ring-2 focus:ring-offset-0 cursor-pointer flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-800 truncate">{user.name}</div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pb-4">
                <label className="block mb-2.5 text-sm font-semibold text-gray-700">
                  Catatan (opsional)
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm transition-all"
                  rows={3}
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan untuk bawahan yang dipilih..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3.5 p-6 pt-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 cursor-pointer rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200 ease-in-out"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl cursor-pointer bg-green-100 border border-black/5 hover:-translate-y-0.5 text-black font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
            disabled={!selectedUser || loading}
          >
            Teruskan
          </button>
        </div>
      </div>
    </div>
  );
};
export default KepalaForwardModal