// utils/suratHelpers.js
export const formatDate = (dateString) => {
  if (!dateString) return 'Tidak ada tanggal';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getStatusBadge = (status) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    processed: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return `px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`;
};

export const filterSuratMasuk = (suratList, searchTerm, statusFilter) => {
  return suratList.filter(surat => {
    const matchSearch =
      surat.asal_instansi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surat.nomor_surat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surat.tujuan_jabatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surat.keterangan?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || surat.status === statusFilter;

    return matchSearch && matchStatus;
  });
};