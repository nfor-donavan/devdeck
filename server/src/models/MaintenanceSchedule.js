import { make, oid } from './base.js';
import { FREQUENCIES } from './enums.js';

// nextDueAt is the next occurrence that has not been turned into a task yet.
export default make('MaintenanceSchedule', {
  project: oid('Project', { required: true, index: true }),
  title: { type: String, required: true, trim: true, default: 'Routine maintenance' },
  frequency: { type: String, enum: FREQUENCIES, default: 'weekly' },
  intervalDays: { type: Number, min: 1 },
  nextDueAt: { type: Date, required: true },
  estimatedMinutes: { type: Number, default: 120 },
  active: { type: Boolean, default: true },
  checklist: String,
});
