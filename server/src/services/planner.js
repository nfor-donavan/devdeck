import { Task } from '../models/index.js';
import { today, diffDays, hhmm, toMins } from '../utils/dates.js';
import { summaries } from './projectStats.js';

const WEIGHT = { Critical: 40, High: 25, Medium: 12, Low: 5 };
const STATUS_BONUS = { Production: 6, Pilot: 3 };

// "Plan my day": scores open tasks and fills the available hours. It only suggests — nothing changes until applyPlan.
export async function planMyDay(owner, hours = 6) {
  const t0 = today();
  const [tasks, projects] = await Promise.all([
    Task.find({ owner, status: { $in: ['todo', 'in_progress'] } }).populate('project', 'name color status').lean(),
    summaries(owner),
  ]);
  const health = Object.fromEntries(projects.map((p) => [String(p._id), p.health]));

  const scored = [];
  for (const t of tasks) {
    if (!t.project) continue;
    const late = [t.scheduledDate, t.dueDate].filter(Boolean).map((d) => diffDays(t0, d)).filter((n) => n > 0);
    const dueIn = t.dueDate ? diffDays(t.dueDate, t0) : null;
    const dueSoon = dueIn !== null && dueIn >= 0 && dueIn <= 2;
    const farAway = t.scheduledDate && diffDays(t.scheduledDate, t0) > 2 && !dueSoon;
    if (farAway) continue;

    const reasons = [`${t.priority} priority`];
    let score = WEIGHT[t.priority] || 10;
    if (late.length) {
      const n = Math.max(...late);
      score += 30 + Math.min(n, 6) * 5;
      reasons.push(`Overdue by ${n} day${n > 1 ? 's' : ''}`);
    }
    if (dueSoon) { score += 20; reasons.push(dueIn === 0 ? 'Due today' : `Due in ${dueIn} day${dueIn > 1 ? 's' : ''}`); }
    if (t.scheduledDate && diffDays(t.scheduledDate, t0) === 0) { score += 10; reasons.push('Scheduled today'); }
    if (['Maintenance', 'Deployment'].includes(t.type)) { score += 8; reasons.push(`${t.type} task`); }
    if (t.type === 'Client Request') { score += 8; reasons.push('Client request'); }
    if (t.status === 'in_progress') { score += 5; reasons.push('Already started'); }
    score += STATUS_BONUS[t.project.status] || 0;
    if (health[String(t.project._id)] === 'critical') { score += 5; reasons.push('Project health is critical'); }
    scored.push({ t, score, reasons });
  }
  scored.sort((a, b) => b.score - a.score);

  const capacity = Math.round(hours * 60);
  let used = 0;
  const items = [];
  for (const { t, score, reasons } of scored) {
    const minutes = t.estimatedMinutes || 60;
    if (used + minutes > capacity) continue;
    used += minutes;
    items.push({ taskId: t._id, title: t.title, project: t.project.name, color: t.project.color, priority: t.priority, type: t.type, minutes, score, reasons });
  }
  return { items, totalMinutes: used, capacityMinutes: capacity };
}

// Schedules the accepted items for today, placing untimed tasks around anything already timed.
export async function applyPlan(owner, items) {
  const t0 = today();
  const ids = items.map((i) => i.taskId);
  const fixed = (await Task.find({ owner, scheduledDate: t0, _id: { $nin: ids }, startTime: { $nin: [null, ''] }, endTime: { $nin: [null, ''] } }).lean())
    .map((t) => ({ s: toMins(t.startTime), e: toMins(t.endTime) }))
    .sort((a, b) => a.s - b.s);
  let cursor = 9 * 60;

  for (const i of items) {
    const t = await Task.findOne({ _id: i.taskId, owner });
    if (!t) continue;
    const minutes = Math.max(15, Number(i.minutes) || 60);
    t.scheduledDate = t0;
    t.estimatedMinutes = minutes;
    if (!t.startTime) {
      let start = cursor;
      for (const f of fixed) if (start < f.e && start + minutes > f.s) start = f.e;
      t.startTime = hhmm(start);
      t.endTime = hhmm(start + minutes);
      cursor = start + minutes;
    }
    await t.save();
  }
}
