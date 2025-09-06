import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, LayoutDashboard, InfinityIcon, Plus, Timer, CheckCircle, Clock, RefreshCcw, TrendingUp, FileText, AlertCircle, Calendar } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts'
import { Link } from 'react-router-dom'
import AdminDaftarSuratMasuk from './AdminDaftarSuratMasuk'

const AdminDashboard = () => {
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
    const persentaseBaca = totalSurat > 0 ? ((sudahDibaca / totalSurat) * 100).toFixed(1) : 0;

    // Cocoa Latte color palette for charts
    const pieData = [
        { name: 'Belum Dibaca', value: belumDibaca, color: '#D4A373' }, // Light Brown/Cocoa
        { name: 'Sudah Dibaca', value: sudahDibaca, color: '#6D4C41' }   // Medium Brown
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

    const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor, subtitle, trend }) => (
        <div className={`${bgColor} p-6 rounded-xl shadow-lg border-2 ${borderColor} hover:shadow-xl transition-all duration-300 group backdrop-blur-sm`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <p className={`text-sm font-semibold ${textColor} opacity-80`}>{title}</p>
                        {trend && (
                            <div className="flex items-center gap-1 text-[#6D4C41]">
                                <TrendingUp className="w-3 h-3" />
                                <span className="text-xs font-medium">+{trend}%</span>
                            </div>
                        )}
                    </div>
                    <p className={`text-3xl font-bold ${textColor} leading-tight`}>{count}</p>
                    {subtitle && (
                        <p className={`text-xs ${textColor} opacity-60 mt-1 font-medium`}>{subtitle}</p>
                    )}
                </div>
                <div className={`${iconBg} p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 border border-white/20`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </div>
    );

    const QuickAction = ({ title, icon: Icon, onClick, disabled = false }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-6 rounded-xl border-2 border-dashed transition-all duration-300 
                ${disabled 
                    ? 'border-[#EDE6E3] text-[#6D4C41]/50 cursor-not-allowed' 
                    : 'border-[#EDE6E3] text-[#6D4C41] hover:border-[#D4A373] hover:text-[#2E2A27] hover:bg-gradient-to-br hover:from-[#FDFCFB] hover:to-[#EDE6E3]/30 hover:shadow-lg'
                }`}
        >
            <div className="flex flex-col items-center gap-3">
                <Icon className="w-6 h-6" />
                <span className="text-sm font-semibold">{title}</span>
            </div>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 bg-gradient-to-br from-[#FDFCFB] via-white to-[#EDE6E3]/30">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#EDE6E3]/30"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#D4A373] border-t-transparent absolute inset-0"></div>
                    </div>
                    <p className="text-[#6D4C41] font-semibold text-lg">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            {/* Background Elements */}

            <div className="relative space-y-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Surat"
                        count={totalSurat}
                        subtitle="Keseluruhan surat masuk"
                        icon={FileText}
                        bgColor="bg-gradient-to-br from-white/90 via-[#FDFCFB]/80 to-[#EDE6E3]/50 backdrop-blur-sm"
                        textColor="text-[#2E2A27]"
                        iconBg="bg-gradient-to-br from-[#6D4C41] to-[#2E2A27]"
                        borderColor="border-[#EDE6E3]/60 hover:border-[#D4A373]/60"
                        trend={totalSurat > 0 ? "5.2" : null}
                    />
                    <StatCard
                        title="Belum Dibaca"
                        count={belumDibaca}
                        subtitle="Memerlukan perhatian"
                        icon={AlertCircle}
                        bgColor="bg-gradient-to-br from-white/90 via-[#FDFCFB]/80 to-[#EDE6E3]/50 backdrop-blur-sm"
                        textColor="text-[#2E2A27]"
                        iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
                        borderColor="border-[#EDE6E3]/60 hover:border-[#D4A373]/60"
                    />
                    <StatCard
                        title="Sudah Dibaca"
                        count={sudahDibaca}
                        subtitle="Telah diproses"
                        icon={CheckCircle}
                        bgColor="bg-gradient-to-br from-white/90 via-[#FDFCFB]/80 to-[#EDE6E3]/50 backdrop-blur-sm"
                        textColor="text-[#2E2A27]"
                        iconBg="bg-gradient-to-br from-[#6D4C41] to-[#2E2A27]"
                        borderColor="border-[#EDE6E3]/60 hover:border-[#D4A373]/60"
                    />
                    <StatCard
                        title="Tingkat Baca"
                        count={`${persentaseBaca}%`}
                        subtitle="Persentase dibaca"
                        icon={TrendingUp}
                        bgColor="bg-gradient-to-br from-white/90 via-[#FDFCFB]/80 to-[#EDE6E3]/50 backdrop-blur-sm"
                        textColor="text-[#2E2A27]"
                        iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
                        borderColor="border-[#EDE6E3]/60 hover:border-[#D4A373]/60"
                        trend={persentaseBaca > 50 ? "12.5" : null}
                    />
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Pie Chart */}
                    <div className="bg-gradient-to-br from-white/95 via-[#FDFCFB]/90 to-[#EDE6E3]/60 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#EDE6E3]/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-[#2E2A27]">Status Surat Masuk</h2>
                                <p className="text-sm text-[#6D4C41] mt-1 opacity-80">Distribusi status surat dalam sistem</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#D4A373] rounded-full shadow-sm"></div>
                                    <span className="text-xs text-[#6D4C41] font-medium">Belum</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-[#6D4C41] rounded-full shadow-sm"></div>
                                    <span className="text-xs text-[#6D4C41] font-medium">Sudah</span>
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
                                                backgroundColor: 'rgba(253, 252, 251, 0.95)',
                                                border: '2px solid #EDE6E3',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                fontSize: '14px',
                                                backdropFilter: 'blur(8px)',
                                                color: '#2E2A27'
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
                                                fontWeight: '600',
                                                color: '#6D4C41'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-72 text-center">
                                <div className="bg-gradient-to-br from-[#EDE6E3]/50 to-[#D4A373]/20 rounded-full p-8 mb-4">
                                    <Mail className="w-16 h-16 text-[#6D4C41]/60" />
                                </div>
                                <h3 className="text-lg font-bold text-[#2E2A27] mb-2">Belum ada surat masuk</h3>
                                <p className="text-[#6D4C41] max-w-sm opacity-80">
                                    Grafik akan muncul setelah ada surat masuk yang terdaftar dalam sistem
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bar Chart - Monthly Data */}
                    <div className="bg-gradient-to-br from-white/95 via-[#FDFCFB]/90 to-[#EDE6E3]/60 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#EDE6E3]/60 p-6 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-[#2E2A27]">Surat Masuk Per Bulan</h2>
                                <p className="text-sm text-[#6D4C41] mt-1 opacity-80">Distribusi surat masuk tahun {new Date().getFullYear()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-br from-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
                                    <span className="text-xs text-[#6D4C41] font-medium">Total</span>
                                </div>
                                <Calendar className="w-5 h-5 text-[#D4A373]" />
                            </div>
                        </div>
                        
                        {totalSurat > 0 ? (
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#EDE6E3" />
                                        <XAxis 
                                            dataKey="month" 
                                            tick={{ fontSize: 12, fill: '#6D4C41', fontWeight: 500 }}
                                            axisLine={{ stroke: '#EDE6E3' }}
                                        />
                                        <YAxis 
                                            tick={{ fontSize: 12, fill: '#6D4C41', fontWeight: 500 }}
                                            axisLine={{ stroke: '#EDE6E3' }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'rgba(253, 252, 251, 0.95)',
                                                border: '2px solid #EDE6E3',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                                fontSize: '14px',
                                                backdropFilter: 'blur(8px)',
                                                color: '#2E2A27'
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
                                                fontWeight: '600',
                                                color: '#6D4C41'
                                            }}
                                        />
                                        <Bar 
                                            dataKey="total" 
                                            fill="#6D4C41" 
                                            name="total"
                                            radius={[6, 6, 0, 0]}
                                            stroke="#2E2A27"
                                            strokeWidth={1}
                                        />
                                        <Bar 
                                            dataKey="belumDibaca" 
                                            fill="#D4A373" 
                                            name="belumDibaca"
                                            radius={[6, 6, 0, 0]}
                                            stroke="#6D4C41"
                                            strokeWidth={1}
                                        />
                                        <Bar 
                                            dataKey="sudahDibaca" 
                                            fill="#2E2A27" 
                                            name="sudahDibaca"
                                            radius={[6, 6, 0, 0]}
                                            stroke="#6D4C41"
                                            strokeWidth={1}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-72 text-center">
                                <div className="bg-gradient-to-br from-[#EDE6E3]/50 to-[#D4A373]/20 rounded-full p-8 mb-4">
                                    <Calendar className="w-16 h-16 text-[#6D4C41]/60" />
                                </div>
                                <h3 className="text-lg font-bold text-[#2E2A27] mb-2">Belum ada data bulanan</h3>
                                <p className="text-[#6D4C41] max-w-sm opacity-80">
                                    Grafik bulanan akan muncul setelah ada surat masuk yang terdaftar dalam sistem
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-white/95 via-[#FDFCFB]/90 to-[#EDE6E3]/60 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#EDE6E3]/60 p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-[#2E2A27] mb-6">Aksi Cepat</h3>
                            <div className="space-y-4">
                                <Link to="/admin-surat-masuk">
                                    <QuickAction
                                        title="Tambah Surat Masuk"
                                        icon={Plus}
                                    />
                                </Link>
                            </div>
                        </div>                        
                    </div>

                    {/* Monthly Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-white/95 via-[#FDFCFB]/90 to-[#EDE6E3]/60 backdrop-blur-sm rounded-xl shadow-lg border-2 border-[#EDE6E3]/60 p-6 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-xl font-bold text-[#2E2A27] mb-6">Ringkasan Bulanan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {monthlyData.slice(-4).map((month, index) => (
                                    <div key={index} className="text-center p-6 bg-gradient-to-br from-[#EDE6E3]/40 to-[#D4A373]/20 rounded-xl border border-[#EDE6E3]/40 hover:shadow-lg transition-all duration-300">
                                        <h4 className="font-bold text-[#2E2A27] text-lg">{month.month}</h4>
                                        <p className="text-3xl font-bold text-[#6D4C41] mt-2">{month.total}</p>
                                        <div className="text-xs text-[#6D4C41] mt-3 space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span>Belum:</span>
                                                <span className="text-[#D4A373] font-bold bg-[#D4A373]/20 px-2 py-1 rounded-full">{month.belumDibaca}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Sudah:</span>
                                                <span className="text-[#6D4C41] font-bold bg-[#6D4C41]/20 px-2 py-1 rounded-full">{month.sudahDibaca}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Surat List Section */}
                <div className="">
                    <AdminDaftarSuratMasuk />
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard