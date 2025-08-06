import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Send, Building2, FileText, Sparkles, Camera, X, Eye, Plus,
  Upload, Mail,
  Pencil, BookOpen, ArrowRight, CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { api } from '../utils/api'
import Admin from '../assets/img/adminbuatsurat.png'

const AdminBuatSurat = () => {
  const navigate = useNavigate()

  // --- Step Form ---
  const [step, setStep] = useState(1) // 1: Data Surat, 2: Foto, 3: Disposisi, 4: Kirim
  const [formData, setFormData] = useState({
    asal_instansi: '',
    nomor_surat: '',
    tujuan_jabatan: '',
    keterangan: ''
  })
  const [disposisiData, setDisposisiData] = useState({
    perihal: '',
    disposisi_kepada: '',
    tindakan: '',
    sifat: '',
    catatan: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [previewModal, setPreviewModal] = useState({ isOpen: false, imageUrl: '', index: null })
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // Untuk tutorial modal

  const jabatanOptions = [
    'Sekretaris',
    'Kasubag Umum dan Kepegawaian',
    'Kasubag Keuangan',
    'Kabid Pendanaan, Pengendalian, dan Evaluasi',
    'Kabid Pemerintahan dan Pembangunan Manusia',
    'Kabid Perekonomian, Infrastruktur, dan Kewilayahan',
    'Kabid Penelitian dan Pengembangan'
  ]

  const tindakanOptions = [
    "Tanggapan dan Saran",
    "Wakili / Hadir / Terima",
    "Mendampingi Saya",
    "Untuk Ditindaklanjuti",
    "Pelajari / Telaa'h / Sarannya",
    "Untuk Dikaji Sesuai dengan Ketentuan",
    "Untuk Dibantu / Dipertimbangkan / Sesuai dengan Ketentuan",
    "Selesaikan / Proses Sesuai Ketentuan",
    "Monitor Realisasinya / Perkembangannya",
    "Siapkan Pointers / Sambutan / Bahan",
    "Menghadap / Informasinya",
    "Membaca / File / Referensi",
    "Agendakan / Jadwalkan / Koordinasikan"
  ]

  const MAX_FILES = 10
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

  const [selectedTindakan, setSelectedTindakan] = useState([])

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
      description: "Klik area upload atau tombol 'Tambah Foto' untuk memilih dan mengunggah gambar surat. Maksimal 10 foto dengan ukuran masing-masing maksimal 5MB.",
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

  const handleNext = () => {
    if (step === 1) {
      if (!formData.asal_instansi || !formData.nomor_surat || !formData.tujuan_jabatan || !formData.keterangan) {
        toast.error("Lengkapi semua data surat!")
        return
      }
    }
    if (step === 2 && selectedFiles.length === 0) {
      toast.error("Unggah minimal 1 foto surat!")
      return
    }
    if (step === 3) {
      if (!disposisiData.perihal || !disposisiData.disposisi_kepada || !disposisiData.sifat) {
        toast.error("Lengkapi perihal, disposisi kepada, dan sifat!")
        return
      }
    }
    setStep(prev => prev + 1)
  }

  const handlePrev = () => {
    setStep(prev => prev - 1)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleDisposisiChange = (e) => {
    setDisposisiData({ ...disposisiData, [e.target.name]: e.target.value })
  }

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File ${file.name}: Hanya file gambar yang diizinkan!`)
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
      toast.error(`Maksimal ${MAX_FILES} foto!`)
      return
    }
    const validFiles = files.filter(validateFile)
    if (validFiles.length === 0) return

    const newFiles = [...selectedFiles, ...validFiles]
    setSelectedFiles(newFiles)

    const newUrls = [...previewUrls]
    validFiles.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newUrls[selectedFiles.length + index] = e.target.result
        setPreviewUrls([...newUrls])
      }
      reader.readAsDataURL(file)
    })

    e.target.value = ''
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
  }

  const openPreviewModal = (imageUrl, index) => {
    setPreviewModal({ isOpen: true, imageUrl, index })
  }

  const closePreviewModal = () => {
    setPreviewModal({ isOpen: false, imageUrl: '', index: null })
  }

  const onTindakanChange = (option) => {
    let newSelected
    if (selectedTindakan.includes(option)) {
      newSelected = selectedTindakan.filter(item => item !== option)
    } else {
      newSelected = [...selectedTindakan, option]
    }
    setSelectedTindakan(newSelected)
    setDisposisiData({
      ...disposisiData,
      tindakan: newSelected.join(', ')
    })
  }

  const onRemoveTindakan = (option) => {
    const newSelected = selectedTindakan.filter(item => item !== option)
    setSelectedTindakan(newSelected)
    setDisposisiData({
      ...disposisiData,
      tindakan: newSelected.join(', ')
    })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([k, v]) => submitData.append(k, v))
      Object.entries(disposisiData).forEach(([k, v]) => submitData.append(k, v))
      selectedFiles.forEach(file => submitData.append('photos', file))

      await api.post('/surat-masuk', submitData)
      toast.success('Surat & disposisi berhasil dibuat!')
      navigate('/admin')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Gagal mengirim surat')
    } finally {
      setLoading(false)
    }
  }

  const closeTutorialModal = () => setIsTutorialModalOpen(false)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between bg-gradient-to-tl from-gray-50 via-white to-gray-50 shadow-lg border border-black/5 p-5 rounded-2xl mb-6">
        <div className='flex flex-col gap-y-2'>
          <h1 className="text-xl font-bold text-[#262628]">Buat Surat dan Lembar Disposisi</h1>
          <div className='flex relative'>
            <div className="inline-flex items-center rounded-full justify-center w-10 h-10 bg-gray-300 shadow-lg">
              <Mail className="w-4 h-4 text-[#262628]" />
            </div>
            <div className="inline-flex absolute ml-7 items-center rounded-full justify-center w-10 h-10 bg-[#fff] shadow-lg">
              <Pencil className="w-4 h-4 text-[#262628]" />
            </div>
          </div>
          <div className='mt-3'>
            <button
              onClick={() => setIsTutorialModalOpen(true)}
              className='bg-white py-3 px-6 rounded-full border border-black/5 shadow-lg h-fit font-medium text-black hover:-translate-y-0.5 duration-200 transition-all text-sm cursor-pointer'
            >
              <p>Lihat Tutorial?</p>
            </button>
            <p className='text-xs text-gray-600 animate-pulse max-w-60 mt-3'>tekan tombol untuk melihat tutorial</p>
          </div>
        </div>
        <div className='flex gap-x-3'>
          <div className='w-50 h-full relative flex items-center'>
            <div className='w-50 h-50 bg-white absolute rounded-full border-40 border-gray-100'></div>
            <div className='w-10 self-start h-10 bg-[#999999] absolute rounded-full animate-bounce flex justify-center items-center'><FileText className='text-white w-6 h-6' /></div>
            <img src={Admin} alt="" className='z-10 absolute' />
          </div>
        </div>
      </div>

      {/* Progress Step */}
      <div className="w-full mb-8 px-4">
        <div className="flex items-center justify-between mb-2">
          {['Data Surat', 'Upload Foto', 'Disposisi', 'Kirim'].map((label, i) => {
            const stepNum = i + 1
            return (
              <div key={i} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold transition-all ${stepNum < step ? 'bg-green-100 text-green-700' :
                  stepNum === step ? 'bg-purple-100 text-purple-700 ring-4 ring-purple-100' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                  {stepNum}
                </div>
                <p className="text-xs text-gray-600">{label}</p>
              </div>
            )
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Step */}
      <div className="w-full mx-auto px-4 space-y-8 bg-gradient-to-tl from-pink-50 via-white to-gray-50 shadow-lg border border-black/5 rounded-3xl p-6">

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8  animate-in slide-in-from-left-10 duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Building2 className="w-5 h-5 mr-2" /> Data Surat Masuk
            </h2>
            <div className="space-y-6">
              <div className='flex gap-x-5'>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Asal Instansi</label>
                  <input
                    type="text"
                    name="asal_instansi"
                    value={formData.asal_instansi}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('asal_instansi')}
                    onBlur={() => setFocusedField(null)}
                    className={`w-full px-6 py-4 rounded-2xl outline-none border-2 transition-all ${focusedField === 'asal_instansi'
                      ? 'border-purple-400 shadow-2xl ring-4 ring-purple-100 bg-white'
                      : 'border-slate-200 hover:border-purple-300'}`}
                    placeholder="Contoh: Dinas Pendidikan Kota Tasikmalaya"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Nomor Surat</label>
                  <input
                    type="text"
                    name="nomor_surat"
                    value={formData.nomor_surat}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl border-2 outline-none border-slate-200 focus:border-blue-400 focus:shadow-xl transition-all"
                    placeholder="Contoh: 123/ABC/2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Tujuan Jabatan</label>
                  <select
                    name="tujuan_jabatan"
                    value={formData.tujuan_jabatan}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl border-2 outline-none border-slate-200 focus:border-blue-400 focus:shadow-xl transition-all"
                  >
                    <option value="">Pilih jabatan...</option>
                    {jabatanOptions.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>


              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Keterangan</label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-6 py-4 rounded-2xl outline-none border-2 border-slate-200 resize-none h-20 focus:border-blue-400 focus:shadow-xl transition-all"
                  placeholder="Jelaskan isi surat secara singkat..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8  animate-in slide-in-from-right-10 duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <Camera className="w-5 h-5 mr-2" /> Upload Foto Surat
            </h2>
            <input type="file" id="photos" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
            {selectedFiles.length === 0 ? (
              <label htmlFor="photos" className="block text-center p-12 border-2 border-dashed border-purple-300 rounded-2xl cursor-pointer hover:bg-purple-50 transition-all">
                <Upload className="w-10 h-10 mx-auto text-purple-500 mb-4" />
                <p className="font-bold text-slate-700">Klik untuk upload foto</p>
                <p className="text-sm text-slate-500">JPEG, PNG, GIF, WEBP (maks 5MB)</p>
              </label>
            ) : (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-lg" />
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                        <button type="button" onClick={() => openPreviewModal(url, index)} className="text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => removeFile(index)} className="text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedFiles.length < MAX_FILES && (
                    <label htmlFor="photos" className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-24 cursor-pointer hover:bg-gray-50">
                      <Plus className="w-5 h-5" />
                      <span className="text-xs">Tambah</span>
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {selectedFiles.length}/{MAX_FILES} foto — Total {(selectedFiles.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-lg p-8  animate-in slide-in-from-left-10 duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" /> Lembar Disposisi
            </h2>
            <div className="space-y-6">
              <div className=' flex gap-x-5'>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Perihal</label>
                  <input
                    type="text"
                    name="perihal"
                    value={disposisiData.perihal}
                    onChange={handleDisposisiChange}
                    className="w-full px-6 py-4 rounded-2xl border-2 outline-none border-slate-200 focus:border-blue-400 focus:shadow-xl transition-all"
                    placeholder="Isi perihal surat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Disposisi Kepada</label>
                  <select
                    name="disposisi_kepada"
                    value={disposisiData.disposisi_kepada}
                    onChange={handleDisposisiChange}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-400 outline-none focus:shadow-xl transition-all"
                  >
                    <option value="">Pilih jabatan...</option>
                    {jabatanOptions.map(j => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tindakan</label>
                {selectedTindakan.length > 0 && (
                  <div className='bg-gradient-to-l from-gray-50 via-white to-blue-50 mb-5 p-5 rounded-xl'>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedTindakan.map(t => (
                        <div>
                          <span key={t} className="inline-flex items-center px-6 text-sm py-3 bg-gradient-to-tl from-fuchsia-500 to-indigo-500 text-white rounded-xl font-semibold">
                            {t}
                            <button
                              onClick={() => onRemoveTindakan(t)}
                              className="ml-2 text-white hover:rotate-135"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className=" border-2 border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                  {tindakanOptions.map(opt => (
                    <div
                      key={opt}
                      className={`p-3 border-b border-slate-100 cursor-pointer hover:bg-blue-50 ${selectedTindakan.includes(opt) ? 'bg-blue-50' : ''
                        }`}
                      onClick={() => onTindakanChange(opt)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTindakan.includes(opt)}
                        onChange={() => { }}
                        className="mr-2"
                      />
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sifat</label>
                <div className="flex space-x-4">
                  {['Sangat Segera', 'Segera', 'Rahasia'].map(s => (
                    <label key={s} className="flex items-center">
                      <input
                        type="radio"
                        name="sifat"
                        value={s}
                        checked={disposisiData.sifat === s}
                        onChange={handleDisposisiChange}
                        className="mr-2"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Catatan</label>
                <textarea
                  name="catatan"
                  value={disposisiData.catatan}
                  onChange={handleDisposisiChange}
                  rows={3}
                  className="w-full px-6 py-4 rounded-2xl outline-none border-2 border-slate-200 focus:border-blue-400 focus:shadow-xl transition-all"
                  placeholder="Catatan tambahan"
                />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-lg p-8  animate-in slide-in-from-right-10 duration-500">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Konfirmasi & Kirim
            </h2>
            <div className="space-y-4 text-sm">
              <p><strong>Asal Instansi:</strong> {formData.asal_instansi}</p>
              <p><strong>Nomor Surat:</strong> {formData.nomor_surat}</p>
              <p><strong>Tujuan Jabatan:</strong> {formData.tujuan_jabatan}</p>
              <p><strong>Keterangan:</strong> {formData.keterangan}</p>
              <p><strong>Foto:</strong> {selectedFiles.length} file</p>
              <p><strong>Perihal:</strong> {disposisiData.perihal}</p>
              <p><strong>Disposisi Kepada:</strong> {disposisiData.disposisi_kepada}</p>
              <p><strong>Tindakan:</strong> {disposisiData.tindakan || '-'}</p>
              <p><strong>Sifat:</strong> {disposisiData.sifat}</p>
              <p><strong>Catatan:</strong> {disposisiData.catatan || '-'}</p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={handlePrev}
              className="flex items-center px-6 py-3 font-semibold bg-gray-100 text-gray-700 rounded-xl hover:-translate-y-0.5 cursor-pointer transition"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
            </button>
          ) : (
            <div></div>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-red-100 text-black rounded-xl shadow-lg cursor-pointer font-semibold hover:-translate-y-0.5 transition flex items-center"
            >
              Lanjut <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-green-100 cursor-pointer text-blacl rounded-xl hover:-translate-y-0.5 shadow-lg font-semibold transition flex items-center disabled:opacity-60"
            >
              {loading ? 'Mengirim...' : 'Kirim Sekarang'}
            </button>
          )}
        </div>
      </div>

      {/* Modal Preview */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl">
            <button onClick={closePreviewModal} className="absolute -top-12 right-0 text-white">
              <X className="w-8 h-8" />
            </button>
            <img src={previewModal.imageUrl} alt="Preview" className="max-h-[80vh] rounded-xl shadow-2xl" />
          </div>
        </div>
      )}

      {/* Modal Tutorial (TETAP ADA, tidak hilang!) */}
      {isTutorialModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="relative bg-white backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col">
            <div className="relative flex items-center justify-between p-5 pb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-[262628]" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Tutorial Interaktif
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Buat Surat dan Lembar Disposisi</p>
                </div>
              </div>
              <button
                onClick={closeTutorialModal}
                className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
            <div className="px-8 pb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Langkah {currentStep + 1} dari {steps.length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(((currentStep + 1) / steps.length) * 100)}% selesai
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-green-100 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex-grow px-8 pb-4">
              <div className="relative">
                <div className="text-center space-y-6 animate-in mt-6 fade-in slide-in-from-right-4 duration-500" key={currentStep}>
                  <div className="flex justify-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${steps[currentStep].color} rounded-3xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200`}>
                      <div className="text-black">
                        {steps[currentStep].icon}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-gray-800">
                      {steps[currentStep].title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
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
                          ? 'bg-[#262628] scale-125'
                          : index < currentStep
                            ? 'bg-emerald-500 scale-110'
                            : 'bg-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-5 border-t border-gray-100/50">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-2xl bg-gray-100 font-medium transition-all duration-200 ${currentStep === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 cursor-pointer hover:-translate-y-0.5 hover:text-gray-800'
                  }`}
              >
                Sebelumnya
              </button>
              <div className="flex space-x-3">
                {currentStep < steps.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="px-6 py-3 shadow-lg hover:-translate-y-0.5 border border-black/5 bg-[#fff] text-sm text-black cursor-pointer rounded-2xl font-medium hover:shadow-lg flex items-center space-x-2 group"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                ) : (
                  <button
                    onClick={closeTutorialModal}
                    className="px-6 py-3 bg-green-100 hover:-translate-y-0.5 cursor-pointer text-sm text-black rounded-2xl font-medium hover:shadow-lg transition-all duration-200 transform flex items-center space-x-2"
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