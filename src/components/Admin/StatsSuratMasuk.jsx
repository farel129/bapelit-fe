import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Plus, CheckCircle, TrendingUp, AlertCircle, Calendar } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'
import SuratMasukTerbaru from './SuratMasukTerbaru.jsx'

const StatsSuratMasuk = () => {
    const [loading, setLoading] = useState(true);

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
            const suratResponse = await api.get('/surat-masuk');
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
    const persentaseBaca = totalSurat > 0 ? ((sudahDibaca / totalSurat) * 100).toFixed(1) : 0;

    // pink color palette for charts
    const pieData = [
        { name: 'Belum Dibaca', value: belumDibaca, color: '#000000' }, // pink-500
        { name: 'Sudah Dibaca', value: sudahDibaca, color: '#f6339a' }   // pink-500
    ];

    // Calculate monthly data for bar chart
    const getMonthlyData = () => {
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
            'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
        ];

        const currentYear = new Date().getFullYear();
        const monthlyCount = {};

        // Initialize all months with 0
        months.forEach((month, index) => {
            monthlyCount[index] = {
                month: month,
                total: 0,
                belumDibaca: 0,
                sudahDibaca: 0
            };
        });

        // Count surat by month
        suratData.forEach(surat => {
            const suratDate = new Date(surat.created_at);
            if (suratDate.getFullYear() === currentYear) {
                const monthIndex = suratDate.getMonth();
                monthlyCount[monthIndex].total++;
                if (surat.status === 'belum dibaca') {
                    monthlyCount[monthIndex].belumDibaca++;
                } else {
                    monthlyCount[monthIndex].sudahDibaca++;
                }
            }
        });

        return Object.values(monthlyCount);
    };

    const monthlyData = getMonthlyData();

    const StatCard = ({ title, count, icon: Icon, subtitle, trend, bgColor = 'bg-white', borderColor = 'border-gray-200', titleColor = 'text-gray-400', countColor = 'text-black', bgIcon = 'bg-pink-500', iconColor = 'text-white' }) => (
        <div className={`${bgColor} p-4 rounded-xl shadow-lg border-2 ${borderColor} hover:shadow-xl transition-all duration-300`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>
                        {trend && (
                            <div className="flex items-center gap-1 text-pink-500">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs font-medium">+{trend}%</span>
                            </div>
                        )}
                    </div>
                    <p className={`text-3xl font-bold ${countColor} leading-tight`}>{count}</p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-1 font-medium">{subtitle}</p>
                    )}
                </div>
                <div className={`${bgIcon} p-3 self-end rounded-xl shadow-lg transition-all duration-300`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 bg-gray-50">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent absolute inset-0"></div>
                    </div>
                    <p className="text-black font-semibold text-lg">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="">
                {/* Stats Overview */}
                <div className='flex flex-row gap-x-2 items-center mb-5 w-full'>
                    <div>
                        <div className='w-1 h-5 bg-slate-300 rounded-full'></div>
                    </div>
                    <p className='text-sm text-slate-300 font-bold whitespace-nowrap uppercase'>Surat Masuk</p>
                </div>
                <div className=' space-y-5 ' >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        <div className='flex flex-col justify-between'>
                            <p className='text-lg font-semibold capitalize'>total surat masuk</p>
                            <p className='text-5xl font-bold'>{totalSurat}</p>
                            <p className='text-xs'>(Total surat yang anda buat)</p>
                        </div>
                        <StatCard
                            title="Belum Dibaca"
                            count={belumDibaca}
                            subtitle="Memerlukan perhatian"
                            icon={AlertCircle}
                            bgIcon='bg-white'
                            iconColor='text-black'
                        />
                        <StatCard
                            title="Sudah Dibaca"
                            count={sudahDibaca}
                            subtitle="Telah diproses"
                            borderColor='border-pink-200'
                            icon={CheckCircle}
                        />
                        <StatCard
                            title="Tingkat Baca"
                            count={`${persentaseBaca}%`}
                            subtitle="Persentase dibaca"
                            icon={TrendingUp}
                            bgColor='bg-black'
                            titleColor='text-white'
                            countColor='text-white'
                            bgIcon='bg-white'
                            iconColor='text-pink-500'
                            trend={persentaseBaca > 50 ? "12.5" : null}
                            borderColor='border-black'
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        {/* Pie Chart */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-black">Status</h2>
                                    <p className="text-sm text-gray-400 mt-1">Status surat masuk </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-black rounded-full"></div>
                                        <span className="text-xs text-gray-400 font-medium">Belum</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-pink-500 rounded-full"></div>
                                        <span className="text-xs text-gray-400 font-medium">Sudah</span>
                                    </div>
                                </div>
                            </div>

                            {totalSurat > 0 ? (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.color}
                                                        stroke="white"
                                                        strokeWidth={3}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #f6339a',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '14px',
                                                    color: 'black'
                                                }}
                                                formatter={(value) => [value, 'Jumlah']}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                wrapperStyle={{
                                                    paddingTop: '20px',
                                                    fontSize: '14px',
                                                    fontWeight: '400',
                                                    color: 'black'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-72 text-center">
                                    <div className="bg-gray-100 rounded-full p-8 mb-4">
                                        <Mail className="w-16 h-16 text-black" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-black mb-2">Belum ada surat masuk</h3>
                                    <p className="text-gray-400 max-w-sm">
                                        Grafik akan muncul setelah ada surat masuk yang terdaftar dalam sistem
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Bar Chart - Monthly Data */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-black">Statistik Per Bulan</h2>
                                    <p className="text-sm text-gray-400 mt-1">Distribusi surat masuk tahun {new Date().getFullYear()}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Calendar className="w-5 h-5 text-pink-500" />
                                </div>
                            </div>

                            {totalSurat > 0 ? (
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="month"
                                                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                                                axisLine={{ stroke: '#e5e7eb' }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                    fontSize: '14px',
                                                    color: 'black'
                                                }}
                                                formatter={(value, name) => {
                                                    if (name === 'total') return [value, 'Total Surat'];
                                                    if (name === 'belumDibaca') return [value, 'Belum Dibaca'];
                                                    if (name === 'sudahDibaca') return [value, 'Sudah Dibaca'];
                                                    return [value, name];
                                                }}
                                                labelFormatter={(label) => `Bulan: ${label}`}
                                            />
                                            <Legend
                                                wrapperStyle={{
                                                    paddingTop: '20px',
                                                    fontSize: '14px',
                                                    fontWeight: '400',
                                                    color: 'black'
                                                }}
                                            />
                                            <Bar
                                                dataKey="total"
                                                fill="#f6339a"
                                                name="total"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="belumDibaca"
                                                fill="#000000"
                                                name="belumDibaca"
                                                radius={[4, 4, 0, 0]}
                                            />
                                            <Bar
                                                dataKey="sudahDibaca"
                                                fill="#f6339a"
                                                name="sudahDibaca"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-72 text-center">
                                    <div className="bg-gray-100 rounded-full p-8 mb-4">
                                        <Calendar className="w-16 h-16 text-black" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-black mb-2">Belum ada data bulanan</h3>
                                    <p className="text-gray-400 max-w-sm">
                                        Grafik bulanan akan muncul setelah ada surat masuk yang terdaftar dalam sistem
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="w-full">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-black mb-4">Ringkasan Bulanan</h3>
                                <div className="grid grid-cols-2 md:grid-cols-2 gap-2">
                                    {monthlyData.slice(-8).map((month, index) => (
                                        <div key={index} className="text-center p-2 flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                                            <div>
                                                <h4 className="font-semibold text-black text-lg">{month.month}</h4>
                                                <p className="text-lg font-semibold text-pink-500 mt-1">{month.total}</p>
                                            </div>

                                            <div className="text-xs text-gray-400 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span>Belum:</span>
                                                    <span className="text-pink-500 font-semibold bg-pink-50 px-2 py-1 rounded-full">{month.belumDibaca}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span>Dibaca:</span>
                                                    <span className="text-pink-500 font-semibold bg-pink-100 px-2 py-1 rounded-full">{month.sudahDibaca}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='flex lg:flex-row flex-col w-full gap-2'>
                        <div className="">
                            {/* Quick Actions */}
                            <div className="bg-pink-500 hover:bg-pink-600 transition-colors duration-200 rounded-xl shadow-lg p-5">
                                <div className="space-y-4">
                                    <Link to="/admin-surat-masuk">
                                        <div className='text-white flex flex-col space-y-4 items-center justify-center'>
                                            <p className='text-center'>Tambah Surat Masuk</p>
                                            <div className='border border-white flex justify-center items-center p-4 rounded-full'>
                                                <Plus className='w-7 h-7' />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Surat List Section */}
                            <SuratMasukTerbaru />
                    </div>

                </div>

            </div>
        </div>
    )
}

export default StatsSuratMasuk