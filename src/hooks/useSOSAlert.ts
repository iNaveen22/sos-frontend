import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from './useLocation';
import type { LocationCoords } from './useLocation';

export type SOSAlert = {
  id: string;
  status: string;
  createdAt: string;

  current_latitude?: number;
  current_longitude?: number;
  initial_latitude?: number;
  initial_longitude?: number;
  notes?: string;
};

export function useSOSAlert() {
  const { user } = useAuth();
  const { getCurrentLocation,sendLocationToBackend, watchLocation, stopWatching } = useLocation();
  const [activeAlert, setActiveAlert] = useState<SOSAlert | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      loadActiveAlert();
    }
  }, [user]);

  const loadActiveAlert = async () => {
    if (!user) return;

    try {
      const res = await api.get("/api/sos/active");
      const sos = res.data;

      setActiveAlert(sos || null);

      if (sos) {
        startLocationTracking();
      }
    } catch (error) {
      console.error('Error loading active alert:', error);
    }
  };

  const triggerSOS = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('User not authenticated') };

    setLoading(true);
    try {
      const location = await getCurrentLocation();

      await sendLocationToBackend(location, 'BROWSER');

      const res = await api.post('/sos/');

      const sos = res.data;
      setActiveAlert(sos);

      startLocationTracking();

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (watchIdRef.current !== null) {
      stopWatching(watchIdRef.current);
    }

    const watchId = watchLocation((coords: LocationCoords) => {
      sendLocationToBackend(coords, 'AUTO');
    });

    if (watchId !== null) {
      watchIdRef.current = watchId;
    }
  };



  const cancelSOS = async (): Promise<{ error: Error | null }> => {
    if (!activeAlert) return { error: new Error('No active alert') };

    setLoading(true);
    try {
      await api.post('/sos/cancel', {
        sosId: activeAlert.id,
        reason: 'user safe',
      })

      if (watchIdRef.current !== null) {
        stopWatching(watchIdRef.current);
        watchIdRef.current = null;
      }

      setActiveAlert(null);
      return { error: null };
    } catch (error) {
      console.error('Error cancelling SOS:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        stopWatching(watchIdRef.current);
      }
    };
  }, [stopWatching]);

  return {
    activeAlert,
    loading,
    triggerSOS,
    cancelSOS,
    refreshAlert: loadActiveAlert,
  };
}
