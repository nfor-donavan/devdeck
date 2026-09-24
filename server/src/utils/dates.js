import { env } from '../config/env.js';

// "Day" values (scheduledDate, dueDate, ...) are stored as UTC midnight of the calendar date.
export const ymd = (d = new Date()) => new Date(d).toLocaleDateString('en-CA', { timeZone: env.timezone });
export const today = () => new Date(ymd() + 'T00:00:00Z');
export const dateOnly = (d) => new Date(d).toISOString().slice(0, 10);
export const addDays = (d, n) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() + n); return x; };
export const addMonths = (d, n) => { const x = new Date(d); x.setUTCMonth(x.getUTCMonth() + n); return x; };
export const diffDays = (a, b) => Math.round((new Date(a) - new Date(b)) / 864e5);

export function nextOccurrence(d, freq, interval) {
  if (freq === 'daily') return addDays(d, 1);
  if (freq === 'weekly') return addDays(d, 7);
  if (freq === 'biweekly') return addDays(d, 14);
  if (freq === 'monthly') return addMonths(d, 1);
  return addDays(d, Math.max(1, Number(interval) || 7));
}

export const hhmm = (mins) => String(Math.floor(mins / 60)).padStart(2, '0') + ':' + String(mins % 60).padStart(2, '0');
export const toMins = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
