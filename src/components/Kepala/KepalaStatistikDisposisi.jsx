import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileText, TrendingUp, Clock, CheckCircle, AlertCircle, Forward, Calendar, RefreshCcw, Activity, Eye, Archive } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const KepalaStatistikDisposisi = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatistik = async () => {
        try {
            setLoading(true);
            const response = await api.get('/kepala/statistik/disposisi');
            setStats(response.data.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching statistics:', err);
            setError(err.response?.data?.error || 'Gagal memuat statistik');
            toast.error(err.response?.data?.error || 'Gagal memuat statistik');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistik();
    }, []);

    const statusConfig = {
        belum_dibaca: {
            color: '#D9534F',
            gradient: 'from-[#D9534F] to-[#B52B27]',
            bgGradient: 'from-red-50 to-red-100',
            icon: AlertCircle,
            label: 'Belum Dibaca'
        },
        sudah_dibaca: {
            color: '#D4A373',
            gradient: 'from-[#D4A373] to-[#6D4C41]',
            bgGradient: 'from-amber-50 to-amber-100',
            icon: Eye,
            label: 'Sudah Dibaca'
        },
        diproses: {
            color: '#4CAF50',
            gradient: 'from-[#4CAF50] to-[#2E7D32]',
            bgGradient: 'from-green-50 to-green-100',
            icon: Activity,
            label: 'Diproses'
        },
        selesai: {
            color: '#2196F3',
            gradient: 'from-[#2196F3] to-[#0D47A1]',
            bgGradient: 'from-blue-50 to-blue-100',
            icon: CheckCircle,
            label: 'Selesai'
        }
    };

    // StatCard component
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

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border-2 border-[#EDE6E3] rounded-2xl shadow-xl p-4">
                    <p className="font-semibold text-[#2E2A27] mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                            Jumlah: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A373]"></div>
                <span className="ml-2 text-[#6D4C41]">Memuat statistik...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p className="text-[#2E2A27] font-semibold mb-2">Terjadi Kesalahan</p>
                <p className="text-[#6D4C41] text-sm mb-6">{error}</p>
                <button
                    onClick={fetchStatistik}
                    className="bg-gradient-to-br from-[#D9534F] to-[#B52B27] hover:from-[#B52B27] hover:to-[#8B0000] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg border border-[#EDE6E3]"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!stats) return null;

    const chartData = Object.entries(stats.statistik_status)
        .filter(([key]) => key !== 'total' && key !== 'diteruskan')
        .map(([key, value]) => ({
            name: statusConfig[key].label,
            value,
            color: statusConfig[key].color,
            key
        }));

    const pieData = chartData.filter(item => item.value > 0);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <div className="h-8 w-1.5 bg-gradient-to-b from-[#D4A373] via-[#6D4C41] to-[#2E2A27] rounded-full shadow-sm"></div>
                    <div>
                        <h1 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Statistik Disposisi</h1>
                        <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Analisis data disposisi surat</p>
                    </div>
                </div>
                <button
                    onClick={fetchStatistik}
                    className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-[#2E2A27] px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-[#D4A373]"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Disposisi"
                    count={stats.statistik_status.total.toLocaleString('id-ID')}
                    icon={Archive}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#D4A373] to-[#6D4C41]"
                    borderColor="border-[#EDE6E3]"
                />
                <StatCard
                    title="Belum Dibaca"
                    count={stats.statistik_status.belum_dibaca || 0}
                    icon={Clock}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#D9534F] to-[#B52B27]"
                    borderColor="border-[#EDE6E3]"
                />
                <StatCard
                    title="Diproses"
                    count={stats.statistik_status.diproses || 0}
                    icon={Activity}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]"
                    borderColor="border-[#EDE6E3]"
                />
                <StatCard
                    title="Selesai"
                    count={stats.statistik_status.selesai || 0}
                    icon={CheckCircle}
                    bgColor="bg-white"
                    textColor="text-[#2E2A27]"
                    iconBg="bg-gradient-to-br from-[#2196F3] to-[#0D47A1]"
                    borderColor="border-[#EDE6E3]"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-[#EDE6E3]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
                                <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Distribusi Status</h3>
                                <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Grafik batang status disposisi</p>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                            <defs>
                                {chartData.map((entry, index) => (
                                    <linearGradient key={index} id={`gradient-${entry.key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.3} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#EDE6E3" />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 12, fill: '#6D4C41' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                stroke="#6D4C41"
                            />
                            <YAxis tick={{ fontSize: 12, fill: '#6D4C41' }} stroke="#6D4C41" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#gradient-${entry.key})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-[#EDE6E3]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] rounded-xl shadow-md">
                                <Eye className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Proporsi Status</h3>
                                <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Diagram lingkaran status disposisi</p>
                            </div>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                                outerRadius={120}
                                innerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-br from-[#2196F3] to-[#0D47A1] rounded-xl shadow-md">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Ringkasan Statistik</h3>
                            <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Persentase berdasarkan status</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(stats.persentase_status)
                            .filter(([key]) => key !== 'total' && key !== 'diteruskan')
                            .map(([key, percentage]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="font-medium" style={{ color: '#6D4C41' }}>{statusConfig[key].label}</span>
                                    <span className="font-semibold text-[#2E2A27]">{percentage}%</span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-br from-[#D4A373] to-[#6D4C41] rounded-xl shadow-md">
                            <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold" style={{ color: '#2E2A27' }}>Informasi Data</h3>
                            <p className="text-sm font-medium" style={{ color: '#6D4C41' }}>Ringkasan data disposisi</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium" style={{ color: '#6D4C41' }}>Total Disposisi</span>
                            <span className="font-semibold text-[#2E2A27]">{stats.statistik_status.total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium" style={{ color: '#6D4C41' }}>Tingkat Penyelesaian</span>
                            <span className="font-semibold text-[#2E2A27]">
                                {stats.statistik_status.total > 0 
                                    ? ((stats.statistik_status.selesai / stats.statistik_status.total) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium" style={{ color: '#6D4C41' }}>Perlu Tindakan</span>
                            <span className="font-semibold text-[#2E2A27]">
                                {(stats.statistik_status.belum_dibaca || 0) + (stats.statistik_status.diproses || 0)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KepalaStatistikDisposisi;