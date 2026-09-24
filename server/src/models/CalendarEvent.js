import { make, oid } from './base.js';
import { EVENT_KINDS } from './enums.js';

export default make('CalendarEvent', {
  title: { type: String, required: true, trim: true },
  kind: { type: String, enum: EVENT_KINDS, default: 'Meeting' },
  start: { type: Date, required: true, index: true },
  end: Date,
  allDay: { type: Boolean, default: false },
  project: oid('Project'),
  task: oid('Task'),
  client: oid('Client'),
  notes: String,
});
