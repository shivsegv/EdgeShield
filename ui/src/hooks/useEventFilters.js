import { useMemo } from 'react';

const useEventFilters = (events, decisionFilter, searchTerm) => {
  const searchValue = searchTerm.trim().toLowerCase();

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesDecision = decisionFilter === 'all' || event.decision === decisionFilter;
      if (!matchesDecision) {
        return false;
      }

      if (!searchValue) {
        return true;
      }

      return [
        event.client_ip,
        event.api_key,
        event.path,
        event.method,
        event.status?.toString(),
        event.reason,
        event.fingerprint?.ua,
      ].some((field) => field && field.toString().toLowerCase().includes(searchValue));
    });
  }, [decisionFilter, events, searchValue]);

  const sortedEvents = useMemo(
    () => [...filteredEvents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    [filteredEvents],
  );

  return { filteredEvents, sortedEvents };
};

export default useEventFilters;
