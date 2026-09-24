import { ActivityLog } from '../models/index.js';
import { wrap } from '../utils/wrap.js';

export const list = wrap(async (req, res) => {
  const q = { owner: req.user.id };
  if (typeof req.query.project === 'string' && req.query.project) q.project = req.query.project;
  res.json(await ActivityLog.find(q).sort('-at').limit(100).populate('project', 'name color'));
});
