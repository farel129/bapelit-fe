import { Copy, Download, ExternalLink, Loader2, Plus, QrCode } from 'lucide-react';
import React from 'react'

const CreateBukuTamu = ({
    view,
    createEvent,
    formData,
    setFormData,
    setView,
    setQrCode,
    setGuestUrl,
    actionLoading,
    qrCode,
    guestUrl,
    downloadQRCode,
    copyToClipboard,
}) => {
    const [isQrOnlyMode, setIsQrOnlyMode] = React.useState(false);
    const [countdown, setCountdown] = React.useState(60); // Mulai dari 60 detik
    const qrTimerRef = React.useRef(null);
    const intervalRef = React.useRef(null);

    React.useEffect(() => {
        if (qrCode && guestUrl) {
            setIsQrOnlyMode(true);
            setCountdown(60); // Reset countdown

            // Bersihkan timer sebelumnya jika ada
            if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Update countdown setiap detik
            intervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setIsQrOnlyMode(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Auto-close setelah 60 detik
            qrTimerRef.current = setTimeout(() => {
                setIsQrOnlyMode(false);
                setCountdown(0);
                clearInterval(intervalRef.current);
            }, 60000);

            return () => {
                if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
                if (intervalRef.current) clearInterval(intervalRef.current);
            };
        }
    }, [qrCode, guestUrl]);

    const handleCloseQr = () => {
        setIsQrOnlyMode(false);
        setCountdown(0);
        if (qrTimerRef.current) clearTimeout(qrTimerRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    return (
        <div>
            {/* Tampilkan QR Only Mode Full Screen dengan Timer */}
            {isQrOnlyMode && qrCode && guestUrl && (
                <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8 relative max-w-md w-full">
                        {/* Tombol Close */}
                        <button
                            onClick={handleCloseQr}
                            className="absolute top-4 right-4 bg-black/10 hover:bg-black/20 text-black rounded-full p-2 transition-colors z-10"
                            aria-label="Close QR View"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Timer Countdown */}
                        <div className="absolute top-4 left-4 bg-black/10 text-black px-3 py-1 rounded-full text-sm font-medium">
                            Kembali dalam {countdown} detik
                        </div>

                        <div className="text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-[#f6339a] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <QrCode className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-[#000000] mb-2">QR Code Acara</h3>
                                <p className="text-[#6b7280] text-sm">Tunjukkan QR Code ini kepada tamu Anda.</p>
                            </div>
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/40">
                                <img
                                    src={qrCode}
                                    alt="QR Code"
                                    className="mx-auto mb-4 border-4 border-white rounded-2xl shadow-lg"
                                    style={{ maxWidth: '250px', height: 'auto' }}
                                />
                                <div className="space-y-3">
                                    <p className="text-xs font-semibold text-[#000000]">Link untuk Tamu:</p>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-[#e5e7eb]">
                                        <code className="text-xs text-[#000000] break-all font-mono">{guestUrl}</code>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center gap-3">
                                <button
                                    onClick={() => downloadQRCode(qrCode, formData.nama_acara)}
                                    className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl hover:shadow-lg inline-flex items-center text-sm font-medium transition-all duration-200 shadow-sm"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download QR
                                </button>
                                <button
                                    onClick={() => copyToClipboard(guestUrl)}
                                    className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl hover:shadow-lg inline-flex items-center text-sm font-medium transition-all duration-200 shadow-sm"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Salin Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tampilkan Form hanya jika bukan mode QR Only */}
            {view === 'create' && !isQrOnlyMode && (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-4xl mx-auto">
                        <div className='flex gap-x-2 items-center mb-8'>
                            <div className='bg-white text-teal-400 p-3 flex justify-center items-center shadow-lg border border-slate-200 rounded-xl'>
                                <Plus className='w-7 h-7' />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-[#000000]">Buat Acara Baru</h2>
                                <p className='text-sm text-[#6b7280]'>Isi form untuk membuat buku tamu dan dapatkan QRcode</p>
                            </div>
                        </div>
                        <form onSubmit={createEvent} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-[#000000] mb-3">
                                        Nama Acara <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.nama_acara}
                                        onChange={(e) => setFormData({ ...formData, nama_acara: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000]"
                                        placeholder="Masukkan nama acara"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#000000] mb-3">
                                        Tanggal Acara <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.tanggal_acara}
                                        onChange={(e) => setFormData({ ...formData, tanggal_acara: e.target.value })}
                                        className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#000000] mb-3">
                                    Lokasi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lokasi}
                                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000]"
                                    placeholder="Masukkan lokasi acara"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[#000000] mb-3">
                                    Deskripsi
                                </label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white border border-[#e5e7eb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f6339a] focus:border-transparent text-[#000000] resize-none"
                                    placeholder="Masukkan deskripsi acara (opsional)"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setView('events');
                                        setFormData({ nama_acara: '', tanggal_acara: '', lokasi: '', deskripsi: '' });
                                        setQrCode('');
                                        setGuestUrl('');
                                    }}
                                    className="px-6 py-3 text-[#000000] bg-white border border-[#e5e7eb] rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading['create']}
                                    className="px-6 py-3 bg-black hover:opacity-90 text-white rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                                >
                                    {actionLoading['create'] ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Membuat Acara...
                                        </>
                                    ) : (
                                        'Buat Acara'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CreateBukuTamu