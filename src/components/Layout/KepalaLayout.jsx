import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Home,
  LogOut,
  Menu,
  X,
  UserCircle2,
  TrendingUpIcon,
  SplitSquareHorizontalIcon,
  Camera,
  User2
} from 'lucide-react'
import img from '../../assets/img/logobapelit.png'

const KepalaLayout = ({ children }) => {
  const { logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/kepala', icon: Home },
    { name: 'Jadwal Acara', href: '/kepala/jadwal-acara', icon: SplitSquareHorizontalIcon },
    { name: 'Dokumentasi', href: '/kepala/dokumentasi', icon: Camera },
    { name: 'Papan Disposisi', href: '/kepala/leaderboard', icon: TrendingUpIcon },
    { name: 'Daftar User', href: '/kepala/daftar-user', icon: UserCircle2 }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gradient-to-bl from-gray-100 via-gray-50 to-white">
      <header className='hidden flex-1 h-17 z-20 fixed inset-0 bg-transparent backdrop-blur-2xl text-black lg:flex justify-between items-center p-4'>
        <div className='flex items-center gap-x-1'>
          <img src={img} alt="" className='w-5 brightness-0' />
          <h1 className='text-lg lg:text-3xl font-bold'>
            <span className='bg-gradient-to-bl via-teal-800 from-teal-400 to-black bg-clip-text text-transparent'>
              Magessa
            </span>
          </h1>
        </div>

        <div>
          <input
            type="search"
            placeholder='search'
            className='rounded-full bg-white focus:outline-none shadow-md px-3 pl-5 py-2 w-96' />
        </div>

        <div>
          <div className='rounded-full bg-black p-3 text-white flex justify-center items-center'>
            <User2 className='w-5 h-5' />
          </div>
        </div>
      </header>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl rounded-r-2xl">
          <div className="flex items-center justify-between h-16 px-4 border-b border-[#EDE6E3]">
            <div className="flex items-center gap-x-1">
              <img src={img} alt="" className='w-4 brightness-0' />
              <h1 className='text-lg lg:text-xl font-black'>
                <span className='bg-gradient-to-bl via-teal-800 from-teal-400 to-black bg-clip-text text-transparent'>
                  Magessa
                </span>
              </h1>
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
                  ? 'bg-white text-teal-400 shadow-md'
                  : 'text-[#6d4141] hover:bg-[#FDFCFB] hover:text-[#2e2727]'
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

      <div className=''>

        {/* Desktop sidebar */}
        <div
          className="hidden lg:fixed lg:flex lg:inset-y-0 lg:flex-col z-10 my-6 mt-20 mx-3"
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
          style={{
            width: sidebarHovered ? '208px' : '72px',
            transition: 'width 0.3s ease-in-out'
          }}
        >
          <div className="flex-1 flex flex-col bg-transparent overflow-hidden h-full">
            <div className="flex-1 flex flex-col pt-6 pb-4">
              {/* Navigation */}
              <nav className="flex-1 px-3 space-y-2">
                {navigation.map((item) => (
                  <div key={item.name} className="relative group">
                    <Link
                      to={item.href}
                      className={`flex items-center rounded-xl font-semibold transition-all duration-200 ${isActive(item.href)
                        ? 'bg-white text-teal-400 shadow-md'
                        : 'text-[#6d4141] hover:bg-[#FDFCFB] hover:text-[#2e2727]'
                        }`}
                      style={{
                        padding: sidebarHovered ? '7px 16px' : '7px 12px'
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

          <div className="flex items-center space-x-1">
            <img src={img} className='w-4 brightness-0' alt="" />
            <h1 className='text-lg lg:text-xl font-black'>
              <span className='bg-gradient-to-bl via-teal-800 from-teal-400 to-black bg-clip-text text-transparent'>
                Magessa
              </span>
            </h1>
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
        }}
      >
        {/* Page content */}
        <main className="flex-1 px-2 py-2 lg:pb-6 lg:px-7 lg:pt-17 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}

export default KepalaLayout