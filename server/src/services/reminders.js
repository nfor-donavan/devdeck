import { Task, Deployment, Project, Client, Notification } from '../models/index.js';
import { today, addDays, ymd, dateOnly, diffDays } from '../utils/dates.js';

// Creates reminder notifications on demand. Each has a dedupe key, so calling this repeatedly is safe.
export async function generateReminders(owner) {
  const t0 = today();
  const t1 = addDays(t0, 1);
  const t2 = addDays(t0, 2);
  const push = (key, type, title, body, link) =>
    Notification.updateOne(
      { owner, key },
      { $setOnInsert: { owner, key, type, title, body, link, read: false, dismissed: false } },
      { upsert: true }
    );

  const [tasks, deps, projects, clients] = await Promise.all([
    Task.find({ owner, status: { $ne: 'completed' } }).populate('project', 'name').lean(),
    Deployment.find({ owner, status: 'Scheduled', deployedAt: { $gte: t0, $lt: addDays(t0, 2) } }).populate('project', 'name').lean(),
    Project.find({ owner, status: { $nin: ['Archived', 'Idea'] } }).lean(),
    Client.find({ owner, 'subscription.renewalDate': { $gte: t0, $lte: addDays(t0, 7) } }).lean(),
  ]);

  const overdue = tasks.filter((t) => [t.scheduledDate, t.dueDate].some((d) => d && d < t0));
  if (overdue.length) {
    await push(`overdue:${ymd()}`, 'Task', `⚠️ You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}`,
      overdue.slice(0, 3).map((t) => t.title).join(', '), '/tasks');
  }
  for (const t of tasks) {
    const name = t.project?.name || 'Project';
    const when = t.scheduledDate;
    if (t.type === 'Maintenance' && when && when >= t0 && when < t2) {
      await push(`maint:${t._id}:${dateOnly(when)}`, 'Maintenance',
        `🔔 ${name} maintenance is ${when < t1 ? 'today' : 'tomorrow'}`, t.title, '/maintenance');
    }
    if (t.type !== 'Maintenance' && t.dueDate && t.dueDate >= t0 && t.dueDate < addDays(t0, 3)) {
      const n = diffDays(t.dueDate, t0);
      await push(`deadline:${t._id}`, 'Deadline', `📅 Due ${n === 0 ? 'today' : n === 1 ? 'tomorrow' : 'in 2 days'}: ${t.title}`, name, '/tasks');
    }
  }
  for (const d of deps) {
    await push(`dep:${d._id}`, 'Deployment',
      `🚀 ${d.project?.name} ${d.version} deployment is scheduled for ${d.deployedAt < t1 ? 'today' : 'tomorrow'}`,
      d.environment, '/deployments');
  }
  for (const p of projects) {
    if (p.lastMaintenanceAt) {
      const n = diffDays(t0, p.lastMaintenanceAt);
      if (n >= 30) await push(`stale:${p._id}:${ymd().slice(0, 7)}`, 'Maintenance', `📅 ${p.name} has not been maintained for ${n} days`, '', `/projects/${p._id}`);
    }
  }
  for (const c of clients) {
    await push(`renewal:${c._id}:${dateOnly(c.subscription.renewalDate)}`, 'Client', `💳 ${c.name}: subscription renews ${dateOnly(c.subscription.renewalDate)}`, '', '/clients');
  }
}
