import { make, oid } from './base.js';
import { FEATURE_STAGES, PRIORITIES } from './enums.js';

export default make('Feature', {
  project: oid('Project', { required: true, index: true }),
  title: { type: String, required: true, trim: true },
  description: String,
  stage: { type: String, enum: FEATURE_STAGES, default: 'Idea' },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
});
