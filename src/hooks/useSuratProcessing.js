import { useState } from 'react'
import toast from 'react-hot-toast'
import { api } from '../utils/api'

export const useSuratProcessing = (id, onProcessComplete) => {
  const [processing, setProcessing] = useState(false)
  const [showProcessingPopup, setShowProcessingPopup] = useState(false)
  const [processingComplete, setProcessingComplete] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleSubmit = async (formData) => {
    setProcessing(true)
    setShowProcessingPopup(true)
    setProcessingComplete(false)

    try {
      // Convert array back to string for backend compatibility if needed
      const dataToSend = {
        ...formData,
        tindakan: formData.tindakan.join(', ') // Join multiple actions with comma
      }      
      await api.post(`/surat/${id}/process`, dataToSend)
      
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setProcessingComplete(true)
      toast.success('Surat berhasil diproses!')
      
      // Callback to update parent component
      if (onProcessComplete) {
        onProcessComplete()
      }
      
    } catch (error) {
      console.error("Full error object:", error)
      setShowProcessingPopup(false)

      if (error.response) {
        console.error("Response data:", error.response.data)
        console.error("Response status:", error.response.status)
        toast.error(error.response.data?.error || 'Gagal memproses surat')
      } else if (error.request) {
        console.error("No response from server:", error.request)
        toast.error('Tidak ada respon dari server.')
      } else {
        console.error("Error saat setup request:", error.message)
        toast.error('Terjadi kesalahan saat mengirim data.')
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      const response = await api.get(`/surat/${id}/pdf`, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const total = progressEvent.total
          const current = progressEvent.loaded
          const percentage = Math.round((current / total) * 100)
          setDownloadProgress(percentage)
        }
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `surat-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('PDF berhasil diunduh!')
      setShowProcessingPopup(false)
      
    } catch (error) {
      toast.error('Gagal mengunduh PDF')
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  const closePopup = () => {
    setShowProcessingPopup(false)
    setProcessingComplete(false)
    setDownloadProgress(0)
  }

  return {
    processing,
    showProcessingPopup,
    processingComplete,
    downloadProgress,
    isDownloading,
    handleSubmit,
    handleDownloadPDF,
    closePopup
  }
}