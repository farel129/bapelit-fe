import React from 'react'
import { Mail, FileText, Users, ArrowRight } from 'lucide-react'

const HomePage = () => {
    const menuItems = [
        {
            title: 'Surat Masuk',
            description: 'Kelola surat masuk dengan mudah',
            icon: Mail,
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700'
        },
        {
            title: 'Disposisi',
            description: 'Distribusi dan tindak lanjut dokumen',
            icon: FileText,
            color: 'from-emerald-500 to-emerald-600',
            hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
        },
        {
            title: 'Daftar User',
            description: 'Manajemen pengguna sistem',
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:from-purple-600 hover:to-purple-700'
        }
    ]

    return (
        <section className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col justify-center items-center px-6'>
            {/* Header Section */}
            <div className='mb-16 text-center'>
                <div className='mb-6'>
                    <h1 className='text-8xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent mb-4 tracking-tight'>
                        DISPOMA
                    </h1>
                    <div className='h-1 w-32 bg-gradient-to-r from-orange-500 to-pink-500 mx-auto rounded-full opacity-80'></div>
                </div>
                <p className='text-xl text-slate-600 font-medium'>Sistem Disposisi Surat Modern</p>
                <p className='text-slate-500 mt-2'>Pilih menu untuk memulai</p>
            </div>

            {/* Menu Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full'>
                {menuItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <div 
                            key={index}
                            className='group relative bg-white/70 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden'
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}></div>
                            
                            {/* Icon */}
                            <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                <Icon className='w-8 h-8 text-white' />
                            </div>

                            {/* Content */}
                            <div className='relative z-10'>
                                <h3 className='text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors'>
                                    {item.title}
                                </h3>
                                <p className='text-slate-600 mb-8 leading-relaxed'>
                                    {item.description}
                                </p>

                                {/* Button */}
                                <button className={`w-full bg-gradient-to-r ${item.color} ${item.hoverColor} text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group-hover:scale-105`}>
                                    <span>Lihat</span>
                                    <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform duration-300' />
                                </button>
                            </div>

                            {/* Decorative Elements */}
                            <div className='absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                            <div className='absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700'></div>
                        </div>
                    )
                })}
            </div>

            {/* Footer Decoration */}
            <div className='mt-20 flex gap-2'>
                {[...Array(3)].map((_, i) => (
                    <div 
                        key={i}
                        className='w-2 h-2 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full opacity-60 animate-pulse'
                        style={{ animationDelay: `${i * 0.5}s` }}
                    ></div>
                ))}
            </div>
        </section>
    )
}

export default HomePage