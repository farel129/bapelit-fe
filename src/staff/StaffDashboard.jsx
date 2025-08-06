import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import { Mail, FileText, Clock, CheckCircle, Eye, Plus, BellDot, LayoutDashboard, Download, Loader2, AlertCircle, Building, Calendar, User, FileCheck, Sparkles, TrendingUp, Loader, Search, Filter, UserCircle2, Flag } from 'lucide-react'
import { api } from '../utils/api'
import { toast } from 'react-hot-toast'
import Staff from '../assets/img/halo.png'

const StaffDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadingSuratId, setDownloadingSuratId] = useState(null)

  // 🔍 State untuk fitur search dan filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'processed'

  const { user } = useAuth()

  useEffect(() => {
    fetchDashboardData()
    fetchNotifications()
  }, [])

  // Fetch dashboard stats dan forwarded surat
  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/forwarded-surat')
      setDashboardData(response.data)
      console.log('Dashboard data:', response.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Gagal memuat data dashboard')
    }
  }

  // Fetch notifications untuk surat yang diforward
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/staff?limit=50')
      setNotifications(response.data.notifications || [])
      console.log('Notifications:', response.data.notifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Gagal memuat notifikasi')
    } finally {
      setLoading(false)
    }
  }

  // Mark notification sebagai dibaca
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/staff/${notificationId}/read`)
      // Update state lokal
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true }
            : notif
        )
      )
      // Update dashboard stats
      if (dashboardData) {
        setDashboardData(prev => ({
          ...prev,
          statistics: {
            ...prev.statistics,
            unread: Math.max(0, prev.statistics.unread - 1)
          }
        }))
      }
      toast.success('Ditandai sebagai dibaca')
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Gagal menandai sebagai dibaca')
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-gray-900 border-gray-300'
      case 'processed':
        return 'bg-green-100 text-gray-900 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadPDF = async (suratId, nomorSurat) => {
    setIsDownloading(true)
    setDownloadingSuratId(suratId)
    setDownloadProgress(0)

    try {
      const response = await api.get(`/surat/${suratId}/pdf`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const total = progressEvent.total
          const current = progressEvent.loaded
          if (total) {
            const percentage = Math.round((current / total) * 100)
            setDownloadProgress(percentage)
          }
        }
      })

      // Create blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `disposisi-${nomorSurat || suratId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('PDF berhasil diunduh!')

    } catch (err) {
      console.error('Error downloading PDF:', err)
      toast.error('Gagal mengunduh PDF')
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
      setDownloadingSuratId(null)
    }
  }

  const handleViewSurat = async (notificationId, suratId) => {
    // Mark as read ketika dibuka jika belum dibaca
    if (notificationId && notifications.find(n => n.id === notificationId && !n.is_read)) {
      await markAsRead(notificationId)
    }
  }

  // 🔍 Filter dan search logika
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.surat_masuk?.perihal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.surat_masuk?.asal_instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.surat_masuk?.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false

    const matchesFilter =
      filterStatus === 'all' ||
      notification.surat_masuk?.status === filterStatus

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex flex-col space-y-2 justify-center items-center h-screen">
        <Loader className='w-8 h-8 animate-spin' />
        <p>Memuat</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto space-y-8">
        {/* Header Section */}
        <div className='p-5 rounded-3xl shadow-lg space-y-4 border border-black/5 bg-gradient-to-tl from-white via-white to-gray-50'>
          <div className="flex justify-between items-center">
            <div className='flex gap-x-5 items-center'>
              <div>
                <div className=' w-40 h-40 relative flex bg-gray-100 justify-center items-center rounded-full shadow-lg border border-black/5 overflow-hidden'>
                  <img src={Staff} alt="" className='w-50  h-50 absolute top-1 object-cover -left-4 rotate-20' />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Halo!</h1>
                <div className="flex items-center space-x-4">
                  <div className='space-y-1'>
                    <div className="flex items-center space-x-2">
                      <div>
                        <UserCircle2 className='w-5 h-5 text-gray-700' />
                      </div>
                      <p className="text-base font-medium text-gray-700">
                        {user?.name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div>
                        <Flag className='w-5 h-5 text-gray-700' />
                      </div>
                      <p className="text-base font-medium text-gray-700">
                        {user?.jabatan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">Executive Dashboard</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Surat Diterima */}
            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-blue-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-xl shadow-lg animate-bounce">
                    <FileText className="h-4 w-4 text-black" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gray-800 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black uppercase">
                    Total Surat Diterima
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {dashboardData?.statistics?.total || 0}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Belum Dibaca */}
            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-yellow-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 rounded-xl shadow-lg animate-bounce">
                    <BellDot className="h-4 w-4 text-red-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black uppercase">
                    Belum Dibaca
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {dashboardData?.statistics?.unread || 0}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Hari Ini */}
            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-yellow-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-green-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl shadow-lg animate-bounce">
                    <Calendar className="h-4 w-4 text-blue-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black uppercase">
                    Hari Ini
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {dashboardData?.statistics?.today || 0}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Pending */}
            <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
              <div className='bg-green-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
              <div className='bg-blue-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 rounded-xl shadow-lg animate-bounce">
                    <Clock className="h-4 w-4 text-yellow-700" />
                  </div>
                  <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-black uppercase">
                    Pending
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {dashboardData?.statistics?.pending || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Luxurious Table */}
        <div className="relative bg-white mt-5 p-3 shadow-lg border border-black/5 rounded-3xl">
          <div className="relative">
            {/* Header dengan Search & Filter */}
            <div className="bg-white p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-[#262628] flex items-center tracking-wide">
                  <div className="p-3 animate-bounce bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl mr-3 shadow-md">
                    <Mail className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="leading-tight">Surat yang Diteruskan ke Anda</span>
                </h2>

                {/* Search dan Filter */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari perihal atau instansi..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 w-full sm:w-64 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="appearance-none pl-10 pr-8 py-3 w-full sm:w-40 border border-gray-300 bg-gray-50 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">Semua Status</option>
                      <option value="pending">Pending</option>
                      <option value="processed">Diproses</option>
                    </select>
                    <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Info jumlah setelah filter */}
              <div className="mt-3 text-sm text-gray-600">
                Menampilkan <span className="font-bold">{filteredNotifications.length}</span> dari{' '}
                <span className="font-medium">{notifications.length}</span> surat
              </div>
            </div>

            {/* Cards List */}
            <div className="p-4 space-y-5">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center space-y-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-inner">
                      <Mail className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-gray-700">Tidak ada surat</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchTerm || filterStatus !== 'all'
                          ? 'Tidak ada surat yang sesuai dengan pencarian atau filter Anda.'
                          : 'Belum ada surat yang diteruskan ke Anda.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                filteredNotifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`group border border-black/5 rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 p-6 md:p-7 overflow-hidden ${
                      !notification.is_read
                        ? 'bg-gradient-to-r from-blue-50 to-white border-l-4 border-l-blue-400'
                        : 'bg-white hover:border-l-blue-300'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                      {/* Asal Instansi */}
                      <div className="lg:col-span-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asal Instansi</p>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-800 font-medium truncate" title={notification.surat_masuk?.asal_instansi}>
                            {notification.surat_masuk?.asal_instansi || <span className="text-gray-400 italic">Tidak tersedia</span>}
                          </span>
                        </div>
                        {notification.surat_masuk?.tujuan_jabatan && (
                          <div className="text-xs text-gray-500">
                            → {notification.surat_masuk?.tujuan_jabatan}
                          </div>
                        )}
                      </div>
                      
                      {/* Perihal */}
                      <div className="lg:col-span-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Perihal</p>
                        <p className="text-sm font-medium text-gray-800 line-clamp-2" title={notification.surat_masuk?.perihal}>
                          {notification.surat_masuk?.perihal || <span className="text-gray-400 italic">Tanpa perihal</span>}
                        </p>
                        {notification.surat_masuk?.keterangan && (
                          <p className="text-xs text-gray-500 line-clamp-1" title={notification.surat_masuk?.keterangan}>
                            {notification.surat_masuk?.keterangan}
                          </p>
                        )}
                      </div>
                      
                      {/* Tanggal */}
                      <div className="lg:col-span-2 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal</p>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </div>
                      
                      {/* Status */}
                      <div className="lg:col-span-2 space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</p>
                        {notification.surat_masuk?.status ? (
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(notification.surat_masuk?.status)} shadow-sm`}>
                            {notification.surat_masuk?.status === 'pending'
                              ? 'Pending'
                              : notification.surat_masuk?.status === 'processed'
                                ? 'Diproses'
                                : notification.surat_masuk?.status.charAt(0).toUpperCase() + notification.surat_masuk?.status.slice(1)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </div>
                      
                      {/* Aksi */}
                      <div className="lg:col-span-1 flex flex-col gap-2 mt-1">
                        <Link
                          to={`/staff-process/${notification.surat_id}`}
                          onClick={() => handleViewSurat(notification.id, notification.surat_id)}
                          className="inline-flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 text-xs font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 active:scale-95"
                          title="Lihat detail surat"
                        >
                          <div>
                            <Eye className="w-3 h-3 mr-1.5" />
                          </div>
                          Lihat
                        </Link>
                        <button
                          onClick={() => handleDownloadPDF(notification.surat_id, notification.surat_masuk?.nomor_surat)}
                          disabled={isDownloading && downloadingSuratId === notification.surat_id}
                          className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 text-xs font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
                          title="Unduh sebagai PDF"
                        >
                          {isDownloading && downloadingSuratId === notification.surat_id ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                              <span>{downloadProgress > 0 ? `${downloadProgress}%` : '...'}</span>
                            </>
                          ) : (
                            <>
                              <div>
                                <Download className="w-3 h-3 mr-1.5" />
                              </div>
                              PDF
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard