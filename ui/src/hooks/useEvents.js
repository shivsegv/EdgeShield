import { useCallback, useEffect, useState } from 'react';

const DEFAULT_REFRESH_INTERVAL = 5000;

const useEvents = (autoRefresh, refreshInterval = DEFAULT_REFRESH_INTERVAL) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/v1/events');
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      setEvents(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message || 'Unable to load events.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!autoRefresh) {
      return undefined;
    }

    const interval = setInterval(fetchEvents, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchEvents, refreshInterval]);

  return {
    events,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchEvents,
  };
};

export default useEvents;
