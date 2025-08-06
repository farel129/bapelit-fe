// ServerTimeDisplay.jsx
import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

const ServerTimeDisplay = () => {
  const [serverTime, setServerTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(new Date());
    }, 1000);

    return () => clearInterval(timer); // Bersihkan interval saat komponen unmount
  }, []);

  // Format hari dan tanggal (Anda bisa pindahkan logika ini ke sini atau tetap di parent)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayName = days[serverTime.getDay()];
  const date = serverTime.getDate();
  const monthName = months[serverTime.getMonth()];
  const year = serverTime.getFullYear();
  const timeString = serverTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className='bg-white flex items-center text-sm rounded-xl shadow-lg p-5 border border-black/5'>
      <Timer className='w-8 h-8 mr-1' />
      <p className='font-semibold mr-2'>
        Waktu server:
      </p>
      <p className="text-gray-700">{dayName}, {date} {monthName} {year} | {timeString} WIB</p>
    </div>
  );
};

export default ServerTimeDisplay;