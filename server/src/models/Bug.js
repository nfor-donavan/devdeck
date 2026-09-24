import { make, oid } from './base.js';
import { PRIORITIES, BUG_STATUS } from './enums.js';

export default make('Bug', {
  project: oid('Project', { required: true, index: true }),
  task: oid('Task'),
  title: { type: String, required: true, trim: true },
  description: String,
  severity: { type: String, enum: PRIORITIES, default: 'Medium' },
  status: { type: String, enum: BUG_STATUS, default: 'Open' },
  steps: String,
  expected: String,
  actual: String,
  resolution: String,
});
