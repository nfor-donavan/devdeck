import { make, oid } from './base.js';
import { TASK_TYPES, PRIORITIES, TASK_STATUS, FREQUENCIES } from './enums.js';

export default make('Task', {
  project: oid('Project', { required: true, index: true }),
  client: oid('Client'),
  tenant: oid('Tenant'),
  schedule: oid('MaintenanceSchedule'),
  title: { type: String, required: true, trim: true },
  description: String,
  type: { type: String, enum: TASK_TYPES, default: 'Development' },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
  status: { type: String, enum: TASK_STATUS, default: 'todo', index: true },
  dueDate: Date,
  scheduledDate: { type: Date, index: true },
  startTime: String,
  endTime: String,
  estimatedMinutes: { type: Number, min: 0 },
  actualMinutes: { type: Number, min: 0 },
  notes: String,
  attachments: [{ name: String, url: String }],
  recurrence: {
    frequency: { type: String, enum: ['none', ...FREQUENCIES], default: 'none' },
    intervalDays: { type: Number, min: 1 },
  },
  completedAt: Date,
});
