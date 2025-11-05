import { useMemo } from 'react';
import {
  buildTimelineData,
  calculateTotals,
  calculateVelocityStats,
  derivePressureDescriptor,
  countUniqueApiKeys,
  getTopEntries,
} from '../utils/analytics';

const FRESH_THRESHOLD_MS = 90_000;

const useEventInsights = (events, sortedEvents) => {
  const totals = useMemo(() => calculateTotals(events), [events]);

  const topPaths = useMemo(() => getTopEntries(events, (event) => event.path), [events]);
  const topApiKeys = useMemo(() => getTopEntries(events, (event) => event.api_key), [events]);
  const topMethods = useMemo(() => getTopEntries(events, (event) => event.method), [events]);
  const blockedReasons = useMemo(
    () => getTopEntries(events.filter((event) => event.decision === 'blocked'), (event) => event.reason),
    [events],
  );

  const timelineData = useMemo(() => buildTimelineData(events), [events]);
  const velocityStats = useMemo(() => calculateVelocityStats(timelineData), [timelineData]);

  const uniqueApiKeys = useMemo(() => countUniqueApiKeys(events), [events]);

  const lastTelemetryEvent = useMemo(
    () => (sortedEvents.length ? new Date(sortedEvents[0].timestamp) : null),
    [sortedEvents],
  );

  const lastAllowedEvent = useMemo(() => {
    const event = sortedEvents.find((entry) => entry.decision === 'allowed');
    return event ? new Date(event.timestamp) : null;
  }, [sortedEvents]);

  const ingestFresh = useMemo(
    () => (lastTelemetryEvent ? Date.now() - lastTelemetryEvent.getTime() < FRESH_THRESHOLD_MS : false),
    [lastTelemetryEvent],
  );
  const allowFresh = useMemo(
    () => (lastAllowedEvent ? Date.now() - lastAllowedEvent.getTime() < FRESH_THRESHOLD_MS : false),
    [lastAllowedEvent],
  );

  const pressureDescriptor = useMemo(() => derivePressureDescriptor(timelineData), [timelineData]);

  const allowRate = useMemo(
    () => (totals.total ? Math.round((totals.allowed / totals.total) * 100) : 0),
    [totals.allowed, totals.total],
  );

  const chartData = useMemo(
    () => [
      {
        id: 0,
        value: totals.allowed,
        label: 'Allowed',
        color: '#4ade80',
      },
      {
        id: 1,
        value: totals.blocked,
        label: 'Blocked',
        color: '#f87171',
      },
    ],
    [totals.allowed, totals.blocked],
  );

  return {
    totals,
    topPaths,
    topApiKeys,
    topMethods,
    blockedReasons,
    timelineData,
    velocityStats,
    uniqueApiKeys,
    lastTelemetryEvent,
    allowFresh,
    ingestFresh,
    pressureDescriptor,
    allowRate,
    chartData,
  };
};

export default useEventInsights;
