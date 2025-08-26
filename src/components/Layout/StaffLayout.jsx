import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Home,
  User,
  LogOut,
  Menu,
  X,
  Star
} from 'lucide-react'
import img from '../../assets/img/logobapelit.png'

const StaffLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/staff', icon: Home },
    { name: 'Daftar User', href: '/staff/daftar-user', icon: User },
    { name: 'Papan Disposisi', href: '/staff/leaderboard', icon: Star },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FDFCFB' }}>
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
      <div className="hidden lg:fixed lg:flex lg:inset-y-0 lg:w-52 lg:flex-col pl-4 my-6">
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-md border-2 border-[#EDE6E3] overflow-hidden">
          <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div className="flex items-center justify-center flex-shrink-0 px-4">
              <img src={img} alt="" className='w-5 mr-2' />
              <h1 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Dispoma</h1>
            </div>
            <nav className="mt-6 flex-1 space-y-2 px-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3.5 transition-all duration-200 rounded-xl font-semibold ${isActive(item.href)
                    ? 'bg-gradient-to-r from-[#D4A373] text-sm to-[#6D4C41] text-white shadow-md'
                    : 'text-[#6D4C41] hover:bg-[#FDFCFB] text-xs hover:text-[#2E2A27]'
                    }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className='px-4 mt-6'>
              <button
                onClick={logout}
                className="flex items-center space-x-2 cursor-pointer text-sm font-semibold text-red-600 hover:text-red-700 transition-colors p-3 rounded-xl hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      {/* Top bar */}
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

      <div className='lg:pl-52'>
        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default StaffLayout