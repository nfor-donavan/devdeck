import { ActivityLog } from '../models/index.js';

export const logActivity = (owner, data) => ActivityLog.create({ owner, ...data }).catch(() => {});
