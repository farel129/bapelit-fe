import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, LayoutDashboard, Trash2, InfinityIcon, UserCircle2Icon, IdCardLanyard, Plus, ArrowBigLeft, Loader, Dot, Timer } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts'
import Admin from '../assets/img/adminrobot.png'
import { Link } from 'react-router-dom'
import AdminDaftarSuratMasuk from './AdminDaftarSuratMasuk'
import ServerTimeDisplay from '../components/ServerTimeDisplay'

const AdminDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    const [suratData, setSuratData] = useState([]);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState('');

    // Fetch data dari API
    useEffect(() => {
        fetchAllData();
        fetchDashboardData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch semua surat masuk menggunakan axios
            const suratResponse = await api.get('/surat-masuk/all');

            // Fetch statistik menggunakan axios
            const statsResponse = await api.get('/surat-masuk/stats');

            setSuratData(suratResponse.data?.data || []);
            setStats(statsResponse.data?.stats || {});

        } catch (err) {
            console.error('Error fetching data:', err);

            if (err.response) {
                // Server responded with error status
                const errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
                setError(errorMessage);
                toast.error(errorMessage);
            } else if (err.request) {
                // Request was made but no response received
                setError('Tidak ada respon dari server. Pastikan server backend berjalan.');
                toast.error('Tidak ada respon dari server');
            } else {
                // Something else happened
                setError('Terjadi kesalahan saat mengambil data');
                toast.error('Terjadi kesalahan saat mengambil data');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardData = async () => {
        try {
            const response = await api.get('/dashboard')
            setDashboardData(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        }
    }

    // Data untuk chart jabatan - menggunakan stats yang sudah difetch
    const jabatanChartData = stats && stats.byJabatan ?
        Object.entries(stats.byJabatan).map(([jabatan, count]) => ({
            jabatan: jabatan.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            jumlah: count
        })) : [];

    // Data untuk pie chart status - menggunakan stats yang sudah difetch
    const statusChartData = [
        { name: 'Pending', value: stats?.pending || 0, color: '#262628' },
        { name: 'Diproses', value: stats?.processed || 0, color: '#10b981' }
    ];

    if (loading) {
        return (
            <div className="flex flex-col gap-y-2 items-center justify-center min-h-screen">
                <Loader className='w-8 h-8 text-[#262628] animate-spin' />
                <p>Memuat</p>
            </div>
        );
    }

    return (
        <div className='min-h-screen space-y-4'>

            {/* TOP */}
            <div className='flex space-x-5'>
                {/* Left */}
                <div className="space-y-6 w-3/5">
                    <div className="flex justify-between bg-gradient-to-l from-gray-50 via-white to-gray-50 relative shadow-lg border-black/5 border p-5 rounded-2xl overflow-hidden">
                        <div className='bg-blue-300 h-10 w-10 rounded-full blur-xl bottom-0 right-0 absolute'></div>
                        <div className='bg-pink-300 h-10 w-10 rounded-full blur-xl bottom-5 right-0 absolute'></div>
                        <div className='flex flex-col gap-y-2 '>
                            <div className='flex relative'>
                                <div className="inline-flex items-center rounded-full justify-center w-10 h-10 bg-gray-300 shadow-lg">
                                    <InfinityIcon className="w-4 h-4 text-[#262628]" />
                                </div>
                                <div className="inline-flex absolute ml-7 items-center rounded-full justify-center w-10 h-10 bg-[#fff] shadow-lg">
                                    <LayoutDashboard className="w-4 h-4 text-[#262628]" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-extrabold text-[#262628]">Admin Dashboard</h1>

                            <div className="mt-3 grid grid-cols-1 gap-y-5">
                                <div className="bg-white overflow-hidden shadow rounded-full p-3 px-5">
                                    <div className="flex items-center gap-x-2">
                                        <div className="">
                                            <Mail className="h-6 w-6 text-pink-700" />
                                        </div>
                                        <p className="text-sm font-medium text-[#262628] truncate">
                                            Surat Masuk yang Dibuat:
                                        </p>
                                        <p className="text-lg font-medium text-gray-900">
                                            {dashboardData?.suratMasuk?.length || 0}
                                        </p>
                                    </div>
                                </div>
                                <Link to="/admin-surat-masuk" className='flex gap-x-5 items-center w-fit bg-white shadow-lg rounded-full py-3 px-6 border border-black/5 cursor-pointer hover:-translate-y-0.5 hover:bg-gray-50 transition-all duration-300 '>
                                    <div className='flex gap-x-2 items-center'>
                                        <div className='w-6 h-6 bg-[#262628] rounded-full shadow-lg flex items-center justify-center'>
                                            <Plus className='text-white w-4 h-4' />
                                        </div>
                                        <p className=' text-base font-semibold text-[#262628]'>Buat Surat</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        <div className='w-60 h-full relative items-center'>
                            <div className='w-50 h-50 bg-white absolute rounded-full border-40 border-gray-300'></div>
                            <div className='w-10 self-start h-10 bg-[#999999] absolute rounded-full animate-bounce flex justify-center items-center'><IdCardLanyard className='text-white w-6 h-6' /></div>
                            <img src={Admin} alt="Admin Dashboard" className=' absolute z-20 w-60 h-60' />
                        </div>
                    </div>

                    {/* Bagian Waktu Server */}
                    <ServerTimeDisplay />
                </div>

                {/* Right */}
                <div className="w-2/5">
                    <div className="">
                        {/* Pie Chart - Status Distribution */}
                        <div className="group relative bg-white rounded-2xl shadow-lg border border-black/5">
                            <div className="relative">
                                <div className="flex items-center space-x-3 mb-6 p-4">
                                    <div className="w-2 h-8 bg-gradient-to-b from-[#262628] to-teal-600 rounded-full"></div>
                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Distribusi Status</h3>
                                </div>
                                <div className="">
                                    <ResponsiveContainer width="100%" height={150}>
                                        <PieChart>
                                            <Pie
                                                data={statusChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={3}
                                                dataKey="value"
                                                className="drop-shadow-md"
                                            >
                                                {statusChartData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        className="hover:opacity-80 transition-opacity duration-200"
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                                                    backdropFilter: 'blur(10px)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-6 p-4">
                                    {statusChartData.map((entry, index) => (
                                        <div key={index} className="flex items-center p-3 bg-white shadow-lg rounded-xl">
                                            <div className="flex items-center space-x-3 w-full">
                                                <div
                                                    className="w-4 h-4 rounded-full shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: entry.color }}
                                                ></div>
                                                <div className="min-w-0 flex-1">
                                                    <span className="text-sm font-medium text-slate-700 block truncate">{entry.name}</span>
                                                    <span className="text-xs text-slate-500">{entry.value} items</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BOTTOM */}
            <div>
                <div className="group relative bg-white p-5 rounded-3xl shadow-md border border-black/5">
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-3">

                        <div className="bg-white">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-2 h-8 bg-gradient-to-b from-black to-[#2ca5d1] rounded-full"></div>
                                <h3 className="text-xl font-bold text-slate-800 tracking-tight">Surat per Jabatan</h3>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={jabatanChartData} margin={{ bottom: 5, top: 5 }}>
                                    <CartesianGrid strokeDasharray="2 4" stroke="#e2e8f0" opacity={0.6} />
                                    <XAxis
                                        dataKey="jabatan"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <YAxis
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    />
                                    <Bar
                                        dataKey="jumlah"
                                        fill="url(#barGradient)"
                                        radius={[8, 8, 0, 0]}
                                        className="hover:opacity-80 transition-opacity duration-200"
                                    />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2ca5d1" />
                                            <stop offset="100%" stopColor="#fff" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-1 gap-3 mt-6 p-4 bg-white shadow-lg border border-black/5 rounded-3xl">
                            {jabatanChartData.map((entry, index) => (
                                <div key={index} className="flex items-center justify-between p-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-4 h-4 rounded-full bg-[#2ca5d1] shadow-sm flex-shrink-0"></div>
                                        <span className="text-sm font-medium text-slate-700 truncate">{entry.jabatan}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-slate-800">{entry.jumlah}</span>
                                        <span className="text-xs text-slate-500 ml-1">surat</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="mt-6">
                    <AdminDaftarSuratMasuk />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard