import { useState, useEffect } from 'react'

export const useSuratForm = (surat) => {
  const [formData, setFormData] = useState({
    nomor_surat: '',
    perihal: '',
    disposisi_kepada: '',
    tindakan: [],
    sifat: '',
    catatan: ''
  })

  useEffect(() => {
    if (surat) {
      // Handle tindakan conversion from string to array
      let tindakanArray = []
      if (surat.tindakan) {
        if (Array.isArray(surat.tindakan)) {
          tindakanArray = surat.tindakan
        } else if (typeof surat.tindakan === 'string') {
          // Split by comma and trim whitespace
          tindakanArray = surat.tindakan
            .split(',')
            .map(item => item.trim())
            .filter(item => item.length > 0)
        }
      }

      console.log("Tindakan yang akan diset:", tindakanArray)

      setFormData({
        nomor_surat: surat.nomor_surat || '',
        perihal: surat.perihal || '',
        disposisi_kepada: surat.disposisi_kepada || '',
        tindakan: tindakanArray,
        sifat: surat.sifat || '',
        catatan: surat.catatan || ''
      })
    }
  }, [surat])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Handle multiple action selection
  const handleTindakanChange = (selectedOption, e) => {
    if (e) {
      e.stopPropagation()
    }
    
    const currentTindakan = formData.tindakan
    
    if (currentTindakan.includes(selectedOption)) {
      setFormData({
        ...formData,
        tindakan: currentTindakan.filter(item => item !== selectedOption)
      })
    } else {
      setFormData({
        ...formData,
        tindakan: [...currentTindakan, selectedOption]
      })
    }
  }

  // Remove specific action
  const removeTindakan = (tindakanToRemove, e) => {
    e.stopPropagation()
    setFormData({
      ...formData,
      tindakan: formData.tindakan.filter(item => item !== tindakanToRemove)
    })
  }

  return {
    formData,
    handleChange,
    handleTindakanChange,
    removeTindakan
  }
}