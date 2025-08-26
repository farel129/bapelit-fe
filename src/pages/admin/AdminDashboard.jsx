import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, LayoutDashboard, InfinityIcon, Plus, Timer, CheckCircle, Clock, RefreshCcw } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts'
import Admin from '../../assets/img/adminrobot.png'
import { Link } from 'react-router-dom'
import AdminDaftarSuratMasuk from './AdminDaftarSuratMasuk'
import ServerTimeDisplay from '../../components/ServerTimeDisplay'

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const { user } = useAuth()

    const [suratData, setSuratData] = useState([]);
    const [error, setError] = useState('');

    // Fetch data dari API
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError('');
            const suratResponse = await api.get('/admin/surat-masuk/all');
            setSuratData(suratResponse.data?.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
            if (err.response) {
                const errorMessage = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
                setError(errorMessage);
                toast.error(errorMessage);
            } else if (err.request) {
                setError('Tidak ada respon dari server. Pastikan server backend berjalan.');
                toast.error('Tidak ada respon dari server');
            } else {
                setError('Terjadi kesalahan saat mengambil data');
                toast.error('Terjadi kesalahan saat mengambil data');
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const totalSurat = suratData.length;
    const belumDibaca = suratData.filter(surat => surat.status === 'belum dibaca').length;
    const sudahDibaca = suratData.filter(surat => surat.status === 'sudah dibaca').length;

    // Elegant cocoa latte palette for chart
    const pieData = [
        { name: 'Belum Dibaca', value: belumDibaca, color: '#D9534F' }, // elegant red
        { name: 'Sudah Dibaca', value: sudahDibaca, color: '#4CAF50' }   // elegant green
    ];

    const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor }) => (
        <div className={`${bgColor} p-6 rounded-2xl shadow-sm border ${borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
                    <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
                </div>
                <div className={`${iconBg} p-3 rounded-xl shadow-md`}>
                    <Icon className={`w-6 h-6 text-white`} />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
                <span className="ml-2 text-[#6D4C41]">Memuat dashboard...</span>
            </div>
        );
    }

    return (
        <div className='min-h-screen p-4 md:p-6 rounded-2xl' style={{backgroundColor: '#FDFCFB'}}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="flex items-center gap-x-3 mb-4 md:mb-0">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
                    <div>
                        <h1 className="text-xl font-bold" style={{color: '#2E2A27'}}>Dashboard Administrator</h1>
                        <p className="text-sm font-medium" style={{color: '#6D4C41'}}>Kelola sistem dengan elegan</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAllData}
                        className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
                    >
                        <RefreshCcw className="w-4 h-4" /> Refresh
                    </button>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Surat"
                    count={totalSurat}
                    icon={Mail}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
                    borderColor="border-[#EDE6E3]"
                />
                <StatCard
                    title="Belum Dibaca"
                    count={belumDibaca}
                    icon={Clock}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#D9534F] to-[#B52B27]"
                    borderColor="border-[#EDE6E3]"
                />
                <StatCard
                    title="Sudah Dibaca"
                    count={sudahDibaca}
                    icon={CheckCircle}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
                    borderColor="border-[#EDE6E3]"
                />
            </div>

            {/* TOP */}
            <div className='flex flex-col lg:flex-row lg:space-x-6 space-y-6 lg:space-y-0'>
                {/* Left */}
                <div className="space-y-6 lg:w-3/5 w-full">
                    {/* Welcome Card */}
                    <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] p-8 rounded-2xl border-2 border-[#EDE6E3] shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                            <div className='flex flex-col gap-y-5'>
                                <div className='flex items-center gap-x-4'>
                                    <div className="inline-flex items-center rounded-2xl justify-center w-12 h-12 bg-gradient-to-br from-[#D4A373] via-[#6D4C41] to-[#2E2A27] shadow-lg">
                                        <InfinityIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold" style={{color: '#2E2A27'}}>Selamat Datang Kembali</h2>
                                        <p className="text-sm font-semibold" style={{color: '#6D4C41'}}>Administrator Sistem</p>
                                    </div>
                                </div>
                                
                                <div className="mt-2">
                                    <Link to="/admin-surat-masuk" 
                                        className='inline-flex gap-x-3 items-center bg-gradient-to-r from-[#D4A373] to-[#6D4C41] hover:from-[#6D4C41] hover:to-[#2E2A27] shadow-lg hover:shadow-xl rounded-2xl py-3 px-6 cursor-pointer transition-all duration-200 transform hover:scale-105 border border-[#EDE6E3]'>
                                        <Plus className='text-white w-4 h-4' />
                                        <span className='font-bold text-white'>Buat Surat Masuk Baru</span>
                                    </Link>
                                </div>
                            </div>

                            <div className='w-52 h-52 relative items-center hidden lg:block mt-4 lg:mt-0'>
                                <img src={Admin} alt="Admin Dashboard" className='w-full h-full object-contain opacity-90 filter sepia-0 saturate-110 hue-rotate-15 brightness-105' />
                            </div>
                        </div>
                    </div>

                    {/* Server Time */}
                    <div className="bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3] p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md">
                        <div className="flex items-center gap-x-3 mb-4">
                            <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
                                <Timer className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-lg font-bold" style={{color: '#2E2A27'}}>Waktu Server</h3>
                        </div>
                        <ServerTimeDisplay />
                    </div>
                </div>

                {/* Right - Chart */}
                <div className="lg:w-2/5 w-full">
                    <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md h-full hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-x-3 mb-6">
                            <div className="w-3 h-3 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-full shadow-sm"></div>
                            <h3 className="text-lg font-bold" style={{color: '#2E2A27'}}>Status Surat Masuk</h3>
                        </div>
                        {totalSurat > 0 ? (
                            <div className="flex items-center justify-center h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={75}
                                            fill="#8884d8"
                                            paddingAngle={4}
                                            dataKey="value"
                                            label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            fontSize={11}
                                            fontWeight={600}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.color} 
                                                    stroke="#FDFCFB"
                                                    strokeWidth={3}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: '#FDFCFB', 
                                                border: '2px solid #EDE6E3',
                                                borderRadius: '12px',
                                                color: '#2E2A27',
                                                boxShadow: '0 10px 25px -5px rgba(46, 42, 39, 0.15)',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                            formatter={(value) => [value, 'Jumlah']}
                                            labelStyle={{ 
                                                color: '#6D4C41',
                                                fontWeight: '700'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-52 text-center p-4">
                                <div className="bg-[#EDE6E3] rounded-full p-4 mb-4 shadow-sm border-2 border-[#EDE6E3]">
                                    <Mail className="w-8 h-8 text-[#6D4C41]" />
                                </div>
                                <p className="text-[#2E2A27] text-base font-semibold">Belum ada surat masuk</p>
                                <p className="text-[#6D4C41] text-sm mt-1 font-medium">Data akan muncul setelah surat masuk dibuat</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* BOTTOM */}
            <div className="mt-8">
                <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-md hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-x-3 mb-6">
                        <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold" style={{color: '#2E2A27'}}>Daftar Surat Masuk</h3>
                    </div>
                    <AdminDaftarSuratMasuk />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
