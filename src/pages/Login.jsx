import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, X, Shield, Building2, Eye, EyeOff } from 'lucide-react';
import img from '../assets/img/logobapelit.png';

export default function LoginPopup({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // 👈 Fitur reveal password

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const loggedInUser = await login(form.email, form.password);

      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedInUser.role === 'kepala') {
        navigate('/kepala');
      } else if (loggedInUser.role === 'sekretaris') {
        navigate('/sekretaris');
      } else if (loggedInUser.role === 'user') {
        navigate('/kabid');
      } else if (loggedInUser.role === 'staff') {
        navigate('/staff');
      } else {
        setError('Role tidak dikenali');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute -top-4 cursor-pointer -right-4 z-50 w-10 h-10 bg-black rounded-full shadow-lg border border-[#EDE6E3] flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="grid lg:grid-cols-2 bg-gradient-to-br from-[#FDFCFB] via-[#F8F6F4] to-[#F0EDEA] backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-400/20 border border-[#EDE6E3] overflow-hidden">
        {/* Left Side - Form */}
        <div className="p-8 lg:p-12 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-pink-400/20 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#EDE6E3]/20 to-transparent rounded-full blur-xl"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className='bg-gradient-to-r from-[#2E2A27] via-black to-pink-400 bg-clip-text text-transparent text-xl lg:text-4xl font-extrabold'>
                Halo!
              </h2>
              <p className="text-black text-sm mt-2">Login untuk melanjutkan</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-red-900/30 border border-red-800/50 rounded-xl text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Email Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-black mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-pink-400 group-focus-within:text-black transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="block w-full pl-4 pr-4 py-3 border border-[#EDE6E3] rounded-xl bg-white/60 backdrop-blur-sm placeholder-black/60 text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent focus:bg-white transition-all duration-200 text-sm shadow-sm"
                      placeholder="Masukan email"
                    />
                  </div>
                </div>

                {/* Password Input with Reveal Toggle */}
                <div className="group">
                  <label className="block text-sm font-medium text-black mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-pink-400 group-focus-within:text-black transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="block w-full pl-4 pr-12 py-3 border border-[#EDE6E3] rounded-xl bg-white/60 backdrop-blur-sm placeholder-black/60 text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent focus:bg-white transition-all duration-200 text-sm shadow-sm"
                      placeholder="Masukan password"
                    />
                    {/* Toggle Show/Hide Password Button */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-black transition-colors duration-200"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative cursor-pointer w-full flex justify-center items-center px-6 py-3 bg-black text-white font-semibold rounded-2xl shadow-lg focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-1"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Memverifikasi...
                    </>
                  ) : (
                    <>
                      Masuk
                      <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Information */}
        <div className="hidden bg-gradient-to-br from-[#EDE6E3] to-[#FDFCFB] p-8 lg:p-12 lg:flex flex-col justify-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-black/20 to-transparent rounded-full blur-2xl"></div>

          <div className="relative z-10">
            {/* Logo and Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <img src={img} alt="" className="w-6" />
                <div>
                  <h3 className="font-bold text-[#2E2A27] text-lg leading-tight">
                    Bapelitbangda
                  </h3>
                  <p className="text-black text-sm">Kota Tasikmalaya</p>
                </div>
              </div>

              <p className="text-black leading-relaxed opacity-90">
                Portal ini hanya dapat diakses oleh pegawai internal Bapelitbangda.
                Silakan login menggunakan akun resmi Anda untuk mengelola dan memantau surat instansi.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-white to-[#EDE6E3] rounded-lg flex items-center justify-center border border-pink-400 shadow-sm">
                  <Shield className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm text-black font-medium">Akses Aman & Terenkripsi</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-white to-[#EDE6E3] rounded-lg flex items-center justify-center border border-pink-400 shadow-sm">
                  <Building2 className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm text-black font-medium">Khusus Pegawai Internal</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-white to-[#EDE6E3] rounded-lg flex items-center justify-center border border-pink-400 shadow-sm">
                  <Mail className="w-4 h-4 text-black" />
                </div>
                <span className="text-sm text-black font-medium">Manajemen Surat Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}