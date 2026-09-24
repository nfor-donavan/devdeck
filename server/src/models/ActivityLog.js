import { make, oid } from './base.js';
import mongoose from 'mongoose';

export default make('ActivityLog', {
  action: String,
  entityType: String,
  entityId: mongoose.Schema.Types.ObjectId,
  summary: { type: String, required: true },
  project: oid('Project'),
  at: { type: Date, default: Date.now, index: true },
});
