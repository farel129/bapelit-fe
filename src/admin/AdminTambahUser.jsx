import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Tambahkan import ini
import { Pencil, UserCircle2, Users, Shield, User, X, Plus, Check, Loader, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';
import Admin from '../assets/img/adminrobot.png';

function AdminTambahUser() {
  const navigate = useNavigate(); // Tambahkan ini
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    jabatan: '',
    role: '',
    bidang: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // Tambahkan state success

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openModal = (role) => {
    setSelectedRole(role);
    setForm({
      name: '',
      email: '',
      password: '',
      jabatan: '',
      role: role,
      bidang: ''
    });
    setShowModal(true);
    setError(null);
    setSuccess(false); // Reset success state
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRole(null);
    setForm({
      name: '',
      email: '',
      password: '',
      jabatan: '',
      role: '',
      bidang: ''
    });
    setError(null);
    setSuccess(false); // Reset success state
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/admin/users', form);

      // Log untuk debugging (bisa dihapus di production)
      console.log('Response:', response);

      // Cek apakah response menunjukkan sukses
      if (response.status === 200 || response.status === 201) {
        setSuccess(true);

        // Delay sebentar untuk menunjukkan pesan sukses
        setTimeout(() => {
          closeModal();
          navigate('/admin-daftar-user');
        }, 1500);

      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }

    } catch (err) {
      console.error('Error creating user:', err);

      // Handling error yang lebih spesifik
      if (err.response) {
        // Error dari server API
        const errorMessage = err.response?.data?.error ||
          err.response?.data?.message ||
          `Server error: ${err.response.status}`;
        setError(errorMessage);
      } else if (err.request) {
        // Network error - tidak ada response dari server
        setError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        // Error JavaScript lainnya
        setError('Terjadi kesalahan pada aplikasi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    switch (selectedRole) {
      case 'sekretaris':
        return {
          bidang: ['Sekretariat'],
          jabatan: [
            'Sekretaris',
            'Kasubag Umum dan Kepegawaian',
            'Kasubag Keuangan'
          ]
        };
      case 'user':
        return {
          bidang: [
            'Pendanaan, Pengendalian, dan Evaluasi',
            'Pemerintahan dan Pengembangan Manusia',
            'Perekonomian, Infrastruktur, dan Kewilayahan',
            'Penelitian dan Pengembangan'
          ],
          jabatan: [
            'Kabid Pendanaan, Pengendalian, dan Evaluasi',
            'Kabid Pemerintahan dan Pengembangan Manusia',
            'Kabid Perekonomian, Infrastruktur, dan Kewilayahan',
            'Kabid Penelitian dan Pengembangan'
          ]
        };
      case 'staff':
        return {
          bidang: [
            'Sekretariat',
            'Pendanaan, Pengendalian, dan Evaluasi',
            'Pemerintahan dan Pengembangan Manusia',
            'Perekonomian, Infrastruktur, dan Kewilayahan',
            'Penelitian dan Pengembangan'
          ],
          jabatan: [] // Manual input for staff
        };
      default:
        return { bidang: [], jabatan: [] };
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'sekretaris':
        return <Shield className="w-6 h-6" />;
      case 'user':
        return <Users className="w-6 h-6" />;
      case 'staff':
        return <User className="w-6 h-6" />;
      default:
        return <User className="w-6 h-6" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'sekretaris':
        return 'Sekretaris';
      case 'user':
        return 'Kabid';
      case 'staff':
        return 'Staff';
      default:
        return 'User';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'sekretaris':
        return 'Mengelola administrasi dan koordinasi';
      case 'user':
        return 'Kepala bidang dengan akses penuh';
      case 'staff':
        return 'Staff operasional di berbagai bidang';
      default:
        return '';
    }
  };

  const roleOptions = getRoleOptions();

  return (
    <div className="min-h-screen mb-5 flex justify-center items-center">
      <div className="">

        {/* Sekretaris Card */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Sekretaris</h3>
                <p className="text-gray-600 text-sm mb-4">Mengelola administrasi dan koordinasi</p>
                <div className="text-xs text-gray-500 mb-4">
                  <div className="font-medium mb-1">Bidang:</div>
                  <div>• Sekretariat</div>
                </div>
              </div>
              <button
                onClick={() => openModal('sekretaris')}
                className="w-full text-sm py-3 px-4 bg-[#262628] text-white rounded-2xl hover:bg-[#262628] transition-colors duration-200 font-medium"
              >
                Buat Akun Sekretaris
              </button>
            </div>
          </div> */}

        {/* Kabid Card */}
        {/* <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Kabid</h3>
                <p className="text-gray-600 text-sm mb-4">Kepala bidang dengan akses penuh</p>
                <div className="text-xs text-gray-500 mb-4">
                  <div className="font-medium mb-1">Bidang:</div>
                  <div>• Pendanaan & Evaluasi</div>
                  <div>• Pemerintahan & SDM</div>
                  <div>• Perekonomian & Infrastruktur</div>
                  <div>• Penelitian & Pengembangan</div>
                </div>
              </div>
              <button
                onClick={() => openModal('user')}
                className="w-full text-sm py-3 px-4 bg-[#262628] text-white rounded-2xl hover:bg-[#262628] transition-colors duration-200 font-medium"
              >
                Buat Akun Kabid
              </button>
            </div>
          </div> */}

        <div className='flex gap-x-4 p-8 bg-gradient-to-tl from-gray-50 via-white to-gray-50 rounded-3xl shadow-lg border border-black/5'>
          {/* Staff Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 animate-bounce bg-pink-100 rounded-full">
                <User className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Staff</h3>
                <p className="text-gray-600 text-sm mb-4">Staff operasional di berbagai bidang</p>
                <div className="text-xs text-gray-500 mb-4">
                  <div className="font-medium mb-1">Bidang:</div>
                  <div>• Semua bidang tersedia</div>
                  <div>• Jabatan dapat disesuaikan</div>
                </div>
              </div>
              <button
                onClick={() => openModal('staff')}
                className=" flex items-center gap-x-2 justify-center w-full py-3 px-6 border font-bold border-black/5 shadow-lg cursor-pointer transition-all duration-300 bg-white text-sm text-black rounded-xl hover:-translate-y-0.5"
              >
                <Plus className=' w-4 h-4' />
                Buat Akun Staff
              </button>
            </div>
          </div>

          <img src={Admin} alt="" className='h-70' />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {/* Latar belakang ikon tetap indigo-100 seperti sebelumnya */}
                  <div className="p-2 rounded-xl animate-bounce text-black bg-red-100">
                    {getRoleIcon(selectedRole)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Buat Akun {getRoleLabel(selectedRole)}
                    </h2>
                    <p className="text-sm text-gray-600">{getRoleDescription(selectedRole)}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Tutup modal" // Menambahkan aria-label untuk aksesibilitas
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-2xl transition-colors duration-200 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Success Message */}
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                      {/* Menggunakan ikon CheckCircle dari lucide-react */}
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" aria-hidden="true" />
                      <span>Akun berhasil dibuat! Mengalihkan ke daftar user...</span>
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-slate-700"> {/* Menambahkan htmlFor */}
                        Nama Lengkap
                      </label>
                      <input
                        id="name" // Menambahkan id untuk aksesibilitas
                        type="text"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={loading || success}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-200 text-slate-700 placeholder-slate-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700"> {/* Menambahkan htmlFor */}
                        Email
                      </label>
                      <input
                        id="email" // Menambahkan id untuk aksesibilitas
                        type="email"
                        name="email"
                        placeholder="contoh@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={loading || success}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-200 text-slate-700 placeholder-slate-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700"> {/* Menambahkan htmlFor */}
                      Password
                    </label>
                    <input
                      id="password" // Menambahkan id untuk aksesibilitas
                      type="password"
                      name="password"
                      placeholder="Masukkan password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-200 text-slate-700 placeholder-slate-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Role-specific fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="bidang" className="block text-sm font-medium text-slate-700"> {/* Menambahkan htmlFor */}
                        Bidang
                      </label>
                      <select
                        id="bidang" // Menambahkan id untuk aksesibilitas
                        name="bidang"
                        value={form.bidang}
                        onChange={handleChange}
                        required
                        disabled={loading || success}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-200 text-slate-700 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="" className="text-slate-400">
                          Pilih Bidang
                        </option>
                        {roleOptions.bidang.map((bidang) => (
                          <option key={bidang} value={bidang}>
                            {bidang}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="jabatan" className="block text-sm font-medium text-slate-700"> {/* Menambahkan htmlFor */}
                        Jabatan
                      </label>
                      {selectedRole === 'staff' ? (
                        <input
                          id="jabatan-input" // Menambahkan id untuk aksesibilitas
                          type="text"
                          name="jabatan"
                          placeholder="Masukkan jabatan (contoh: Staff Administrasi)"
                          value={form.jabatan}
                          onChange={handleChange}
                          required
                          disabled={loading || success}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-200 text-slate-700 placeholder-slate-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      ) : (
                        <select
                          id="jabatan-select" // Menambahkan id untuk aksesibilitas
                          name="jabatan"
                          value={form.jabatan}
                          onChange={handleChange}
                          required
                          disabled={loading || success}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-slate-200 focus:border-slate-400 outline-none transition-all duration-200 text-slate-700 bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                        >
                          <option value="" className="text-slate-400">
                            Pilih Jabatan
                          </option>
                          {roleOptions.jabatan.map((jabatan) => (
                            <option key={jabatan} value={jabatan}>
                              {jabatan}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={loading}
                      className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 rounded-2xl font-medium transition-colors duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 cursor-pointer hover:bg-gray-200" // Gaya tombol batal diperbaiki
                    >
                      Batal
                    </button>
                    {/* Tombol Simpan dengan warna tetap seperti sebelumnya */}
                    <button
                      type="submit"
                      disabled={loading || success}
                      className={`flex-1 py-3 px-6 rounded-2xl shadow-lg border border-black/5 cursor-pointer font-medium text-black transition-all duration-200 flex items-center justify-center ${loading || success
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-white hover:-translate-y-0.5' // Warna tetap seperti kode asli
                        }`}
                    >
                      {loading ? (
                        <>
                          {/* Menggunakan ikon Loader2 dari lucide-react dengan animasi spin */}
                          <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Menyimpan...
                        </>
                      ) : success ? (
                        <>
                          {/* Menggunakan ikon Check dari lucide-react */}
                          <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                          Berhasil!
                        </>
                      ) : (
                        `Simpan ${getRoleLabel(selectedRole)}`
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTambahUser;