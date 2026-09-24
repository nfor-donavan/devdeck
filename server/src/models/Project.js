import { make } from './base.js';
import { PROJECT_TYPES, PROJECT_STATUS } from './enums.js';

export default make('Project', {
  name: { type: String, required: true, trim: true },
  description: String,
  type: { type: String, enum: PROJECT_TYPES, default: 'SaaS' },
  status: { type: String, enum: PROJECT_STATUS, default: 'Development' },
  version: String,
  stack: [String],
  repoUrl: String,
  frontendUrl: String,
  backendUrl: String,
  productionUrl: String,
  docsUrl: String,
  deploymentProvider: String,
  databaseProvider: String,
  color: { type: String, default: '#2450d8' },
  healthOverride: { type: String, enum: ['auto', 'healthy', 'attention', 'critical'], default: 'auto' },
  lastMaintenanceAt: Date,
});
