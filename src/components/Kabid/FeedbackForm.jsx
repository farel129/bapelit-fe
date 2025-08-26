import { AlertCircle, Loader, Send, Upload } from "lucide-react";
import FilePreview from "./FilePreview";
import { useState } from "react";
import { api } from "../../utils/api";

const FeedbackForm = ({ disposisi, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    notes: '',
    status: 'dalam proses' // Default status
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    const maxFiles = 5;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    let validFiles = [];
    let errors = [];

    selectedFiles.forEach(file => {
      if (files.length + validFiles.length >= maxFiles) {
        errors.push(`Maksimal ${maxFiles} file`);
        return;
      }
      
      if (file.size > maxSize) {
        errors.push(`File ${file.name} terlalu besar (max 10MB)`);
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Tipe file ${file.name} tidak didukung`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert('Error:\n' + errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
    
    e.target.value = '';
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.notes.trim()) {
      newErrors.notes = 'Catatan feedback wajib diisi';
    }

    if (!formData.status) {
      newErrors.status = 'Status wajib dipilih';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('notes', formData.notes.trim());
      submitData.append('status', formData.status);

      files.forEach((file) => {
        submitData.append('feedback_files', file);
      });
      
      const response = await api.post(`/kabid/disposisi/${disposisi.id}/feedback`, submitData);

      if (response.status >= 200 && response.status < 300) {
        alert('Feedback berhasil dikirim!');
        onSuccess && onSuccess(response.data?.data || response.data);
        // Reset form
        setFormData({ notes: '', status: 'dalam proses' });
        setFiles([]);
      } else {
        throw new Error(response.data?.error || 'Gagal mengirim feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);

      const errorMessage = error.response?.data?.error ||
                           error.response?.data?.message ||
                           error.message ||
                           'Terjadi kesalahan saat mengirim feedback';

      alert('Gagal: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kirim Feedback</h2>
              <p className="text-sm text-gray-600 mt-1">
                Feedback untuk: {disposisi.perihal}
              </p>
            </div>
            <button
              onClick={onCancel}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 text-2xl disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Disposisi *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              disabled={loading}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                errors.status ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Pilih Status</option>
              <option value="diproses">Dalam Proses</option>
              <option value="selesai">Selesai</option>
            </select>
            {errors.status && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.status}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan Feedback *
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              disabled={loading}
              rows={5}
              placeholder="Berikan catatan detail mengenai pelaksanaan disposisi ini..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                errors.notes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.notes}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lampiran File (Opsional)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label 
                  htmlFor="feedback_files"
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Upload className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">
                    Pilih file ({5 - files.length} slot tersisa)
                  </span>
                </label>
                <input
                  id="feedback_files"
                  type="file"
                  multiple
                  disabled={loading || files.length >= 5}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                />
              </div>

              <p className="text-xs text-gray-500">
                Maksimal 5 file, masing-masing maksimal 10MB. 
                Format: JPG, PNG, PDF, DOC, DOCX, XLS, XLSX
              </p>

              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    File yang dipilih ({files.length}):
                  </p>
                  {files.map((file, index) => (
                    <FilePreview
                      key={index}
                      file={file}
                      index={index}
                      onRemove={removeFile}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.notes.trim() || !formData.status}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Kirim Feedback
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;