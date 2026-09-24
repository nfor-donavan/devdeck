import { Task, Deployment, CalendarEvent } from '../models/index.js';
import { wrap } from '../utils/wrap.js';
import { addDays, dateOnly } from '../utils/dates.js';

// Unified calendar feed: tasks, maintenance, deadlines, deployments, meetings/appointments.
export const feed = wrap(async (req, res) => {
  const owner = req.user.id;
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);
  if (isNaN(from) || isNaN(to)) return res.status(400).json({ error: 'from and to are required' });
  // Date-only values are UTC midnight, so widen the query by a day and let the client crop.
  const f = addDays(from, -1);
  const t = addDays(to, 1);
  const proj = { path: 'project', select: 'name color' };
  const [tasks, deps, events] = await Promise.all([
    Task.find({ owner, $or: [{ scheduledDate: { $gte: f, $lte: t } }, { dueDate: { $gte: f, $lte: t } }] }).populate(proj).lean(),
    Deployment.find({ owner, deployedAt: { $gte: f, $lte: t } }).populate(proj).lean(),
    CalendarEvent.find({ owner, start: { $gte: f, $lte: t } }).populate(proj).lean(),
  ]);

  const out = [];
  for (const k of tasks) {
    const name = k.project?.name || '';
    const inRange = (d) => d && d >= f && d <= t;
    if (inRange(k.scheduledDate)) {
      out.push({
        id: `task:${k._id}`, refId: k._id, type: k.type === 'Maintenance' ? 'maintenance' : 'task', status: k.status,
        title: `${name}: ${k.title}`, date: dateOnly(k.scheduledDate), startTime: k.startTime || null, endTime: k.endTime || null, allDay: !k.startTime,
      });
    }
    const sameDay = k.scheduledDate && k.dueDate && dateOnly(k.scheduledDate) === dateOnly(k.dueDate);
    if (inRange(k.dueDate) && !sameDay && k.status !== 'completed') {
      out.push({ id: `due:${k._id}`, refId: k._id, type: 'deadline', title: `Due: ${name}: ${k.title}`, date: dateOnly(k.dueDate), allDay: true });
    }
  }
  for (const d of deps) {
    out.push({ id: `deployment:${d._id}`, refId: d._id, type: 'deployment', status: d.status, title: `${d.project?.name} ${d.version} → ${d.environment}`, start: d.deployedAt, end: new Date(new Date(d.deployedAt).getTime() + 3600_000), allDay: false });
  }
  for (const e of events) {
    out.push({ id: `event:${e._id}`, refId: e._id, type: 'event', title: e.title, start: e.start, end: e.end || new Date(new Date(e.start).getTime() + 3600_000), allDay: e.allDay });
  }
  res.json(out);
});
