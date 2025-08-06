import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'

export const useSuratDetail = (id) => {
  const [surat, setSurat] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhotos, setSelectedPhotos] = useState(null);


  const fetchSuratDetail = async () => {
    try {
      console.log("ID dari URL:", id)

      const response = await api.get('/dashboard')
      console.log("API Response:", response.data)

const allSurat = response.data.data || []
      console.log("Semua surat:", allSurat)

      const suratDetail = allSurat.find(s => String(s.id) === String(id))
      console.log("Ditemukan surat:", suratDetail)
console.log("Ditemukan surat:", suratDetail)

      setSurat(suratDetail)
    } catch (error) {
      console.error("Error fetching surat detail:", error)
      toast.error('Gagal memuat detail surat')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuratDetail()
  }, [id])

  const updateSuratStatus = (status) => {
    setSurat(prev => ({ ...prev, status }))
  }
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedPhotos) return;

      if (e.key === 'Escape') {
        setSelectedPhotos(null);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPhotos]);

  return {
    surat,
    loading,
    updateSuratStatus,
    selectedPhotos,
    setSelectedPhotos,
    fetchSuratDetail
  }
}