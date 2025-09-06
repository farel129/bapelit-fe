import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Home,
  User,
  LogOut,
  Menu,
  X,
  Database,
  Users,
  Bell,
  BookPlus,
  MailSearch,
  UserPlus2,
  LetterText,
  Star,
  ChevronDown,
  Settings,
  Search,
  TimerIcon
} from 'lucide-react'
import img from '../../assets/img/logobapelit.png'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Buat Surat', href: '/admin-surat-masuk', icon: BookPlus },
    { name: 'Daftar Surat', href: '/admin-daftar-surat-masuk', icon: MailSearch },
    { name: 'Surat Keluar', href: '/admin-surat-keluar', icon: LetterText },
    { name: 'Jadwal Acara', href: '/admin-jadwal-acara', icon: TimerIcon },
    { name: 'Papan Disposisi', href: '/admin/leaderboard', icon: Star },
    { name: 'Daftar User', href: '/admin-daftar-user', icon: Users },
    { name: 'Buat Akun', href: '/admin-buat-akun', icon: UserPlus2 },
  ]

  const isActive = (path) => location.pathname === path

  const getCurrentPageTitle = () => {
    const currentNav = navigation.find(nav => nav.href === location.pathname)
    return currentNav ? currentNav.name : 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl rounded-r-2xl">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#EDE6E3]">
            <div className="flex items-center gap-x-2">
              <img src={img} alt="" className='w-6' />
              <h1 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Dispoma</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-[#FDFCFB]">
              <X className="w-6 h-6" style={{ color: '#6D4C41' }} />
            </button>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-semibold rounded-xl mb-1 transition-all duration-200 ${isActive(item.href)
                  ? 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] text-white shadow-md'
                  : 'text-[#6D4C41] hover:bg-[#FDFCFB] hover:text-[#2E2A27]'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className='px-4 mt-4'>
            <button
              onClick={logout}
              className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700 transition-colors p-3 rounded-xl hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden lg:fixed lg:flex lg:inset-y-0 lg:flex-col z-10"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        style={{
          width: sidebarHovered ? '208px' : '72px',
          transition: 'width 0.3s ease-in-out'
        }}
      >
        <div className="flex-1 flex flex-col bg-white shadow-md border border-black/15 overflow-hidden h-full">
          <div className="flex-1 flex flex-col pt-6 pb-4">
            {/* Logo section */}
            <div className="flex items-center px-4 mb-6">
              <div className="flex items-center justify-center min-w-[24px] h-6">
                <img src={img} alt="" className='w-5' />
              </div>
              <div
                className="ml-3 overflow-hidden"
                style={{
                  opacity: sidebarHovered ? 1 : 0,
                  width: sidebarHovered ? 'auto' : '0px',
                  transition: 'opacity 0.3s ease-in-out, width 0.3s ease-in-out'
                }}
              >
                <h1 className="text-xl font-bold whitespace-nowrap" style={{ color: '#2E2A27' }}>
                  Dispoma
                </h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 pl-3 space-y-2">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-l-xl font-semibold transition-all duration-200 ${isActive(item.href)
                      ? 'bg-gradient-to-r from-[#D4A373] to-[#6D4C41] text-white shadow-md'
                      : 'text-[#6D4C41] hover:bg-[#FDFCFB] hover:text-[#2E2A27]'
                      }`}
                    style={{
                      padding: sidebarHovered ? '14px 16px' : '14px 12px'
                    }}
                  >
                    <div className="flex items-center justify-center min-w-[20px] h-5">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div
                      className="ml-3 overflow-hidden"
                      style={{
                        opacity: sidebarHovered ? 1 : 0,
                        width: sidebarHovered ? 'auto' : '0px',
                        transition: 'opacity 0.3s ease-in-out, width 0.3s ease-in-out'
                      }}
                    >
                      <span className="whitespace-nowrap text-sm">
                        {item.name}
                      </span>
                    </div>
                  </Link>

                  {/* Tooltip untuk collapsed state */}
                  {!sidebarHovered && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-lg">
                      {item.name}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Logout button */}
            <div className="px-3">
              <div className="relative group">
                <button
                  onClick={logout}
                  className="flex items-center cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700 transition-all duration-200 rounded-xl hover:bg-red-50 w-full"
                  style={{
                    padding: sidebarHovered ? '12px 16px' : '12px 12px'
                  }}
                >
                  <div className="flex items-center justify-center min-w-[20px] h-5">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div
                    className="ml-3 overflow-hidden"
                    style={{
                      opacity: sidebarHovered ? 1 : 0,
                      width: sidebarHovered ? 'auto' : '0px',
                      transition: 'opacity 0.3s ease-in-out, width 0.3s ease-in-out'
                    }}
                  >
                    <span className="whitespace-nowrap">Logout</span>
                  </div>
                </button>

                {/* Tooltip untuk collapsed state */}
                {!sidebarHovered && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-30 shadow-lg">
                    Logout
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Topbar */}
      <div className="hidden lg:block fixed top-0 right-0 z-10 bg-white border-b border-[#EDE6E3] shadow-sm"
        style={{
          left: sidebarHovered ? '208px' : '72px',
          transition: 'left 0.3s ease-in-out'
        }}
      >
        <div className="flex items-center justify-between h-16 px-6">
          {/* Page Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold" style={{ color: '#2E2A27' }}>
              {getCurrentPageTitle()}
            </h1>
          </div>

          {/* Right side - Search, Notifications, Profile */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari..."
                className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D4A373] focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-[#6D4C41] hover:bg-[#FDFCFB] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-2 text-gray-600 hover:text-[#6D4C41] hover:bg-[#FDFCFB] rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-[#D4A373] to-[#6D4C41] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-[#2E2A27]">
                    {user?.name || 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  {/* Overlay to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>

                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-[#2E2A27]">
                        {user?.name || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user?.email || 'admin@dispoma.com'}
                      </p>
                    </div>

                    <Link
                      to="/admin/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FDFCFB] hover:text-[#6D4C41] transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile Saya
                    </Link>

                    <Link
                      to="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#FDFCFB] hover:text-[#6D4C41] transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Pengaturan
                    </Link>

                    <hr className="my-2 border-gray-100" />

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        logout()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Top bar */}
      <div className="sticky lg:hidden top-0 bg-white z-30 border-b border-[#EDE6E3] shadow-sm">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" style={{ color: '#6D4C41' }} />
          </button>

          <div className="flex items-center space-x-3">
            <img src={img} className='w-7' alt="" />
            <p className="text-lg font-bold" style={{ color: '#2E2A27' }}>Dispoma</p>
          </div>
        </div>
      </div>

      {/* Main content with adjusted padding for desktop topbar */}
      <div
        className="transition-all duration-300 ease-in-out lg:pl-0"
        style={{
          paddingLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? (sidebarHovered ? '208px' : '72px')
            : '0px',
          paddingTop: typeof window !== 'undefined' && window.innerWidth >= 1024 ? '64px' : '0px'
        }}
      >
        {/* Page content */}
        <main className="flex-1 py-4 px-4 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout