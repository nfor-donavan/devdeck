import { Project, Task, Bug, Feature, Tenant, Deployment } from '../models/index.js';
import { today, addDays } from '../utils/dates.js';
import { computeHealth, healthReasons } from './health.js';

const CLOSED_BUG = ['Fixed', 'Verified', 'Closed'];

// One place that computes per-project numbers (cards, health, dashboard).
export async function summaries(owner, onlyId) {
  const filter = onlyId ? { owner, _id: onlyId } : { owner };
  const byProject = onlyId ? { owner, project: onlyId } : { owner };
  const [projects, tasks, bugs, features, tenants, deps] = await Promise.all([
    Project.find(filter).sort('name').lean(),
    Task.find({ ...byProject, status: { $ne: 'completed' } }).select('project type dueDate scheduledDate').lean(),
    Bug.find({ ...byProject, status: { $nin: CLOSED_BUG } }).select('project severity').lean(),
    Feature.find({ ...byProject, stage: { $nin: ['Released', 'Cancelled'] } }).select('project').lean(),
    Tenant.find({ ...byProject, status: { $in: ['Active', 'Trial'] } }).select('project').lean(),
    Deployment.find(byProject).sort('-deployedAt').select('project status deployedAt').lean(),
  ]);
  const t0 = today();
  const soon = addDays(t0, 3);
  const pick = (list, id) => list.filter((x) => String(x.project) === id);

  return projects.map((p) => {
    const id = String(p._id);
    const pt = pick(tasks, id);
    const maint = pt.filter((t) => t.type === 'Maintenance');
    const others = pt.filter((t) => t.type !== 'Maintenance');
    const day = (t) => t.scheduledDate || t.dueDate;
    const stats = {
      openBugs: pick(bugs, id).length,
      criticalBugs: pick(bugs, id).filter((b) => b.severity === 'Critical').length,
      pendingFeatures: pick(features, id).length,
      activeTenants: pick(tenants, id).length,
      overdueTasks: others.filter((t) => [t.scheduledDate, t.dueDate].some((d) => d && d < t0)).length,
      overdueMaintenance: maint.filter((t) => day(t) && day(t) < t0).length,
      maintenanceDue: maint.filter((t) => day(t) && day(t) <= t0).length,
      deadlineSoon: others.filter((t) => t.dueDate && t.dueDate >= t0 && t.dueDate <= soon).length,
      failedDeploy: pick(deps, id)[0]?.status === 'Failed',
      nextMaintenanceAt: maint.map(day).filter(Boolean).sort((a, b) => a - b)[0] || null,
    };
    return { ...p, stats, health: computeHealth(p, stats), healthReasons: healthReasons(stats) };
  });
}
