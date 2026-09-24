import { make, oid } from './base.js';

export default make('Note', {
  project: oid('Project'),
  title: { type: String, required: true, trim: true },
  body: String, // Markdown
  tags: [String],
});
