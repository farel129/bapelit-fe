import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, X, Shield, Building2 } from 'lucide-react'
import img from '../assets/img/logobapelit.png'

export default function LoginPopup({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      } else if (loggedInUser.role === 'sekretaris') {
        navigate('/sekretaris');
      } else if (loggedInUser.role === 'user') {
        navigate('/');
      } else if (loggedInUser.role === 'staff') {
        navigate('/staff'); // Ganti '/staff' sesuai rute halaman staff kamu
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
        className="absolute -top-4 cursor-pointer -right-4 z-50 w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <div className="grid md:grid-cols-2 bg-white backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
        {/* Left Side - Form */}
        <div className="p-8 lg:p-12 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-100/50 to-transparent rounded-full blur-xl"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className='bg-gradient-to-r text-xl lg:text-4xl font-extrabold text-[#262628]'>
                Halo!
              </h2>
              <p className="text-gray-500 text-sm">Login untuk melanjutkan</p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Email Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Masukan email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={form.password}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Masukan password"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative cursor-pointer w-full flex justify-center items-center px-6 py-3 bg-[#fff] text-black font-semibold rounded-2xl shadow-lg border border-black/5 hover:shadow-xl hover:shadow-black/25 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
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
        <div className="bg-gradient-to-br from-gray-50 to-cyan-50/30 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-200/30 to-transparent rounded-full blur-2xl"></div>

          <div className="relative z-10">
            {/* Logo and Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                  <img src={img} alt="" className="w-6 brightness-0" />
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    Bapelitbangda
                  </h3>
                  <p className="text-gray-600 text-sm">Kota Tasikmalaya</p>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                Portal ini hanya dapat diakses oleh pegawai internal Bapelitbangda.
                Silakan login menggunakan akun resmi Anda untuk mengelola dan memantau surat masuk instansi.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Akses Aman & Terenkripsi</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Khusus Pegawai Internal</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Manajemen Surat Real-time</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}