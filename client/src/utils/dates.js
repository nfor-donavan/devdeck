// Date-only values from the API look like 2026-09-23T00:00:00.000Z; treat them as plain calendar dates.
export const dayStr = (v) => (v ? String(v).slice(0, 10) : '');
export const todayStr = () => new Date().toLocaleDateString('en-CA');
const fromDay = (s) => new Date(s + 'T12:00:00');

export const fmtDate = (v) => (v ? fromDay(dayStr(v)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—');
export const fmtDateTime = (v) =>
  v ? new Date(v).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';

export function relDay(v) {
  if (!v) return '';
  const diff = Math.round((fromDay(dayStr(v)) - fromDay(todayStr())) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff < 7) return fromDay(dayStr(v)).toLocaleDateString('en-US', { weekday: 'long' });
  return fmtDate(v);
}

export const isOverdue = (t) => t.status !== 'completed' && [t.scheduledDate, t.dueDate].some((d) => d && dayStr(d) < todayStr());
export const hours = (mins) => Math.round(((mins || 0) / 60) * 10) / 10;
