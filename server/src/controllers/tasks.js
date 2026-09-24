import { Task, Project } from '../models/index.js';
import { crud } from './crud.js';
import { nextOccurrence, today } from '../utils/dates.js';

export default crud(Task, {
  entity: 'task',
  populate: [
    { path: 'project', select: 'name color' },
    { path: 'client', select: 'name' },
    { path: 'tenant', select: 'name' },
  ],
  before: (data, prev) => {
    if (data.status === 'completed' && prev?.status !== 'completed') data.completedAt = new Date();
    else if (data.status && data.status !== 'completed') data.completedAt = null;
  },
  after: async (t, { created, changed }, req) => {
    const justCompleted = t.status === 'completed' && (created || changed.includes('status'));
    if (!justCompleted) return;

    if (t.type === 'Maintenance') {
      await Project.updateOne({ _id: t.project, owner: req.user.id }, { lastMaintenanceAt: new Date() });
    }
    // Recurring task: completing it creates the next occurrence.
    const r = t.recurrence;
    if (r?.frequency && r.frequency !== 'none' && !t.schedule) {
      const { _id, createdAt, updatedAt, completedAt, __v, ...rest } = t.toObject();
      const next = (d) => (d ? nextOccurrence(d, r.frequency, r.intervalDays) : undefined);
      await Task.create({
        ...rest, status: 'todo', actualMinutes: undefined,
        scheduledDate: t.scheduledDate ? next(t.scheduledDate) : t.dueDate ? undefined : next(today()),
        dueDate: next(t.dueDate),
      });
    }
  },
});
