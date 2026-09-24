import { Task, Project } from '../models/index.js';
import { wrap } from '../utils/wrap.js';
import { today, addDays, ymd, dateOnly } from '../utils/dates.js';

// Lightweight workload numbers. Deliberately about understanding load, not measuring performance.
export const analytics = wrap(async (req, res) => {
  const owner = req.user.id;
  const days = Math.min(Math.max(Number(req.query.days) || 30, 7), 180);
  const t0 = today();
  const since = addDays(t0, -days);
  const [projects, tasks] = await Promise.all([Project.find({ owner }).select('name color').lean(), Task.find({ owner }).lean()]);
  const name = Object.fromEntries(projects.map((p) => [String(p._id), p]));
  const label = (t) => name[String(t.project)]?.name || 'Unknown';

  const completed = tasks.filter((t) => t.status === 'completed' && t.completedAt && t.completedAt >= since);
  const perDay = {};
  for (let i = days - 1; i >= 0; i--) perDay[ymd(addDays(t0, -i))] = 0;
  for (const t of completed) { const k = ymd(t.completedAt); if (k in perDay) perDay[k]++; }

  const est = {};
  for (const t of completed) {
    const k = label(t);
    est[k] ||= { project: k, estimated: 0, actual: 0 };
    est[k].estimated += (t.estimatedMinutes || 0) / 60;
    est[k].actual += (t.actualMinutes || 0) / 60;
  }

  const upcoming = tasks.filter((t) => t.status !== 'completed' && t.scheduledDate && t.scheduledDate >= t0 && t.scheduledDate < addDays(t0, 14));
  const load = {};
  for (const t of upcoming) { const k = label(t); load[k] = (load[k] || 0) + (t.estimatedMinutes || 60) / 60; }

  const since90 = addDays(t0, -90);
  const maint = {};
  for (const t of tasks) {
    if (t.type === 'Maintenance' && t.status === 'completed' && t.completedAt >= since90) { const k = label(t); maint[k] = (maint[k] || 0) + 1; }
  }

  const round = (n) => Math.round(n * 10) / 10;
  res.json({
    days,
    completedTotal: completed.length,
    completedByDay: Object.entries(perDay).map(([date, count]) => ({ date, count })),
    estimatedVsActual: Object.values(est).map((e) => ({ ...e, estimated: round(e.estimated), actual: round(e.actual) })),
    workload: Object.entries(load).map(([project, hours]) => ({ project, hours: round(hours) })),
    maintenanceFrequency: Object.entries(maint).map(([project, count]) => ({ project, count })),
    overdueNow: tasks.filter((t) => t.status !== 'completed' && [t.scheduledDate, t.dueDate].some((d) => d && d < t0)).length,
    asOf: dateOnly(t0),
  });
});
