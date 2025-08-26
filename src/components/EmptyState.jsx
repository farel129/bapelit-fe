import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';

const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Disposisi tidak ditemukan</h3>
        <p className="text-gray-600 mb-4">Data disposisi yang Anda cari tidak tersedia</p>
        <button
          onClick={() => navigate('/kabid')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Kembali ke Daftar
        </button>
      </div>
    </div>
  );
};

export default EmptyState;