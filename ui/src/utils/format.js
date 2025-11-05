export const formatRelativeTime = (timestamp) => {
  if (!timestamp) {
    return 'Never';
  }

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp.getTime()) / 1000));
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }
  if (seconds < 86400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const formatRequestValue = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return '0 req';
  }
  return `${value.toLocaleString()} req`;
};
