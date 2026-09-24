import * as C from './utils/constants.js';

// One config per record type. RecordForm (create/edit) and EntityPage (list) are both driven by this.
const opts = (list) => list.map((v) => ({ value: v, label: v }));
const project = (required = true) => ({ name: 'project', label: 'Project', type: 'ref', endpoint: 'projects', required });
const cols = { project: { label: 'Project', key: 'project', type: 'ref' } };

export const ENTITIES = {
  projects: {
    label: 'Project', title: 'Projects', endpoint: 'projects',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'type', label: 'Type', type: 'select', options: opts(C.PROJECT_TYPES), default: 'SaaS' },
      { name: 'status', label: 'Status', type: 'select', options: opts(C.PROJECT_STATUS), default: 'Development' },
      { name: 'version', label: 'Current version' },
      { name: 'stack', label: 'Technology stack (comma separated)', type: 'tags' },
      { name: 'repoUrl', label: 'Repository URL' },
      { name: 'frontendUrl', label: 'Frontend URL' },
      { name: 'backendUrl', label: 'Backend URL' },
      { name: 'productionUrl', label: 'Production URL' },
      { name: 'docsUrl', label: 'Documentation URL' },
      { name: 'deploymentProvider', label: 'Deployment provider' },
      { name: 'databaseProvider', label: 'Database provider' },
      { name: 'color', label: 'Color', type: 'color', default: '#2450d8' },
      { name: 'healthOverride', label: 'Health', type: 'select', default: 'auto', options: [{ value: 'auto', label: 'Automatic' }, { value: 'healthy', label: 'Healthy (manual)' }, { value: 'attention', label: 'Needs attention (manual)' }, { value: 'critical', label: 'Critical (manual)' }] },
    ],
  },
  tasks: {
    label: 'Task', title: 'Tasks', endpoint: 'tasks', sort: 'scheduledDate',
    fields: [
      project(),
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'type', label: 'Type', type: 'select', options: opts(C.TASK_TYPES), default: 'Development' },
      { name: 'priority', label: 'Priority', type: 'select', options: opts(C.PRIORITIES), default: 'Medium' },
      { name: 'status', label: 'Status', type: 'select', options: Object.entries(C.STATUS_LABEL).map(([value, label]) => ({ value, label })), default: 'todo' },
      { name: 'dueDate', label: 'Due date', type: 'date' },
      { name: 'scheduledDate', label: 'Scheduled date', type: 'date' },
      { name: 'startTime', label: 'Start time', type: 'time' },
      { name: 'endTime', label: 'End time', type: 'time' },
      { name: 'estimatedMinutes', label: 'Estimated (minutes)', type: 'number' },
      { name: 'actualMinutes', label: 'Actual (minutes)', type: 'number' },
      { name: 'client', label: 'Client', type: 'ref', endpoint: 'clients', optional: true },
      { name: 'tenant', label: 'Tenant', type: 'ref', endpoint: 'tenants', optional: true },
      { name: 'recurrence.frequency', label: 'Repeats', type: 'select', default: 'none', options: [{ value: 'none', label: 'Does not repeat' }, ...opts(C.FREQUENCIES)] },
      { name: 'recurrence.intervalDays', label: 'Custom interval (days)', type: 'number' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
      { name: 'attachments', label: 'Attachments (one per line: Label | URL)', type: 'links' },
    ],
    columns: [
      { label: 'Task', key: 'title' }, cols.project, { label: 'Type', key: 'type', type: 'chip' },
      { label: 'Priority', key: 'priority', type: 'chip' }, { label: 'When', key: 'scheduledDate', type: 'day' },
      { label: 'Status', key: 'status', type: 'status' },
    ],
  },
  bugs: {
    label: 'Bug', title: 'Bugs', endpoint: 'bugs',
    fields: [
      project(),
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'severity', label: 'Severity', type: 'select', options: opts(C.PRIORITIES), default: 'Medium' },
      { name: 'status', label: 'Status', type: 'select', options: opts(C.BUG_STATUS), default: 'Open' },
      { name: 'task', label: 'Assigned task', type: 'ref', endpoint: 'tasks', labelKey: 'title', optional: true },
      { name: 'steps', label: 'Steps to reproduce', type: 'textarea' },
      { name: 'expected', label: 'Expected behavior', type: 'textarea' },
      { name: 'actual', label: 'Actual behavior', type: 'textarea' },
      { name: 'resolution', label: 'Resolution', type: 'textarea' },
    ],
    columns: [{ label: 'Bug', key: 'title' }, cols.project, { label: 'Severity', key: 'severity', type: 'chip' }, { label: 'Status', key: 'status', type: 'chip' }, { label: 'Created', key: 'createdAt', type: 'date' }],
  },
  features: {
    label: 'Feature', title: 'Features', endpoint: 'features',
    fields: [
      project(),
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'stage', label: 'Stage', type: 'select', options: opts(C.FEATURE_STAGES), default: 'Idea' },
      { name: 'priority', label: 'Priority', type: 'select', options: opts(C.PRIORITIES), default: 'Medium' },
    ],
  },
  clients: {
    label: 'Client', title: 'Clients', endpoint: 'clients',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'organization', label: 'Organization' },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'projects', label: 'Projects used', type: 'refs', endpoint: 'projects' },
      { name: 'environment', label: 'Environment', type: 'select', options: opts(C.ENVIRONMENTS), optional: true },
      { name: 'deploymentStatus', label: 'Deployment status' },
      { name: 'subscription.plan', label: 'Subscription plan' },
      { name: 'subscription.status', label: 'Subscription status' },
      { name: 'subscription.renewalDate', label: 'Renewal date', type: 'date' },
      { name: 'contract.endDate', label: 'Contract end date', type: 'date' },
      { name: 'contract.notes', label: 'Contract notes', type: 'textarea' },
      { name: 'supportRequests', label: 'Support requests (one per line)', type: 'lines' },
      { name: 'lastInteractionAt', label: 'Last interaction', type: 'date' },
      { name: 'nextMaintenanceAt', label: 'Next scheduled maintenance', type: 'date' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { label: 'Client', key: 'name' }, { label: 'Organization', key: 'organization' }, { label: 'Projects', key: 'projects', type: 'refs' },
      { label: 'Plan', key: 'subscription.plan' }, { label: 'Last contact', key: 'lastInteractionAt', type: 'day' },
    ],
  },
  tenants: {
    label: 'Tenant', title: 'Tenants', endpoint: 'tenants',
    fields: [
      project(),
      { name: 'name', label: 'Tenant name', required: true },
      { name: 'client', label: 'Client', type: 'ref', endpoint: 'clients', optional: true },
      { name: 'status', label: 'Status', type: 'select', options: opts(C.TENANT_STATUS), default: 'Active' },
      { name: 'environment', label: 'Environment', type: 'select', options: opts(C.ENVIRONMENTS), default: 'Production' },
      { name: 'version', label: 'Version' },
      { name: 'deployedAt', label: 'Deployment date', type: 'date' },
      { name: 'lastMaintenanceAt', label: 'Last maintenance', type: 'date' },
      { name: 'supportIssues', label: 'Support issues (one per line)', type: 'lines' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { label: 'Tenant', key: 'name' }, cols.project, { label: 'Status', key: 'status', type: 'chip' }, { label: 'Env', key: 'environment' },
      { label: 'Version', key: 'version' }, { label: 'Deployed', key: 'deployedAt', type: 'date' }, { label: 'Last maintenance', key: 'lastMaintenanceAt', type: 'date' },
    ],
  },
  deployments: {
    label: 'Deployment', title: 'Deployments', endpoint: 'deployments',
    fields: [
      project(),
      { name: 'version', label: 'Version', required: true },
      { name: 'environment', label: 'Environment', type: 'select', options: opts(C.ENVIRONMENTS), default: 'Production' },
      { name: 'deployedAt', label: 'Deployment date & time', type: 'datetime' },
      { name: 'status', label: 'Status', type: 'select', options: opts(C.DEPLOY_STATUS), default: 'Scheduled' },
      { name: 'changes', label: 'Changes', type: 'textarea' },
      { name: 'rollbackNotes', label: 'Rollback notes', type: 'textarea' },
      { name: 'url', label: 'Deployment URL' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      cols.project, { label: 'Version', key: 'version' }, { label: 'Environment', key: 'environment', type: 'chip' },
      { label: 'When', key: 'deployedAt', type: 'datetime' }, { label: 'Status', key: 'status', type: 'chip' },
    ],
  },
  maintenance: {
    label: 'Maintenance schedule', title: 'Maintenance schedules', endpoint: 'maintenance',
    fields: [
      project(),
      { name: 'title', label: 'Title', required: true, default: 'Routine maintenance' },
      { name: 'frequency', label: 'Repeats', type: 'select', options: opts(C.FREQUENCIES), default: 'weekly' },
      { name: 'intervalDays', label: 'Custom interval (days, for "custom")', type: 'number' },
      { name: 'nextDueAt', label: 'Next due', type: 'date', required: true },
      { name: 'estimatedMinutes', label: 'Estimated (minutes)', type: 'number', default: 120 },
      { name: 'active', label: 'Active', type: 'checkbox', default: true },
      { name: 'checklist', label: 'Checklist / notes', type: 'textarea' },
    ],
    columns: [
      cols.project, { label: 'Schedule', key: 'title' }, { label: 'Repeats', key: 'frequency', type: 'chip' },
      { label: 'Next to generate', key: 'nextDueAt', type: 'date' },
    ],
  },
  events: {
    label: 'Event', title: 'Events', endpoint: 'events',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'kind', label: 'Kind', type: 'select', options: opts(C.EVENT_KINDS), default: 'Meeting' },
      { name: 'start', label: 'Start', type: 'datetime', required: true },
      { name: 'end', label: 'End', type: 'datetime' },
      { name: 'allDay', label: 'All day', type: 'checkbox' },
      project(false),
      { name: 'client', label: 'Client', type: 'ref', endpoint: 'clients', optional: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
  },
  notes: {
    label: 'Note', title: 'Notes', endpoint: 'notes',
    fields: [
      project(false),
      { name: 'title', label: 'Title', required: true },
      { name: 'body', label: 'Content (Markdown)', type: 'textarea', rows: 12 },
      { name: 'tags', label: 'Tags (comma separated)', type: 'tags' },
    ],
  },
};

// Order used by the Quick Add menu.
export const QUICK_ADD = ['projects', 'tasks', 'bugs', 'features', 'clients', 'tenants', 'deployments', 'maintenance', 'events'];
