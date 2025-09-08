import { useState, useCallback } from 'react';
import { BukuTamuService } from '../services/bukuTamuService';

export const useBukuTamu = () => {
  const [events, setEvents] = useState([]);
  const [guests, setGuests] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  
  // Pagination states
  const [eventsPagination, setEventsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });
  const [guestsPagination, setGuestsPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0
  });

  // Helper function untuk loading state
  const setActionLoadingState = useCallback((action, isLoading) => {
    setActionLoading(prev => ({ ...prev, [action]: isLoading }));
  }, []);

  // Load events
  const loadEvents = useCallback(async (page = 1, search = '', status = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      
      const data = await BukuTamuService.getEvents(params);
      setEvents(data.data);
      setEventsPagination(data.pagination);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create event
  const createEvent = useCallback(async (formData) => {
    setActionLoadingState('create', true);
    try {
      const data = await BukuTamuService.createEvent(formData);
      await loadEvents();
      return data;
    } catch (error) {
      throw error;
    } finally {
      setActionLoadingState('create', false);
    }
  }, [loadEvents, setActionLoadingState]);

  // Toggle event status
  const toggleEventStatus = useCallback(async (eventId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setActionLoadingState(`status-${eventId}`, true);
    try {
      await BukuTamuService.updateEventStatus(eventId, newStatus);
      await loadEvents(eventsPagination.current_page);
    } catch (error) {
      throw error;
    } finally {
      setActionLoadingState(`status-${eventId}`, false);
    }
  }, [loadEvents, eventsPagination.current_page, setActionLoadingState]);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    setActionLoadingState(`delete-${eventId}`, true);
    try {
      await BukuTamuService.deleteEvent(eventId);
      await loadEvents(eventsPagination.current_page);
    } catch (error) {
      throw error;
    } finally {
      setActionLoadingState(`delete-${eventId}`, false);
    }
  }, [loadEvents, eventsPagination.current_page, setActionLoadingState]);

  // Load guests
  const loadGuests = useCallback(async (eventId, page = 1, search = '') => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      
      const data = await BukuTamuService.getGuests(eventId, params);
      setGuests(data.data);
      setCurrentEvent(data.buku_tamu);
      setGuestsPagination(data.pagination);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete guest photo
  const deleteGuestPhoto = useCallback(async (photoId) => {
    setActionLoadingState(`photo-${photoId}`, true);
    try {
      await BukuTamuService.deleteGuestPhoto(photoId);
      if (currentEvent) {
        await loadGuests(currentEvent.id, guestsPagination.current_page);
      }
    } catch (error) {
      throw error;
    } finally {
      setActionLoadingState(`photo-${photoId}`, false);
    }
  }, [currentEvent, loadGuests, guestsPagination.current_page, setActionLoadingState]);

  return {
    // States
    events,
    guests,
    currentEvent,
    loading,
    actionLoading,
    eventsPagination,
    guestsPagination,
    
    // Actions
    loadEvents,
    createEvent,
    toggleEventStatus,
    deleteEvent,
    loadGuests,
    deleteGuestPhoto,
    setActionLoadingState
  };
};