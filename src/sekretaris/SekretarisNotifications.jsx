import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Bell, Eye, CheckCircle, BellDot, Calendar, Mail, Clock, User, Building, FileText, Sparkles, RefreshCw, Award, Loader, ChevronRight, AlertCircle } from 'lucide-react'
import { api } from '../utils/api'

const SekretarisNotifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    read: 0
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true)
        toast.loading('Memuat notifikasi...')
      }

      const response = await api.get('/notifications')
      const notificationData = response.data || []
      setNotifications(notificationData)

      // Calculate stats
      const total = notificationData.length
      const unread = notificationData.filter(n => !n.is_read).length
      const today = notificationData.filter(n => {
        const notifDate = new Date(n.created_at).toDateString()
        const todayDate = new Date().toDateString()
        return notifDate === todayDate
      }).length
      const read = total - unread

      setStats({ total, unread, today, read })

      if (showRefreshToast) {
        toast.dismiss()
        toast.success(`Berhasil memuat ${total} notifikasi`)
      }

    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Gagal memuat notifikasi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map(notif =>
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ))

      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1
      }))

      toast.success('Ditandai sebagai dibaca')
    } catch (error) {
      console.error('Error marking as read:', error)
      toast.error('Gagal menandai notifikasi sebagai dibaca')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      if (unreadNotifications.length === 0) {
        toast.info('Semua notifikasi sudah dibaca')
        return
      }

      await api.put('/notifications/mark-all-read')

      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })))
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }))

      toast.success('Semua notifikasi ditandai sebagai dibaca')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Gagal menandai semua notifikasi sebagai dibaca')
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

  const getTimeAgo = (dateString) => {
    if (!dateString) return '-'
    const now = new Date()
    const notifDate = new Date(dateString)
    const diffInMs = now - notifDate
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} menit yang lalu`
    } else if (diffInHours < 24) {
      return `${diffInHours} jam yang lalu`
    } else {
      return `${diffInDays} hari yang lalu`
    }
  }

  const handleRefresh = () => {
    fetchNotifications(true)
  }

  const getNotificationIcon = (notification) => {
    if (notification.surat_id) {
      return <Mail className="w-5 h-5 text-blue-500" />
    }
    return <Bell className="w-5 h-5 text-gray-500" />
  }

  const getNotificationGradient = (isRead) => {
    if (!isRead) {
      return "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-l-4 border-blue-400"
    }
    return "bg-gradient-to-r from-gray-50 via-white to-gray-50 border-l-4 border-gray-200"
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col space-y-4 justify-center items-center h-screen">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">Memuat Notifikasi</p>
            <p className="text-sm text-gray-500">Mohon tunggu sebentar...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="">

        {/* Header Section with Stats */}
        <div className="mb-8">
          <div className="bg-gradient-to-tl from-gray-50 via-white to-gray-50 rounded-3xl shadow-lg border border-black/5 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex justify-center items-center w-12 h-12 bg-white shadow-lg rounded-2xl backdrop-blur-sm">
                  <Bell className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-black">Notifikasi</h1>
                  <p className="text-gray-700">Kelola semua pemberitahuan Anda</p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 backdrop-blur-sm group"
                >
                  <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
              <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className='bg-blue-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
                <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl shadow-lg animate-bounce">
                      <FileText className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-black uppercase">
                      Total
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className='bg-red-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
                <div className='bg-green-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
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
                      {stats.unread}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className='bg-green-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
                <div className='bg-purple-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl shadow-lg animate-bounce">
                      <CheckCircle className="h-4 w-4 text-green-700" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-black uppercase">
                      Sudah Dibaca
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {stats.read}
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white backdrop-blur-lg rounded-3xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-500 hover:-translate-y-1">
                <div className='bg-purple-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
                <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
                <div className="relative p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl shadow-lg animate-bounce">
                      <Calendar className="h-4 w-4 text-purple-700" />
                    </div>
                    <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-black uppercase">
                      Hari ini
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {stats.today}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Tidak Ada Notifikasi</h3>
              <p className="text-gray-500 text-lg">Belum ada notifikasi yang masuk saat ini.</p>
            </div>
          ) : (
            notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`group ${getNotificationGradient(notification.is_read)} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`p-3 rounded-xl shadow-lg flex-shrink-0 ${!notification.is_read ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {!notification.is_read && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                              Baru
                            </span>
                          )}
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {getTimeAgo(notification.created_at)}
                          </div>
                        </div>

                        {notification.is_read && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Dibaca
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-gray-900 mb-2 leading-relaxed">
                        {notification.message || 'Notifikasi tanpa pesan'}
                      </h3>

                      {notification.description && (
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {notification.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(notification.created_at)}
                        </div>

                        <div className="flex items-center space-x-3">
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Tandai Dibaca
                            </button>
                          )}

                          {notification.surat_id && (
                            <Link
                              to={`/sekretaris-process/${notification.surat_id}`}
                              className="inline-flex items-center px-6 py-3 bg-green-100 hover:bg-green-200 border border-black/5 text-black rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Lihat Surat
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SekretarisNotifications