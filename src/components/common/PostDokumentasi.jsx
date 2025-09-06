import React, { useState } from 'react';
import { Camera, Image, Video, FileText, Hash, Tag, Send, CheckCircle, AlertCircle, X, Plus } from 'lucide-react';
import { api } from '../../utils/api';

const PostDokumentasi = () => {
  const [caption, setCaption] = useState('');
  const [kategori, setKategori] = useState('umum');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    // Validasi client-side
    if ((!caption || caption.trim() === '') && files.length === 0) {
      setMessage('Post harus memiliki caption atau minimal 1 file');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('caption', caption);
    formData.append('kategori', kategori);
    formData.append('tags', tags);

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await api.post('/dokumentasi/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
      setMessageType('success');
      setCaption('');
      setTags('');
      setFiles([]);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Terjadi kesalahan saat membuat post';
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (file.type.startsWith('video/')) return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const kategoriOptions = [
    { value: 'umum', label: '📝 Umum', color: 'bg-blue-500' },
    { value: 'pekerjaan', label: '💼 Pekerjaan', color: 'bg-green-500' },
    { value: 'tutorial', label: '🎓 Tutorial', color: 'bg-purple-500' },
    { value: 'meeting', label: '👥 Meeting', color: 'bg-orange-500' }
  ];

  const selectedKategori = kategoriOptions.find(opt => opt.value === kategori);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4 shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Buat Post
          </h1>
          <p className="text-gray-600 mt-2">Bagikan momen dokumentasimu</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-95">
          <div className="p-6">
            {/* Caption Field */}
            <div className="mb-6">
              <div className="relative">
                <textarea
                  rows="4"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-0 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400"
                  placeholder="Apa yang ingin kamu bagikan hari ini?"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                  {caption.length}/500
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={(e) => setFiles([...e.target.files])}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all duration-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">Upload media</p>
                    <p className="text-sm text-gray-400">Foto, video, atau dokumen</p>
                  </div>
                </label>
              </div>

              {/* File Preview */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 rounded-xl border border-gray-100"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {getFileIcon(file)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 truncate max-w-40">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category and Tags Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Kategori
                </label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300 appearance-none cursor-pointer"
                >
                  {kategoriOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-300"
                  placeholder="#tutorial"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-white shadow-lg transition-all duration-300 transform ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed scale-95'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 hover:scale-105 active:scale-95 shadow-purple-500/25'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  Mengirim...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" />
                  Bagikan Post
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-2xl border backdrop-blur-sm ${
            messageType === 'success'
              ? 'bg-green-50/80 border-green-200 text-green-800'
              : 'bg-red-50/80 border-red-200 text-red-800'
          } animate-in slide-in-from-bottom-4 duration-500`}>
            <div className="flex items-center">
              {messageType === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Category Preview */}
        {selectedKategori && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md border border-gray-100">
              <div className={`w-3 h-3 rounded-full ${selectedKategori.color} mr-2`}></div>
              <span className="text-sm font-medium text-gray-700">{selectedKategori.label}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDokumentasi;