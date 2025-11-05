export const getTopEntries = (collection, selector, limit = 5) => {
  const counts = new Map();
  collection.forEach((item) => {
    const key = selector(item) || 'unknown';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
};

export const buildTimelineData = (events) => {
  if (!events.length) {
    return [];
  }

  const buckets = new Map();
  events.forEach((event) => {
    if (!event.timestamp) {
      return;
    }
    const bucketDate = new Date(event.timestamp);
    if (Number.isNaN(bucketDate.getTime())) {
      return;
    }
    bucketDate.setSeconds(0, 0);
    const key = bucketDate.toISOString();
    if (!buckets.has(key)) {
      buckets.set(key, {
        timestamp: bucketDate,
        allowed: 0,
        blocked: 0,
      });
    }
    const bucket = buckets.get(key);
    if (event.decision === 'blocked') {
      bucket.blocked += 1;
    } else {
      bucket.allowed += 1;
    }
  });

  const sorted = [...buckets.values()].sort((a, b) => a.timestamp - b.timestamp);
  return sorted.slice(-12).map((bucket) => ({
    ...bucket,
    label: bucket.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    total: bucket.allowed + bucket.blocked,
  }));
};

export const calculateTotals = (events) => {
  const total = events.length;
  const allowed = events.filter((event) => event.decision === 'allowed').length;
  const blocked = total - allowed;
  const blockedRate = total ? `${Math.round((blocked / total) * 1000) / 10}%` : '0%';
  const uniqueIPs = new Set(events.map((event) => event.client_ip)).size;
  return { total, allowed, blocked, blockedRate, uniqueIPs };
};

export const calculateVelocityStats = (timelineData) => {
  if (!timelineData.length) {
    return { average: 0, peak: 0, latest: 0 };
  }
  const totals = timelineData.map((bucket) => bucket.total);
  const average = Math.round(totals.reduce((acc, value) => acc + value, 0) / totals.length);
  const peak = Math.max(...totals);
  const latest = totals[totals.length - 1];
  return { average, peak, latest };
};

export const derivePressureDescriptor = (timelineData) => {
  if (!timelineData.length) {
    return { label: 'Calm perimeter', helper: 'Waiting for telemetry pulses' };
  }
  const latest = timelineData[timelineData.length - 1];
  if (!latest.total) {
    return { label: 'Idle mesh', helper: 'No events captured in the last minute' };
  }
  const ratio = latest.blocked / latest.total;
  if (ratio > 0.6) {
    return { label: 'High challenger load', helper: 'Defense is actively throttling hostile bursts' };
  }
  if (ratio > 0.3) {
    return { label: 'Guarded posture', helper: 'Elevated block activity, keep monitoring' };
  }
  return { label: 'Healthy cadence', helper: 'Most traffic is flowing cleanly through the edge' };
};

export const countUniqueApiKeys = (events) => {
  const keys = new Set();
  events.forEach((event) => {
    if (event.api_key) {
      keys.add(event.api_key);
    }
  });
  return keys.size;
};
