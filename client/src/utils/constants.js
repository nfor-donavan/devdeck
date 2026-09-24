export const PROJECT_TYPES = ['SaaS', 'Multi-tenant SaaS', 'Mobile App', 'Web App', 'API', 'Internal Tool', 'Client Project', 'Other'];
export const PROJECT_STATUS = ['Idea', 'Development', 'Testing', 'Pilot', 'Production', 'Maintenance', 'Archived'];
export const TASK_TYPES = ['Development', 'Bug Fix', 'Maintenance', 'Upgrade', 'Feature', 'Deployment', 'Testing', 'Documentation', 'Client Request', 'Meeting', 'Research', 'Other'];
export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
export const BUG_STATUS = ['Open', 'Investigating', 'In Progress', 'Fixed', 'Verified', 'Closed'];
export const FEATURE_STAGES = ['Idea', 'Planned', 'In Development', 'Testing', 'Released', 'Cancelled'];
export const ENVIRONMENTS = ['Development', 'Staging', 'Production'];
export const DEPLOY_STATUS = ['Scheduled', 'In Progress', 'Successful', 'Failed', 'Rolled Back'];
export const FREQUENCIES = ['daily', 'weekly', 'biweekly', 'monthly', 'custom'];
export const EVENT_KINDS = ['Meeting', 'Client appointment', 'Deadline', 'Other'];
export const TENANT_STATUS = ['Active', 'Trial', 'Suspended', 'Churned'];

export const STATUS_LABEL = { todo: 'Todo', in_progress: 'In progress', completed: 'Completed', blocked: 'Blocked' };
export const STATUS_NEXT = { todo: 'in_progress', in_progress: 'completed', completed: 'todo', blocked: 'todo' };
export const HEALTH_LABEL = { healthy: 'Healthy', attention: 'Needs attention', critical: 'Critical', archived: 'Archived' };
