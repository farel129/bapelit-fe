import React, { useState } from 'react';
import { api } from '../../utils/api';
import {
  FileText, AlertCircle, CheckCircle, Upload, Plus, X, Eye, FileIcon, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminBuatSuratKeluar = () => {
  const [formData, setFormData] = useState({
    nama_surat: '',
    tanggal_surat: '',
    ditujukan_ke: '',
    keterangan: ''
  });

  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, imageUrl: '', index: null, isPdf: false });

  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File ${file.name}: Hanya file gambar dan PDF yang diizinkan!`);
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name}: Ukuran maksimal 5MB!`);
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    if (files.length + newFiles.length > MAX_FILES) {
      toast.error(`Maksimal ${MAX_FILES} file!`);
      return;
    }

    const validFiles = newFiles.filter(validateFile);
    if (validFiles.length === 0) return;

    const updatedFiles = [...files, ...validFiles];
    setFiles(updatedFiles);

    const newUrls = [...previewUrls];
    validFiles.forEach((file, index) => {
      if (file.type === 'application/pdf') {
        newUrls[files.length + index] = null;
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          newUrls[files.length + index] = e.target.result;
          setPreviewUrls([...newUrls]);
        };
        reader.readAsDataURL(file);
      }
    });

    e.target.value = '';
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const openPreviewModal = (url, index) => {
    const file = files[index];
    const isPdf = file && file.type === 'application/pdf';

    if (isPdf) {
      const fileUrl = URL.createObjectURL(file);
      setPreviewModal({ isOpen: true, imageUrl: fileUrl, index, isPdf: true });
    } else {
      setPreviewModal({ isOpen: true, imageUrl: url, index, isPdf: false });
    }
  };

  const closePreviewModal = () => {
    if (previewModal.isPdf && previewModal.imageUrl) {
      URL.revokeObjectURL(previewModal.imageUrl);
    }
    setPreviewModal({ isOpen: false, imageUrl: '', index: null, isPdf: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_surat || !formData.tanggal_surat || !formData.ditujukan_ke) {
      toast.error("Lengkapi semua data wajib!");
      return;
    }

    if (files.length === 0) {
      toast.error("Unggah minimal 1 file (foto atau PDF)!");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      files.forEach(file => {
        formDataToSend.append('lampiran', file);
      });

      await api.post('/surat-keluar', formDataToSend);

      toast.success('Surat keluar berhasil dibuat!');
      
      setFormData({
        nama_surat: '',
        tanggal_surat: '',
        ditujukan_ke: '',
        keterangan: ''
      });
      setFiles([]);
      setPreviewUrls([]);
      
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Gagal membuat surat keluar';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileIcon className="w-8 h-8 text-red-500" />;
    }
    return <FileIcon className="w-8 h-8 text-blue-500" />;
  };

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Header Section */}
        <div className="bg-white p-4 rounded-2xl border-2 border-[#EDE6E3] shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-x-1 mb-5">
            <div className="p-2.5 bg-white rounded-xl shadow-md">
              <FileText className="h-5 w-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold" >Buat Surat Keluar</h2>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2" >
                Nama Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_surat"
                value={formData.nama_surat}
                onChange={handleChange}
                onFocus={() => setFocusedField('nama_surat')}
                onBlur={() => setFocusedField(null)}
                required
                className={`w-full px-4 py-3 rounded-xl outline-none border-2 transition-all duration-300 bg-[#FDFCFB] ${focusedField === 'nama_surat'
                  ? 'border-teal-400 shadow-lg ring-4 ring-teal-400/20'
                  : 'border-[#EDE6E3] hover:border-teal-400'}`}
                
                placeholder="Masukkan nama surat"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" >
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_surat"
                value={formData.tanggal_surat}
                onChange={handleChange}
                onFocus={() => setFocusedField('tanggal_surat')}
                onBlur={() => setFocusedField(null)}
                required
                className={`w-full px-4 py-3 rounded-xl outline-none border-2 transition-all duration-300 bg-[#FDFCFB] ${focusedField === 'tanggal_surat'
                  ? 'border-teal-400 shadow-lg ring-4 ring-teal-400/20'
                  : 'border-[#EDE6E3] hover:border-teal-400'}`}
                
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" >
              Ditujukan Ke <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="ditujukan_ke"
              value={formData.ditujukan_ke}
              onChange={handleChange}
              onFocus={() => setFocusedField('ditujukan_ke')}
              onBlur={() => setFocusedField(null)}
              required
              className={`w-full px-4 py-3 rounded-xl outline-none border-2 transition-all duration-300 bg-[#FDFCFB] ${focusedField === 'ditujukan_ke'
                ? 'border-teal-400 shadow-lg ring-4 ring-teal-400/20'
                : 'border-[#EDE6E3] hover:border-teal-400'}`}
              
              placeholder="Masukkan tujuan surat"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2" >
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows="4"
              onFocus={() => setFocusedField('keterangan')}
              onBlur={() => setFocusedField(null)}
              className={`w-full px-4 py-3 rounded-xl outline-none border-2 transition-all duration-300 bg-[#FDFCFB] ${focusedField === 'keterangan'
                ? 'border-teal-400 shadow-lg ring-4 ring-teal-400/20'
                : 'border-[#EDE6E3] hover:border-teal-400'}`}
              
              placeholder="Tambahkan keterangan (opsional)"
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-base font-semibold mb-6 flex items-center" >
            <div className="p-2.5 bg-white rounded-xl shadow-md mr-3">
              <Upload className="w-5 h-5 text-teal-400" />
            </div>
            Upload Lampiran <span className="text-red-500 text-sm ml-1">*</span>
          </h2>

          <input
            type="file"
            id="lampiran"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {files.length === 0 ? (
            <label htmlFor="lampiran" className="block text-center p-12 border-2 border-dashed border-[#EDE6E3] rounded-xl cursor-pointer hover:bg-[#FDFCFB] hover:border-teal-400 transition-all duration-300">
              <Upload className="w-10 h-10 mx-auto mb-4"  />
              <p className="font-semibold" >Klik untuk upload file</p>
              <p className="text-sm" >JPEG, PNG, GIF, WEBP, PDF (maks 5MB)</p>
            </label>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type === 'application/pdf' ? (
                      <div
                        className="w-full h-24 bg-[#FDFCFB] rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-[#EDE6E3] hover:border-teal-400 transition-all duration-300"
                        onClick={() => openPreviewModal(null, index)}
                      >
                        {getFileIcon(file)}
                        <span className="text-xs text-center px-1 truncate w-full" >
                          {file.name.substring(0, 15)}{file.name.length > 15 ? '...' : ''}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={previewUrls[index]}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg cursor-pointer border-2 border-[#EDE6E3] hover:border-teal-400 transition-all duration-300"
                        onClick={() => openPreviewModal(previewUrls[index], index)}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreviewModal(file.type === 'application/pdf' ? null : previewUrls[index], index);
                        }}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {files.length < MAX_FILES && (
                  <label
                    htmlFor="lampiran"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[#EDE6E3] rounded-lg h-24 cursor-pointer hover:bg-[#FDFCFB] hover:border-teal-400 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5"  />
                    <span className="text-xs" >Tambah</span>
                  </label>
                )}
              </div>
              <p className="text-sm" >
                {files.length}/{MAX_FILES} file — Total {(files.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 bg-black text-white rounded-xl shadow-lg font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2 text-sm hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Buat Surat Keluar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal Preview */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closePreviewModal}
              className="absolute -top-12 right-0 text-white hover:scale-110 transition-transform"
            >
              <X className="w-8 h-8" />
            </button>

            {previewModal.isPdf ? (
              <div className="bg-white rounded-xl shadow-2xl h-[80vh] flex flex-col border-2 border-[#EDE6E3]">
                <div className="p-4 border-b border-[#EDE6E3] flex items-center">
                  <FileIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-medium truncate" >
                    {files[previewModal.index]?.name}
                  </span>
                </div>
                <div className="flex-grow overflow-hidden">
                  <iframe
                    src={previewModal.imageUrl}
                    className="w-full h-full rounded-b-xl"
                    title="PDF Preview"
                  />
                </div>
              </div>
            ) : (
              <img
                src={previewModal.imageUrl}
                alt="Preview"
                className="max-h-[80vh] rounded-xl shadow-2xl mx-auto border-2 border-[#EDE6E3]"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBuatSuratKeluar;