import { User, Task, Deployment, CalendarEvent, ActivityLog } from '../models/index.js';
import { wrap } from '../utils/wrap.js';
import { today, addDays, dateOnly } from '../utils/dates.js';
import { summaries } from '../services/projectStats.js';
import { materializeMaintenance } from '../services/maintenance.js';
import { generateReminders } from '../services/reminders.js';
import { planMyDay, applyPlan } from '../services/planner.js';

export const summary = wrap(async (req, res) => {
  const owner = req.user.id;
  // Recurring maintenance and reminders are refreshed whenever the dashboard is opened.
  await materializeMaintenance(owner);
  await generateReminders(owner);

  const t0 = today();
  const week = addDays(t0, 7);
  const proj = { path: 'project', select: 'name color' };
  const [user, projects, todayTasks, overdue, deps, upcomingTasks, events, weekTasks, activity] = await Promise.all([
    User.findById(owner),
    summaries(owner),
    Task.find({ owner, scheduledDate: t0 }).populate(proj).sort('startTime').lean(),
    Task.countDocuments({ owner, status: { $ne: 'completed' }, $or: [{ dueDate: { $lt: t0 } }, { scheduledDate: { $lt: t0 } }] }),
    Deployment.find({ owner, status: 'Scheduled', deployedAt: { $gte: t0 } }).populate(proj).sort('deployedAt').lean(),
    Task.find({ owner, status: { $ne: 'completed' }, $or: [{ dueDate: { $gte: t0, $lt: week } }, { type: 'Maintenance', scheduledDate: { $gte: t0, $lt: week } }] }).populate(proj).lean(),
    CalendarEvent.find({ owner, start: { $gte: t0, $lt: week } }).populate(proj).lean(),
    Task.find({ owner, status: { $ne: 'completed' }, scheduledDate: { $gte: t0, $lt: week } }).lean(),
    ActivityLog.find({ owner }).sort('-at').limit(8).lean(),
  ]);

  const upcoming = [
    ...deps.map((d) => ({ type: 'deployment', title: `${d.project?.name} ${d.version} deployment`, date: d.deployedAt })),
    ...upcomingTasks.map((t) =>
      t.type === 'Maintenance'
        ? { type: 'maintenance', title: `${t.project?.name} maintenance`, date: t.scheduledDate }
        : { type: 'deadline', title: `${t.project?.name}: ${t.title} due`, date: t.dueDate }),
    ...events.map((e) => ({ type: 'event', title: e.title, date: e.start })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 8);

  const workload = projects.map((p) => ({
    id: p._id, name: p.name, color: p.color,
    minutes: weekTasks.filter((t) => String(t.project) === String(p._id)).reduce((a, t) => a + (t.estimatedMinutes || 60), 0),
  })).filter((w) => w.minutes > 0);

  res.json({
    name: user?.name || '',
    workdayHours: user?.settings?.workdayHours || 6,
    counts: {
      todayTasks: todayTasks.length,
      overdue,
      activeProjects: projects.filter((p) => !['Archived', 'Idea'].includes(p.status)).length,
      upcomingDeployments: deps.length,
      maintenanceDue: projects.filter((p) => p.stats.maintenanceDue > 0).length,
    },
    today: todayTasks,
    upcoming,
    health: projects.map((p) => ({ id: p._id, name: p.name, color: p.color, health: p.health, reasons: p.healthReasons })),
    workload,
    activity,
    today_date: dateOnly(t0),
  });
});

export const plan = wrap(async (req, res) => {
  const user = await User.findById(req.user.id);
  const hours = Number(req.body.hours) || user?.settings?.workdayHours || 6;
  res.json(await planMyDay(req.user.id, hours));
});

export const applyDayPlan = wrap(async (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  await applyPlan(req.user.id, items);
  res.status(204).end();
});
