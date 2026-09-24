import { make, oid } from './base.js';
import { ENVIRONMENTS, TENANT_STATUS } from './enums.js';

export default make('Tenant', {
  project: oid('Project', { required: true, index: true }),
  client: oid('Client'),
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: TENANT_STATUS, default: 'Active' },
  environment: { type: String, enum: ENVIRONMENTS, default: 'Production' },
  version: String,
  deployedAt: Date,
  lastMaintenanceAt: Date,
  supportIssues: [String],
  notes: String,
});
