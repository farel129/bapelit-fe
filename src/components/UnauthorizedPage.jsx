import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, ArrowLeft, LogIn } from 'lucide-react';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Redirect berdasarkan role user
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'kepala') {
      navigate('/kepala');
    } else if (user?.role === 'sekretaris') {
      navigate('/sekretaris');
    } else if (user?.role === 'staff') {
      navigate('/staff');
    } else if (user?.role === 'user') {
      navigate('/kabid');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5"></div>
      </div>
      
      {/* Main Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white shadow-lg rounded-3xl p-5 text-center">
          {/* Floating elements for visual appeal */}
          <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute -bottom-4 right-6 w-8 h-8 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full opacity-20 blur-lg"></div>
          
          {/* Icon Section */}
          <div className="relative mb-8">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-black to-teal-500 shadow-lg shadow-red-500/25 mb-6 transform hover:scale-105 transition-transform duration-300">
              <Shield className="h-10 w-10 text-white" />
            </div>
            
            {/* Decorative rings */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 border-2 border-red-200 rounded-full animate-pulse"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-28 border border-red-100 rounded-full opacity-50"></div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl uppercase font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Akses Ditolak
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-4 mt-8 text-sm">
            <button
              onClick={handleGoBack}
              className="group w-full bg-gradient-to-r from-black to-gray-800 hover:from-black hover:to-black text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Kembali ke Dashboard</span>
            </button>
            
            <button
              onClick={() => navigate('/login')}
              className="group w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <LogIn className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              <span>Login Ulang</span>
            </button>
          </div>
        </div>
        
        {/* Bottom glow effect */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent blur-xl"></div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;