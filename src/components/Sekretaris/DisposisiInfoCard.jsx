import React from 'react'
import { formatIndonesianDate } from '../../utils/timeZone'
import { AlertCircle, Building, Calendar, Clock, FileText, MessageSquare, User } from 'lucide-react'
import StatusBadge from './StatusBadge'

const DisposisiInfoCard = ({ disposisi }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {/* Informasi Surat */}
      <div>
        <div className="flex items-center mb-4">
          <div className="p-3 bg-white rounded-xl shadow-lg mr-1">
            <FileText className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className=" font-semibold" >Informasi Surat</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Building className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Nomor Surat</p>
            </div>
            <p className="font-semibold" >{disposisi.nomor_surat || '-'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Building className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Asal Instansi</p>
            </div>
            <p className="font-semibold" >{disposisi.asal_instansi || '-'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Tanggal Surat</p>
            </div>
            <p className="font-semibold" >{new Date(disposisi.tanggal_surat).toLocaleDateString('id-ID')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Diterima Tanggal</p>
            </div>
            <p className="font-semibold" >{new Date(disposisi.diterima_tanggal).toLocaleDateString('id-ID')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <FileText className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Nomor Agenda</p>
            </div>
            <p className="font-semibold" >{disposisi.nomor_agenda || '-'}</p>
          </div>
        </div>
      </div>
      {/* Informasi Disposisi */}
      <div>
        <div className="flex items-center mb-4">
          <div className="p-3 bg-white rounded-xl shadow-lg mr-1">
            <MessageSquare className="w-6 h-6 text-teal-400" />
          </div>
          <h3 className=" font-semibold" >Informasi Disposisi</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-sm font-semibold mb-2" >Status</p>
            <div className="inline-block">
              <StatusBadge status={disposisi.status_dari_sekretaris} />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Sifat</p>
            </div>
            <p className="font-semibold" >{disposisi.sifat || '-'}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Disposisi Kepada Jabatan</p>
            </div>
            <p className="font-semibold" >{disposisi.disposisi_kepada_jabatan}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <User className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Diteruskan Kepada</p>
            </div>
            <p className="font-semibold" >{disposisi.diteruskan_kepada_nama || disposisi.diteruskan_kepada_jabatan}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 mr-2" />
              <p className="text-sm font-semibold" >Tanggal Disposisi</p>
            </div>
            <p className="font-semibold" >{formatIndonesianDate(disposisi.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DisposisiInfoCard