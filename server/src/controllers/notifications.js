import { Notification } from '../models/index.js';
import { wrap } from '../utils/wrap.js';
import { ApiError } from '../utils/ApiError.js';

export const list = wrap(async (req, res) => {
  const q = { owner: req.user.id, dismissed: { $ne: true } };
  if (typeof req.query.type === 'string' && req.query.type) q.type = req.query.type;
  if (req.query.read === 'false') q.read = false;
  res.json(await Notification.find(q).sort('-createdAt').limit(200));
});

export const markRead = wrap(async (req, res) => {
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { read: req.body.read !== false }, { new: true });
  if (!n) throw new ApiError(404, 'Not found');
  res.json(n);
});

export const readAll = wrap(async (req, res) => {
  await Notification.updateMany({ owner: req.user.id, read: false }, { read: true });
  res.status(204).end();
});

export const remove = wrap(async (req, res) => {
  await Notification.updateOne({ _id: req.params.id, owner: req.user.id }, { dismissed: true, read: true });
  res.status(204).end();
});
