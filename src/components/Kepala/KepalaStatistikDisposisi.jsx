import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FileText, TrendingUp, Clock, CheckCircle, AlertCircle, RefreshCcw, Activity, Eye, Archive } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../Ui/LoadingSpinner';

const KepalaStatistikDisposisi = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatistik = async () => {
        try {
            setLoading(true);
            const response = await api.get('/disposisi/statistik');
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

    // === PALET WARNA WARNANI UNTUK SEMUA STATUS ===
    const colorPalette = [
        '#EC4899',
        '#00bba7',
        '#000000',
        '#737373',
    ];

    const statusConfig = {
        belum_dibaca: {
            color: colorPalette[0],
            gradient: 'from-pink-500 to-pink-600',
            bgGradient: 'from-pink-50 to-pink-100',
            icon: AlertCircle,
            label: 'Belum Dibaca'
        },
        diproses: {
            color: colorPalette[1],
            gradient: 'from-emerald-500 to-emerald-600',
            bgGradient: 'from-emerald-50 to-emerald-100',
            icon: Activity,
            label: 'Diproses'
        },
        selesai: {
            color: colorPalette[2],
            gradient: 'from-violet-500 to-violet-600',
            bgGradient: 'from-violet-50 to-violet-100',
            icon: CheckCircle,
            label: 'Selesai'
        },
        sudah_dibaca: {
            color: colorPalette[3],
            gradient: 'from-amber-500 to-amber-600',
            bgGradient: 'from-amber-50 to-amber-100',
            icon: Eye,
            label: 'Sudah Dibaca'
        }
    };

    // === STAT CARD COMPONENT (KONSISTEN DENGAN SURAT MASUK LIST) ===
    const StatCard = ({ title, count, icon: Icon, bgColor, textColor, iconBg, borderColor, iconColor }) => (
        <div className={`${bgColor} p-3 rounded-2xl shadow-sm border ${borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
            <div className="flex items-center gap-x-7 justify-between">
                <div>
                    <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
                    <p className={`text-3xl font-bold ${textColor} mt-2`}>{count}</p>
                </div>
                <div className={`${iconBg} p-3 rounded-xl shadow-md`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );

    // === CUSTOM TOOLTIP (DISAMAKAN DENGAN GAYA STANDAR) ===
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border-2 border-[#EDE6E3] rounded-2xl shadow-xl p-4">
                    <p className="font-semibold text-black mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-medium text-black">
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
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                <AlertCircle className="h-12 w-12 text-black mx-auto mb-4" />
                <p className="text-black font-semibold mb-2">Terjadi Kesalahan</p>
                <p className="text-black text-sm mb-6">{error}</p>
                <button
                    onClick={fetchStatistik}
                    className="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg border border-[#EDE6E3]"
                >
                    Coba Lagi
                </button>
            </div>
        );
    }

    if (!stats) return null;

    // === DATA UNTUK GRAFIK ===
    const chartData = Object.entries(stats.statistik_status)
        .filter(([key]) => key !== 'total' && key !== 'diteruskan')
        .map(([key, value]) => ({
            name: statusConfig[key].label,
            value,
            key,
            color: statusConfig[key].color // 👈 Tambahkan warna untuk konsistensi
        }));

    const pieData = chartData.filter(item => item.value > 0);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={fetchStatistik}
                    className="bg-white hover:bg-[#FDFCFB] border-2 border-[#EDE6E3] gap-x-2 flex items-center text-black px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:border-white"
                >
                    <RefreshCcw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <StatCard
                    title="Total Disposisi"
                    count={stats.statistik_status.total.toLocaleString('id-ID')}
                    icon={Archive}
                    bgColor="bg-white"
                    textColor="text-black"
                    iconBg="bg-pink-500"
                    borderColor="border-slate-200"
                    iconColor='text-white'
                />
                <StatCard
                    title="Belum Dibaca"
                    count={stats.statistik_status.belum_dibaca || 0}
                    icon={Clock}
                    bgColor="bg-white"
                    textColor="text-black"
                    iconBg="bg-slate-200"
                    borderColor="border-slate-200"
                    iconColor="text-black"
                />
                <StatCard
                    title="Diproses"
                    count={stats.statistik_status.diproses || 0}
                    icon={Activity}
                    bgColor="bg-white"
                    textColor="text-black"
                    iconBg="bg-neutral-500"
                    borderColor="border-slate-200"
                    iconColor="text-white"
                />
                <StatCard
                    title="Selesai"
                    count={stats.statistik_status.selesai || 0}
                    icon={CheckCircle}
                    bgColor="bg-black"
                    textColor="text-white"
                    iconBg="bg-white"
                    borderColor="border-slate-200"
                    iconColor="text-pink-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 mb-4">
                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-sm p-4 border-2 border-[#EDE6E3]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-200 rounded-xl shadow-md">
                                <Activity className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-black">Distribusi Status</h3>
                                <p className="text-sm font-medium text-black opacity-80">Grafik batang status disposisi</p>
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
                                tick={{ fontSize: 12, fill: 'black' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                stroke="black"
                            />
                            <YAxis tick={{ fontSize: 12, fill: 'black' }} stroke="black" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#gradient-${entry.key})`}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl shadow-sm p-4 border-2 border-[#EDE6E3]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-200 rounded-xl shadow-md">
                                <Eye className="h-5 w-5 text-black" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-black">Proporsi Status</h3>
                                <p className="text-sm font-medium text-black opacity-80">Diagram lingkaran status disposisi</p>
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
                                outerRadius={120}
                                innerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                wrapperStyle={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: 'black',
                                    lineHeight: '1.5'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-slate-200 rounded-xl shadow-md">
                            <TrendingUp className="h-5 w-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-black">Ringkasan Statistik</h3>
                            <p className="text-sm font-medium text-black opacity-80">Persentase berdasarkan status</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(stats.persentase_status)
                            .filter(([key]) => key !== 'total' && key !== 'diteruskan')
                            .map(([key, percentage]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="font-medium text-black">{statusConfig[key].label}</span>
                                    <span className="font-semibold text-black">{percentage}%</span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border-2 border-[#EDE6E3] shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-slate-200 rounded-xl shadow-md">
                            <FileText className="h-5 w-5 text-black" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-black">Informasi Data</h3>
                            <p className="text-sm font-medium text-black opacity-80">Ringkasan data disposisi</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-black">Total Disposisi</span>
                            <span className="font-semibold text-black">{stats.statistik_status.total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-black">Tingkat Penyelesaian</span>
                            <span className="font-semibold text-black">
                                {stats.statistik_status.total > 0
                                    ? ((stats.statistik_status.selesai / stats.statistik_status.total) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-black">Perlu Tindakan</span>
                            <span className="font-semibold text-black">
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