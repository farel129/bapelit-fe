import React, { useState } from 'react';
import { api } from '../../utils/api';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBuatSuratKeluar = () => {
  const [formData, setFormData] = useState({
    nama_surat: '',
    tanggal_surat: '',
    ditujukan_ke: '',
    keterangan: ''
  });
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      files.forEach(file => {
        formDataToSend.append('lampiran', file);
      });

      const response = await api.post('/surat-keluar', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(response.data.message);
      
      setFormData({
        nama_surat: '',
        tanggal_surat: '',
        ditujukan_ke: '',
        keterangan: ''
      });
      setFiles([]);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal membuat surat keluar';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
      <div className="flex items-center gap-x-3 mb-6">
        <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{color: '#2E2A27'}}>Buat Surat Keluar</h2>
          <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Form pembuatan surat keluar baru</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
              Nama Surat <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              name="nama_surat"
              value={formData.nama_surat}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition shadow-sm"
              placeholder="Masukkan nama surat"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
              Tanggal Surat <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              name="tanggal_surat"
              value={formData.tanggal_surat}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
            Ditujukan Ke <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="ditujukan_ke"
            value={formData.ditujukan_ke}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition shadow-sm"
            placeholder="Masukkan tujuan surat"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
            Keterangan
          </label>
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition shadow-sm"
            placeholder="Tambahkan keterangan (opsional)"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{color: '#6D4C41'}}>
            Lampiran (Foto/PDF) <span className="text-red-600">*</span>
          </label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            multiple
            required
            className="w-full px-4 py-3 bg-white border border-[#EDE6E3] rounded-xl text-[#2E2A27] focus:ring-2 focus:ring-[#D4A373] focus:border-[#D4A373] transition shadow-sm file:bg-gradient-to-br file:from-[#D4A373] file:to-[#6D4C41] file:text-white file:border-0 file:px-4 file:py-2 file:mr-3 file:rounded-lg file:font-semibold"
          />
          <p className="text-sm mt-2" style={{color: '#6D4C41'}}>
            Pilih minimal 1 file (maksimal 10 file)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 shadow-md border border-[#EDE6E3] ${
            loading
              ? 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] text-white cursor-not-allowed opacity-75'
              : 'bg-gradient-to-br from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white hover:shadow-lg hover:-translate-y-0.5'
          }`}
        >
          {loading ? 'Menyimpan...' : 'Buat Surat Keluar'}
        </button>
      </form>
    </div>
  );
};

export default AdminBuatSuratKeluar;