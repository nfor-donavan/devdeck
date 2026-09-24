import { make, oid } from './base.js';
import { ENVIRONMENTS, DEPLOY_STATUS } from './enums.js';

export default make('Deployment', {
  project: oid('Project', { required: true, index: true }),
  version: { type: String, required: true, trim: true },
  environment: { type: String, enum: ENVIRONMENTS, default: 'Production' },
  deployedAt: { type: Date, default: Date.now },
  status: { type: String, enum: DEPLOY_STATUS, default: 'Scheduled' },
  changes: String,
  rollbackNotes: String,
  url: String,
  notes: String,
});
