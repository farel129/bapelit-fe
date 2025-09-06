import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Send, Building2, FileText, Sparkles, Camera, X, Eye, Plus,
  Upload, Mail, Pencil, BookOpen, CheckCircle, ArrowRight, File,
  FileIcon
} from 'lucide-react'
import { api } from '../../utils/api'

const AdminBuatSurat = () => {
  const navigate = useNavigate()
  // Form state
  const [formData, setFormData] = useState({
    asal_instansi: '',
    tanggal_surat: '',
    diterima_tanggal: '',
    nomor_agenda: '',
    nomor_surat: '',
    keterangan: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [previewModal, setPreviewModal] = useState({ isOpen: false, imageUrl: '', index: null, isPdf: false })
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const MAX_FILES = 10
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const steps = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Lengkapi Data Surat Masuk",
      description: "Isi kolom 'Asal Instansi', 'Nomor Surat', pilih 'Tujuan Jabatan', dan tambahkan 'Keterangan'.",
      color: "from-blue-100 to-blue-100"
    },
    {
      icon: <Upload className="w-5 h-5" />,
      title: "Upload Foto Surat",
      description: "Klik area upload atau tombol 'Tambah Foto' untuk memilih dan mengunggah gambar surat atau file PDF. Maksimal 10 file dengan ukuran masing-masing maksimal 5MB.",
      color: "from-emerald-100 to-emerald-100"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Isi Lembar Disposisi",
      description: "Masukkan 'Perihal', pilih 'Disposisi Kepada', pilih satu atau lebih 'Tindakan', tentukan 'Sifat', dan tambahkan 'Catatan' jika diperlukan.",
      color: "from-red-100 to-red-100"
    },
    {
      icon: <Send className="w-5 h-5" />,
      title: "Kirim Dokumen",
      description: "Setelah semua data lengkap, klik tombol 'Kirim Surat & Disposisi' di bagian bawah halaman.",
      color: "from-gray-100 to-gray-100"
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateFile = (file) => {
    // Izinkan file gambar dan PDF
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File ${file.name}: Hanya file gambar dan PDF yang diizinkan!`)
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name}: Ukuran maksimal 5MB!`)
      return false
    }
    return true
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (selectedFiles.length + files.length > MAX_FILES) {
      toast.error(`Maksimal ${MAX_FILES} file!`)
      return
    }

    const validFiles = files.filter(validateFile)
    if (validFiles.length === 0) return

    const newFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(newFiles)

    const newUrls = [...previewUrls]
    validFiles.forEach((file, index) => {
      if (file.type === 'application/pdf') {
        // Untuk PDF, simpan file object atau null sebagai placeholder
        newUrls[selectedFiles.length + index] = null
      } else {
        // Untuk gambar, buat preview URL
        const reader = new FileReader()
        reader.onload = (e) => {
          newUrls[selectedFiles.length + index] = e.target.result
          setPreviewUrls([...newUrls])
        }
        reader.readAsDataURL(file)
      }
    })

    e.target.value = ''
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
  }

  const openPreviewModal = (url, index) => {
    const file = selectedFiles[index]
    const isPdf = file && file.type === 'application/pdf'

    if (isPdf) {
      // Untuk PDF, buat URL blob untuk preview
      const fileUrl = URL.createObjectURL(file)
      setPreviewModal({ isOpen: true, imageUrl: fileUrl, index, isPdf: true })
    } else {
      setPreviewModal({ isOpen: true, imageUrl: url, index, isPdf: false })
    }
  }

  const closePreviewModal = () => {
    // Bersihkan URL blob jika itu PDF
    if (previewModal.isPdf && previewModal.imageUrl) {
      URL.revokeObjectURL(previewModal.imageUrl)
    }
    setPreviewModal({ isOpen: false, imageUrl: '', index: null, isPdf: false })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validation
    if (!formData.asal_instansi || !formData.nomor_surat || !formData.tanggal_surat || !formData.diterima_tanggal || !formData.nomor_agenda || !formData.keterangan) {
      toast.error("Lengkapi semua data surat!")
      return
    }
    if (selectedFiles.length === 0) {
      toast.error("Unggah minimal 1 file (foto atau PDF)!")
      return
    }
    setLoading(true)
    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([k, v]) => submitData.append(k, v))
      // Tambahkan tujuan_jabatan secara otomatis
      submitData.append('tujuan_jabatan', 'Kepala Bapelitbangda')
      selectedFiles.forEach(file => submitData.append('photos', file))
      await api.post('/admin/surat-masuk/buat', submitData)
      toast.success('Surat & disposisi berhasil dibuat!')
      navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal mengirim surat')
    } finally {
      setLoading(false)
    }
  }

  const closeTutorialModal = () => setIsTutorialModalOpen(false)

  // Fungsi untuk mendapatkan ikon berdasarkan tipe file
  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <File className="w-8 h-8 text-red-500" />
    }
    return <File className="w-8 h-8 text-blue-500" />
  }

  // Fungsi untuk mendapatkan teks berdasarkan tipe file
  const getFileText = (file) => {
    if (file.type === 'application/pdf') {
      return 'PDF File'
    }
    return 'Image File'
  }

  return (
    <div className='min-h-screen'>
      {/* Single Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Data Surat Masuk Section */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-bold mb-6 flex items-center" style={{ color: '#2E2A27' }}>
            <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md mr-3">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            Data Surat Masuk
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Asal Instansi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="asal_instansi"
                value={formData.asal_instansi}
                onChange={handleChange}
                onFocus={() => setFocusedField('asal_instansi')}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 rounded-xl outline-none border-2 transition-all duration-300 bg-[#FDFCFB] ${focusedField === 'asal_instansi'
                  ? 'border-[#D4A373] shadow-lg ring-4 ring-[#D4A373]/20'
                  : 'border-[#EDE6E3] hover:border-[#D4A373]'}`}
                style={{ color: '#2E2A27' }}
                placeholder="Contoh: Dinas Pendidikan Kota Tasikmalaya"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nomor_surat"
                value={formData.nomor_surat}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none bg-[#FDFCFB] border-[#EDE6E3] focus:border-[#D4A373] focus:shadow-lg focus:ring-4 focus:ring-[#D4A373]/20 hover:border-[#D4A373] transition-all duration-300"
                style={{ color: '#2E2A27' }}
                placeholder="Contoh: 123/ABC/2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tanggal_surat"
                value={formData.tanggal_surat}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none bg-[#FDFCFB] border-[#EDE6E3] focus:border-[#D4A373] focus:shadow-lg focus:ring-4 focus:ring-[#D4A373]/20 hover:border-[#D4A373] transition-all duration-300"
                style={{ color: '#2E2A27' }}
                placeholder="Contoh: 1 Januari 2025"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Diterima Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="diterima_tanggal"
                value={formData.diterima_tanggal}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none bg-[#FDFCFB] border-[#EDE6E3] focus:border-[#D4A373] focus:shadow-lg focus:ring-4 focus:ring-[#D4A373]/20 hover:border-[#D4A373] transition-all duration-300"
                style={{ color: '#2E2A27' }}
                placeholder="Contoh: 1 Januari 2025"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
                Nomor Agenda <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nomor_agenda"
                value={formData.nomor_agenda}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 outline-none bg-[#FDFCFB] border-[#EDE6E3] focus:border-[#D4A373] focus:shadow-lg focus:ring-4 focus:ring-[#D4A373]/20 hover:border-[#D4A373] transition-all duration-300"
                style={{ color: '#2E2A27' }}
                placeholder="Contoh: 1212"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#6D4C41' }}>
              Keterangan <span className="text-red-500">*</span>
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl outline-none border-2 bg-[#FDFCFB] border-[#EDE6E3] resize-none focus:border-[#D4A373] focus:shadow-lg focus:ring-4 focus:ring-[#D4A373]/20 hover:border-[#D4A373] transition-all duration-300"
              style={{ color: '#2E2A27' }}
              placeholder="Jelaskan isi surat secara singkat..."
              required
            />
          </div>
        </div>

        {/* Upload Foto Section */}
        <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-lg font-bold mb-6 flex items-center" style={{ color: '#2E2A27' }}>
            <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md mr-3">
              <Camera className="w-5 h-5 text-white" />
            </div>
            Upload File Surat <span className="text-red-500 text-sm ml-1">*</span>
          </h2>
          <input
            type="file"
            id="photos"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {selectedFiles.length === 0 ? (
            <label htmlFor="photos" className="block text-center p-12 border-2 border-dashed border-[#EDE6E3] rounded-xl cursor-pointer hover:bg-[#FDFCFB] hover:border-[#D4A373] transition-all duration-300">
              <Upload className="w-10 h-10 mx-auto mb-4" style={{ color: '#6D4C41' }} />
              <p className="font-bold" style={{ color: '#2E2A27' }}>Klik untuk upload file</p>
              <p className="text-sm" style={{ color: '#6D4C41' }}>JPEG, PNG, GIF, WEBP, PDF (maks 5MB)</p>
            </label>
          ) : (
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type === 'application/pdf' ? (
                      // Tampilan untuk PDF
                      <div
                        className="w-full h-24 bg-[#FDFCFB] rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-[#EDE6E3] hover:border-[#D4A373] transition-all duration-300"
                        onClick={() => openPreviewModal(null, index)}
                      >
                        <FileIcon className="w-8 h-8 text-red-500 mb-1" />
                        <span className="text-xs text-center px-1 truncate w-full" style={{ color: '#6D4C41' }}>
                          {file.name.substring(0, 15)}{file.name.length > 15 ? '...' : ''}
                        </span>
                      </div>
                    ) : (
                      // Tampilan untuk gambar
                      <img
                        src={previewUrls[index]}
                        alt=""
                        className="w-full h-24 object-cover rounded-lg cursor-pointer border-2 border-[#EDE6E3] hover:border-[#D4A373] transition-all duration-300"
                        onClick={() => openPreviewModal(previewUrls[index], index)}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPreviewModal(file.type === 'application/pdf' ? null : previewUrls[index], index)
                        }}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index)
                        }}
                        className="text-white hover:scale-110 transition-transform"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {selectedFiles.length < MAX_FILES && (
                  <label
                    htmlFor="photos"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-[#EDE6E3] rounded-lg h-24 cursor-pointer hover:bg-[#FDFCFB] hover:border-[#D4A373] transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" style={{ color: '#6D4C41' }} />
                    <span className="text-xs" style={{ color: '#6D4C41' }}>Tambah</span>
                  </label>
                )}
              </div>
              <p className="text-sm" style={{ color: '#6D4C41' }}>
                {selectedFiles.length}/{MAX_FILES} file — Total {(selectedFiles.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-12 py-4 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] text-white rounded-xl shadow-lg font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center space-x-2 text-sm hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Mengirim...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Kirim Surat</span>
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
              // Tampilan untuk PDF
              <div className="bg-white rounded-xl shadow-2xl h-[80vh] flex flex-col border-2 border-[#EDE6E3]">
                <div className="p-4 border-b border-[#EDE6E3] flex items-center">
                  <FileIcon className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-medium truncate" style={{ color: '#2E2A27' }}>
                    {selectedFiles[previewModal.index]?.name}
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
              // Tampilan untuk gambar
              <img
                src={previewModal.imageUrl}
                alt="Preview"
                className="max-h-[80vh] rounded-xl shadow-2xl mx-auto border-2 border-[#EDE6E3]"
              />
            )}
          </div>
        </div>
      )}

      {/* Modal Tutorial */}
      {isTutorialModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="relative bg-white backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col border-2 border-[#EDE6E3]">
            <div className="relative flex items-center justify-between p-5 pb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#2E2A27' }}>
                    Tutorial Interaktif
                  </h3>
                  <p className="text-sm mt-1" style={{ color: '#6D4C41' }}>Buat Surat dan Lembar Disposisi</p>
                </div>
              </div>
              <button
                onClick={closeTutorialModal}
                className="p-3 rounded-2xl hover:bg-[#FDFCFB] transition-all duration-200 group" style={{ color: '#6D4C41' }}
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
            <div className="px-8 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium" style={{ color: '#2E2A27' }}>
                  Langkah {currentStep + 1} dari {steps.length}
                </span>
                <span className="text-sm" style={{ color: '#6D4C41' }}>
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% selesai
                </span>
              </div>
              <div className="w-full bg-[#EDE6E3] rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4A373] to-[#6D4C41] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-grow px-8 pb-4">
              <div className="relative">
                <div className="text-center space-y-6 animate-in mt-6 fade-in slide-in-from-right-4 duration-500" key={currentStep}>
                  <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                      <div className="text-white">
                        {steps[currentStep].icon}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold" style={{ color: '#2E2A27' }}>
                      {steps[currentStep].title}
                    </h4>
                    <p className="leading-relaxed max-w-md mx-auto" style={{ color: '#6D4C41' }}>
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center mt-5">
                  <div className="flex space-x-4">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStep
                          ? 'bg-[#D4A373] scale-125'
                          : index < currentStep
                            ? 'bg-green-400 scale-110'
                            : 'bg-[#EDE6E3]'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 border-t border-[#EDE6E3]">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-200 ${currentStep === 0
                  ? 'text-[#6D4C41] cursor-not-allowed bg-[#FDFCFB] border border-[#EDE6E3]'
                  : 'text-[#2E2A27] hover:bg-[#FDFCFB] cursor-pointer hover:-translate-y-0.5 bg-white border border-[#EDE6E3] hover:border-[#D4A373]'
                  }`}
              >
                Sebelumnya
              </button>
              <div className="flex space-x-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 shadow-lg hover:-translate-y-0.5 border border-[#EDE6E3] bg-gradient-to-r from-[#D4A373] to-[#6D4C41] text-sm text-white cursor-pointer rounded-2xl font-medium hover:shadow-lg flex items-center space-x-2 group hover:from-[#6D4C41] hover:to-[#2E2A27] transition-all duration-300"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                ) : (
                  <button
                    onClick={closeTutorialModal}
                    className="px-6 py-3 bg-green-600 hover:-translate-y-0.5 cursor-pointer text-sm text-white rounded-2xl font-medium hover:shadow-lg transition-all duration-200 transform flex items-center space-x-2 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Selesai</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default AdminBuatSurat