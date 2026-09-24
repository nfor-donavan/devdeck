import { make, oid } from './base.js';
import { ENVIRONMENTS } from './enums.js';

export default make('Client', {
  name: { type: String, required: true, trim: true },
  organization: String,
  email: String,
  phone: String,
  projects: [oid('Project')],
  environment: { type: String, enum: ENVIRONMENTS },
  deploymentStatus: String,
  subscription: { plan: String, status: String, renewalDate: Date },
  contract: { endDate: Date, notes: String },
  notes: String,
  supportRequests: [String],
  lastInteractionAt: Date,
  nextMaintenanceAt: Date,
});
