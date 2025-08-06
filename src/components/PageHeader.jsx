// components/PageHeader.jsx
import React from 'react';
import { FileText, Mail } from 'lucide-react';
import Admin from '../assets/img/admin_daftarsurat.png';

const PageHeader = ({ totalCount }) => {
  return (
    <div className="flex justify-between bg-gradient-to-bl from-gray-100 to-gray-50 p-5 rounded-2xl mb-6 overflow-hidden">
      <div className='flex flex-col gap-y-2 '>
        <h1 className="text-xl font-bold text-[#262628]">Daftar Surat Masuk</h1>
        <p>Total surat: {totalCount}</p>

        <div className='flex relative'>
          <div className="inline-flex items-center rounded-full justify-center w-10 h-10 bg-gray-300 shadow-lg">
            <Mail className="w-4 h-4 text-[#262628]" />
          </div>
          <div className="inline-flex absolute ml-7 items-center rounded-full justify-center w-10 h-10 bg-[#fff] shadow-lg">
            <FileText className="w-4 h-4 text-[#262628]" />
          </div>
        </div>
      </div>

      <div className='w-50 h-full relative flex items-center'>
        <div className='w-50 h-50 bg-[#262628] absolute rounded-full'></div>
        <div className='w-10 self-start h-10 bg-[#999999] absolute rounded-full'></div>
        <div className='w-full rounded-2xl bg-gradient-to-bl from-gray-100/5 to-gray-50/5 backdrop-blur-sm bottom-0 h-[20%] absolute z-1'></div>
        <img src={Admin} alt="" className='z-10 absolute -top-5 -scale-x-100' />
      </div>
    </div>
  );
};

export default PageHeader;