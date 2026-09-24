// Project health: computed from real signals, but the owner can always override it.
export function computeHealth(project, s) {
  if (project.status === 'Archived') return 'archived';
  if (['healthy', 'attention', 'critical'].includes(project.healthOverride)) return project.healthOverride;
  if (s.criticalBugs || s.failedDeploy) return 'critical';
  if (s.overdueTasks || s.overdueMaintenance || s.deadlineSoon) return 'attention';
  return 'healthy';
}

export function healthReasons(s) {
  const r = [];
  if (s.criticalBugs) r.push(`${s.criticalBugs} critical bug${s.criticalBugs > 1 ? 's' : ''} open`);
  if (s.failedDeploy) r.push('Latest deployment failed');
  if (s.overdueTasks) r.push(`${s.overdueTasks} overdue task${s.overdueTasks > 1 ? 's' : ''}`);
  if (s.overdueMaintenance) r.push('Maintenance overdue');
  if (s.deadlineSoon) r.push(`${s.deadlineSoon} deadline${s.deadlineSoon > 1 ? 's' : ''} within 3 days`);
  return r;
}
