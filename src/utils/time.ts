// Device-locale relative labels for backend UTC ISO instants ("now", "5m", "3h", "2d").
export function formatRelativeTime(isoUtc: string): string {
  const then = new Date(isoUtc).getTime();
  const diffMs = Date.now() - then;
  if (Number.isNaN(then) || diffMs < 0) return '';
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString();
}
