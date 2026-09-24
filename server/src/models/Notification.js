import { make } from './base.js';
import { NOTIF_TYPES } from './enums.js';

export default make('Notification', {
  type: { type: String, enum: NOTIF_TYPES, default: 'System' },
  title: { type: String, required: true },
  body: String,
  link: String,
  key: { type: String, index: true }, // dedupe key so reminders are created once
  read: { type: Boolean, default: false },
  dismissed: { type: Boolean, default: false }, // "deleted" notifications stay so they are not re-created
});
