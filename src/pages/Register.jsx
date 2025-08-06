import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, User, Briefcase, X, Shield, Building2, UserPlus } from 'lucide-react'
import img from '../assets/img/logobapelit.png'

export default function RegisterPopup({ onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    jabatan: ''
  })
  const [loading, setLoading] = useState(false)
  const { register, user } = useAuth()

  if (user) {
    return <Navigate to="/" />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const success = await register(formData)
    if (success) {
      // Redirect handled by AuthContext
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const jabatanOptions = [
    "Sekretaris",
    "Kasubag Umum dan Kepegawaian",
    "Kasubag Keuangan",
    "Kabid Pendanaan, Pengendalian, dan Evaluasi",
    "Kabid Pemerintahan dan Pembangunan Manusia",
    "Kabid Perekonomian, Infrastruktur, dan Kewilayahan",
    "Kabid Penelitian dan Pengembangan"
  ]

  return (
    <div className="max-w-6xl w-full mx-auto relative">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute -top-4 -right-4 z-50 w-10 h-10 bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <div className="grid md:grid-cols-2 bg-white backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
        {/* Left Side - Form */}
        <div className="p-8 lg:p-10 relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-100/50 to-transparent rounded-full blur-xl"></div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-8">
              
              
              <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Daftar
              </h2>
              <p className="text-gray-500 text-sm">Buat akun untuk mengakses sistem surat masuk</p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Name Input */}
                <div className="group">

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-700 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Nama"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
    
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-700 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 placeholder-gray-700 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm"
                      placeholder="Password"
                    />
                  </div>
                </div>

                {/* Jabatan Select */}
                <div className="group">

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                    </div>
                    <select
                      id="jabatan"
                      name="jabatan"
                      required
                      value={formData.jabatan}
                      onChange={handleChange}
                      className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-200 text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="text-gray-400">Pilih jabatan Anda</option>
                      {jabatanOptions.map((jabatan, index) => (
                        <option key={index} value={jabatan} className="text-gray-900">
                          {jabatan}
                        </option>
                      ))}
                    </select>
                    {/* Custom dropdown arrow */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mendaftar...
                    </>
                  ) : (
                    <>
                      Daftar Sekarang
                      <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Terms & Conditions */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Dengan mendaftar, Anda menyetujui kebijakan penggunaan sistem internal Bapelitbangda
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Information */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50/30 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-200/30 to-transparent rounded-full blur-2xl"></div>

          <div className="relative z-10">
            {/* Logo and Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <img src={img} alt="" className="w-8 h-8 brightness-0 invert" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg leading-tight">
                    Bapelitbangda
                  </h3>
                  <p className="text-gray-600 text-sm">Kota Tasikmalaya</p>
                </div>
              </div>
              
              <h4 className="text-xl font-bold text-gray-800 mb-3">
                Bergabung dengan Tim
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Daftar sebagai pegawai internal untuk mengakses sistem surat masuk Bapelitbangda. 
                Kelola dan monitor surat masuk instansi dengan mudah dan efisien.
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-4 mb-8">
              <h5 className="font-semibold text-gray-800 text-sm">Syarat Pendaftaran:</h5>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">Pegawai resmi Bapelitbangda</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">Email</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-700">Jabatan yang valid</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}