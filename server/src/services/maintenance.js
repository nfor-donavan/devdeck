import { MaintenanceSchedule, Task } from '../models/index.js';
import { today, addDays, nextOccurrence } from '../utils/dates.js';

const HORIZON_DAYS = 14;

// Turns recurring schedules into real Maintenance tasks (idempotent, safe to call often).
export async function materializeMaintenance(owner) {
  const t0 = today();
  const horizon = addDays(t0, HORIZON_DAYS);
  const schedules = await MaintenanceSchedule.find({ owner, active: true, nextDueAt: { $lte: horizon } });

  for (const s of schedules) {
    let d = s.nextDueAt;
    const occurrences = [];
    for (let i = 0; i < 60 && d <= horizon; i++) {
      occurrences.push(d);
      d = nextOccurrence(d, s.frequency, s.intervalDays);
    }
    // Skip old missed occurrences: keep only the most recent past one (shown as overdue) and the upcoming ones.
    const past = occurrences.filter((x) => x < t0);
    const keep = [...past.slice(-1), ...occurrences.filter((x) => x >= t0)];
    for (const day of keep) {
      const exists = await Task.exists({ owner, schedule: s._id, scheduledDate: day });
      if (!exists) {
        await Task.create({
          owner, project: s.project, schedule: s._id, title: s.title, type: 'Maintenance', priority: 'Medium',
          scheduledDate: day, dueDate: day, estimatedMinutes: s.estimatedMinutes, notes: s.checklist,
        });
      }
    }
    s.nextDueAt = d;
    await s.save();
  }
}
