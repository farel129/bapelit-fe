import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
  UserPlus2
} from 'lucide-react'
import img from '../assets/img/logobapelit.png'

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Buat Surat', href: '/admin-surat-masuk', icon: BookPlus },
    { name: 'Daftar Surat', href: '/admin-daftar-surat-masuk', icon: MailSearch },
    { name: 'Daftar User', href: '/admin-daftar-user', icon: Users },
    { name: 'Buat Akun', href: '/admin-buat-akun', icon: UserPlus2 },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-white lg:pl-5">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <h1 className="text-xl font-bold text-[#262628]">Dispoma</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md mb-1 ${isActive(item.href)
                  ? 'bg-[#cfcfcf] text-black'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-4 h-6 w-6" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className='px-4 mt-2'>
            <button
              onClick={logout}
              className="flex items-center space-x-1 cursor-pointer text-sm font-semibold text-red-400 hover:text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:flex lg:inset-y-0 lg:w-50 lg:flex-col pl-4 rounded-3xl shadow-lg my-6 border border-black/5 bg-gradient-to-b from-gray-50 via-white to-white overflow-hidden">
        <div className='bg-blue-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
        <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
        <div className="flex-1 flex flex-col pt-3">
          <div className=" flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <img src={img} alt="" className='w-5 mr-2 ' />
              <h1 className="text-2xl font-extrabold text-gray-900">Dispoma</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 rounded-l-2xl ${isActive(item.href)
                    ? 'bg-[#fff] text-black shadow-md  border-[1px] border-black/5 text-sm'
                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900 text-xs'
                    }`}
                >
                  <item.icon className="mr-3 h-3 w-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className='px-4 mt-7'>
              <button
                onClick={logout}
                className="flex items-center space-x-1 cursor-pointer text-sm font-semibold text-red-400 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main content */}
      {/* Top bar */}
      <div className="sticky lg:hidden top-0 bg-white pt-3 z-30 border-b border-b-black/10 overflow-hidden">
        <div className="flex items-center gap-x-3 h-16 px-4">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img src={img} className='w-4' alt="" />
              <p className='text-[#262628] text-lg font-extrabold'>Dispoma</p>
            </div>

          </div>
        </div>
      </div>
      <div className='lg:pl-50'>
        {/* Page content */}
        <main className="flex-1 px-4 py-6 lg:px-5  min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout