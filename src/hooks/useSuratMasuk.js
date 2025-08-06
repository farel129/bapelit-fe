// hooks/useSuratMasuk.js
import { useState, useEffect } from 'react';
import { suratService } from '../services/suratService';
import { filterSuratMasuk } from '../utils/suratHelpers';

export const useSuratMasuk = () => {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPhotos, setSelectedPhotos] = useState(null);

  // Fetch data surat masuk
  const fetchSuratMasuk = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await suratService.getAllSuratMasuk();
      setSuratList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuratMasuk();
  }, []);

  // Filter dan search
  const filteredSurat = filterSuratMasuk(suratList, searchTerm, statusFilter);

  // Handle keyboard navigation for photo modal
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
    suratList,
    filteredSurat,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedPhotos,
    setSelectedPhotos,
    fetchSuratMasuk
  };
};