import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  User,
  X,
  Plus,
  Check,
  Loader2,
  CheckCircle,
  Loader,
} from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import Img from '../../assets/img/adminrobot.png'

function AdminTambahUser() {
  const navigate = useNavigate();
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
  const [success, setSuccess] = useState(false);

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
    setSuccess(false);
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
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await api.post('/users', form);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        toast.success('Akun berhasil dibuat!');

        setTimeout(() => {
          closeModal();
          navigate('/admin-daftar-user');
        }, 1500);
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (err) {
      console.error('Error creating user:', err);

      if (err.response) {
        const errorMessage = err.response?.data?.error ||
          err.response?.data?.message ||
          `Server error: ${err.response.status}`;
        toast.error(errorMessage);
      } else if (err.request) {
        toast.error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      } else {
        toast.error('Terjadi kesalahan pada aplikasi: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleOptions = () => {
    switch (selectedRole) {
      case 'kepala':
        return {
          bidang: ['Pimpinan'],
          jabatan: [
            'Kepala Bepelitbangda',
          ]
        };
      case 'sekretaris':
        return {
          bidang: ['Sekretariat'],
          jabatan: [
            'Sekretaris',
          ]
        };
      case 'user':
        return {
          bidang: [
            'Sekretariat',
            'Pendanaan, Pengendalian, dan Evaluasi',
            'Pemerintahan dan Pengembangan Manusia',
            'Perekonomian, Infrastruktur, dan Kewilayahan',
            'Penelitian dan Pengembangan'
          ],
          jabatan: [
            'Kasubag Umum dan Kepegawaian',
            'Kasubag Keuangan',
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
          jabatan: []
        };
      default:
        return { bidang: [], jabatan: [] };
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'kepala':
        return <Shield className="w-6 h-6 text-teal-400" />;
      case 'sekretaris':
        return <Shield className="w-6 h-6 text-teal-400" />;
      case 'user':
        return <Users className="w-6 h-6 text-teal-400" />;
      case 'staff':
        return <User className="w-6 h-6 text-teal-400" />;
      default:
        return <User className="w-6 h-6 text-teal-400" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'kepala':
        return 'Kepala';
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
      case 'kepala':
        return 'Mengelola administrasi dan koordinasi';
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
    <div className="min-h-screen mb-5 flex justify-center items-center p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl w-full">

        <div className="flex flex-col lg:flex-row gap-8 p-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
          <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                <User className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#000000] mb-2">Staff</h3>
                <p className="text-[#6b7280] text-sm mb-4">Staff operasional di berbagai bidang</p>
                <div className="text-xs text-[#6b7280] mb-4">
                  <div className="font-semibold mb-1">Bidang:</div>
                  <div>• Semua bidang tersedia</div>
                  <div>• Jabatan dapat disesuaikan</div>
                </div>
              </div>
              <button
                onClick={() => openModal('staff')}
                className="flex items-center gap-x-2 justify-center w-full py-3 px-6 font-semibold border border-[#e5e7eb] cursor-pointer transition-all duration-200 bg-black text-white rounded-2xl hover:opacity-90 hover:-translate-y-0.5 shadow-md"
              >
                <Plus className='w-4 h-4' />
                Buat Akun Staff
              </button>
            </div>
          </div>

          <div className="flex-shrink-0 w-full lg:w-1/3 flex justify-center">
            <img src={Img} alt="Admin Robot" className="h-64 object-contain" />
          </div>
        </div>

        {/* Modal Form — Disesuaikan dengan style AdminJadwalAcara */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
                    {getRoleIcon(selectedRole)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#000000]">
                      Buat Akun {getRoleLabel(selectedRole)}
                    </h2>
                    <p className="text-sm font-medium text-[#6b7280]">{getRoleDescription(selectedRole)}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  aria-label="Tutup modal"
                  disabled={loading}
                  className="p-2 hover:bg-gray-50 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed border border-gray-200"
                >
                  <X className="w-5 h-5 text-[#000000]" aria-hidden="true" />
                </button>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                      <span>Akun berhasil dibuat! Mengalihkan ke daftar user...</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-semibold text-[#000000]">
                        Nama Lengkap
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={form.name}
                        onChange={handleChange}
                        required
                        disabled={loading || success}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200 text-[#000000] placeholder-[#6b7280] shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-semibold text-[#000000]">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="contoh@email.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        disabled={loading || success}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200 text-[#000000] placeholder-[#6b7280] shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-semibold text-[#000000]">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      placeholder="Masukkan password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      disabled={loading || success}
                      className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200 text-[#000000] placeholder-[#6b7280] shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="bidang" className="block text-sm font-semibold text-[#000000]">
                        Bidang
                      </label>
                      <select
                        id="bidang"
                        name="bidang"
                        value={form.bidang}
                        onChange={handleChange}
                        required
                        disabled={loading || success}
                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200 text-[#000000] shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="" className="text-[#6b7280]">
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
                      <label htmlFor="jabatan" className="block text-sm font-semibold text-[#000000]">
                        Jabatan
                      </label>
                      {selectedRole === 'staff' ? (
                        <input
                          id="jabatan-input"
                          type="text"
                          name="jabatan"
                          placeholder="Masukkan jabatan (contoh: Staff Administrasi)"
                          value={form.jabatan}
                          onChange={handleChange}
                          required
                          disabled={loading || success}
                          className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200 text-[#000000] placeholder-[#6b7280] shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                        />
                      ) : (
                        <select
                          id="jabatan-select"
                          name="jabatan"
                          value={form.jabatan}
                          onChange={handleChange}
                          required
                          disabled={loading || success}
                          className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200 text-[#000000] shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed appearance-none"
                        >
                          <option value="" className="text-[#6b7280]">
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

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={loading}
                      className="flex-1 py-3 px-6 bg-white text-[#000000] border border-[#e5e7eb] rounded-xl font-medium transition-colors duration-200 hover:bg-gray-50 shadow-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                        loading || success
                          ? 'bg-black text-white cursor-not-allowed opacity-75'
                          : 'bg-black text-white hover:opacity-90 shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                          Menyimpan...
                        </>
                      ) : success ? (
                        <>
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