// Demo data so the dashboard is not empty:  npm run seed   (add --reset to wipe your data first)
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import * as M from '../models/index.js';
import { today, addDays } from '../utils/dates.js';
import { materializeMaintenance } from '../services/maintenance.js';
import { generateReminders } from '../services/reminders.js';

const reset = process.argv.includes('--reset');
const email = (process.env.SEED_EMAIL || 'donovan@devdeck.local').toLowerCase();
const password = process.env.SEED_PASSWORD || 'ChangeMe123!';
const day = (n) => addDays(today(), n);
const at = (n, h, m = 0) => { const d = addDays(today(), n); d.setUTCHours(h, m, 0, 0); return d; };

await connectDB();
let user = await M.User.findOne({ email });
if (!user) user = await M.User.create({ email, name: 'Donovan', passwordHash: await bcrypt.hash(password, 12) });
const owner = user._id;

if (reset) {
  await Promise.all(Object.entries(M).filter(([k]) => k !== 'User').map(([, Model]) => Model.deleteMany({ owner })));
} else if (await M.Project.exists({ owner })) {
  console.log('Data already exists. Run "npm run seed:reset" to replace it.');
  await mongoose.disconnect();
  process.exit(0);
}

const mk = async (Model, rows) => Model.insertMany(rows.map((r) => ({ owner, ...r })));
const [civic, secur, fleet, agro] = await mk(M.Project, [
  { name: 'CivicSlot', description: 'Appointment booking for public service offices.', type: 'Multi-tenant SaaS', status: 'Production', version: 'v1.8.2', stack: ['React Native', 'Expo', 'Node.js', 'MongoDB', 'Render', 'MongoDB Atlas'], color: '#2450d8', deploymentProvider: 'Render', databaseProvider: 'MongoDB Atlas', lastMaintenanceAt: day(-3) },
  { name: 'SecurRoute', description: 'Government / transport verification platform.', type: 'Client Project', status: 'Pilot', version: 'v1.1.0', stack: ['React Native', 'Expo', 'Node.js', 'MongoDB'], color: '#0f8f8f', deploymentProvider: 'Render', databaseProvider: 'MongoDB Atlas', lastMaintenanceAt: day(-6) },
  { name: 'Fleet SaaS', description: 'Car rental agencies and taxi fleets, one platform for many tenants.', type: 'Multi-tenant SaaS', status: 'Production', version: 'v2.3.0', stack: ['React', 'Vite', 'React Native', 'Expo', 'Node.js', 'Express', 'MongoDB'], color: '#b45a12', deploymentProvider: 'Render', databaseProvider: 'MongoDB Atlas', lastMaintenanceAt: day(-30) },
  { name: 'AgroNjangi', description: 'Savings and produce groups for farmers.', type: 'Mobile App', status: 'Development', version: 'v0.4.0', stack: ['Flutter'], color: '#5b8a1e', lastMaintenanceAt: day(-13) },
]);

const [cTransport, cRentals, cUnion] = await mk(M.Client, [
  { name: 'Regional Transport Office', organization: 'Transport authority (pilot)', email: 'office@example.org', projects: [secur._id], environment: 'Staging', deploymentStatus: 'Pilot running', subscription: { plan: 'Pilot', status: 'Active', renewalDate: day(6) }, notes: 'Wants offline verification before wider rollout.', lastInteractionAt: day(-2) },
  { name: 'Coastal Rentals', organization: 'Coastal Rentals Ltd', email: 'ops@example.org', projects: [fleet._id], environment: 'Production', deploymentStatus: 'Live', subscription: { plan: 'Business', status: 'Active', renewalDate: day(40) }, lastInteractionAt: day(-5) },
  { name: 'City Taxi Union', organization: 'City Taxi Union', email: 'union@example.org', projects: [fleet._id], environment: 'Production', deploymentStatus: 'Live', subscription: { plan: 'Starter', status: 'Active', renewalDate: day(20) }, supportRequests: ['Driver receipts show wrong currency'] },
]);

await mk(M.Tenant, [
  { project: fleet._id, client: cRentals._id, name: 'Coastal Rentals', status: 'Active', version: 'v2.3.0', deployedAt: day(-14), lastMaintenanceAt: day(-30) },
  { project: fleet._id, client: cUnion._id, name: 'City Taxi Union', status: 'Active', version: 'v2.3.0', deployedAt: day(-14), lastMaintenanceAt: day(-30), supportIssues: ['Driver receipts show wrong currency'] },
  { project: fleet._id, name: 'Savanna Cars', status: 'Trial', version: 'v2.3.0', deployedAt: day(-9) },
  { project: fleet._id, name: 'Metro Cabs', status: 'Active', version: 'v2.2.4', deployedAt: day(-60) },
  { project: civic._id, name: 'Commune A', status: 'Active', version: 'v1.8.2', deployedAt: day(-3), lastMaintenanceAt: day(-3) },
  { project: civic._id, name: 'Commune B', status: 'Active', version: 'v1.8.2', deployedAt: day(-3) },
  { project: civic._id, name: 'Regional Office', status: 'Trial', version: 'v1.8.1', deployedAt: day(-25) },
  { project: secur._id, client: cTransport._id, name: 'Pilot Checkpoint Network', status: 'Active', environment: 'Staging', version: 'v1.1.0', deployedAt: day(-9) },
]);

const T = (project, title, type, priority, status, d, extra = {}) => ({ project: project._id, title, type, priority, status, scheduledDate: day(d), ...extra });
await mk(M.Task, [
  T(civic, 'Fix booking confirmation', 'Bug Fix', 'Critical', 'in_progress', 0, { startTime: '09:00', endTime: '10:00', estimatedMinutes: 60, dueDate: day(0) }),
  T(secur, 'Improve OCR workflow', 'Development', 'High', 'todo', 0, { startTime: '10:30', endTime: '12:30', estimatedMinutes: 120 }),
  T(fleet, 'Review tenant dashboard', 'Development', 'Medium', 'todo', 0, { startTime: '14:00', endTime: '15:00', estimatedMinutes: 60 }),
  T(agro, 'French localization', 'Feature', 'Low', 'todo', 0, { startTime: '16:00', endTime: '17:00', estimatedMinutes: 60 }),
  T(fleet, 'Driver receipt workflow', 'Feature', 'High', 'todo', -1, { estimatedMinutes: 120, dueDate: day(-1) }),
  T(secur, 'QR scanning tests', 'Testing', 'High', 'todo', -1, { estimatedMinutes: 90 }),
  T(civic, 'Auth security patches', 'Maintenance', 'Medium', 'completed', -2, { estimatedMinutes: 90, actualMinutes: 110, completedAt: day(-2) }),
  T(civic, 'Slot picker DST fix', 'Bug Fix', 'Low', 'completed', -3, { estimatedMinutes: 60, actualMinutes: 45, completedAt: day(-3) }),
  T(fleet, 'Tenant branding settings', 'Feature', 'Medium', 'completed', -4, { estimatedMinutes: 180, actualMinutes: 240, completedAt: day(-4) }),
  T(civic, 'Production testing', 'Testing', 'High', 'todo', 1, { estimatedMinutes: 120 }),
  T(agro, 'UI improvements', 'Feature', 'Low', 'todo', 1, { estimatedMinutes: 90 }),
  T(secur, 'v1.2 deployment prep', 'Deployment', 'High', 'todo', 2, { estimatedMinutes: 90, dueDate: day(3) }),
  T(fleet, 'Update API documentation', 'Documentation', 'Low', 'todo', 3, { estimatedMinutes: 60 }),
  T(fleet, 'Client request: export drivers to CSV', 'Client Request', 'Medium', 'todo', 1, { client: cRentals._id, estimatedMinutes: 60 }),
]);

const nextFriday = (5 - today().getUTCDay() + 7) % 7;
await mk(M.MaintenanceSchedule, [
  { project: civic._id, title: 'CivicSlot weekly maintenance', frequency: 'weekly', nextDueAt: day(nextFriday), estimatedMinutes: 120, checklist: 'Dependency updates\nDB indexes and slow queries\nBackup restore check' },
  { project: secur._id, title: 'SecurRoute biweekly maintenance', frequency: 'biweekly', nextDueAt: day(8), estimatedMinutes: 120 },
  { project: fleet._id, title: 'Fleet SaaS monthly maintenance', frequency: 'custom', intervalDays: 30, nextDueAt: day(0), estimatedMinutes: 180, checklist: 'Per-tenant data checks\nMobile Money reconciliation review' },
  { project: agro._id, title: 'AgroNjangi dependency review', frequency: 'monthly', nextDueAt: day(15), estimatedMinutes: 60 },
]);

await mk(M.Bug, [
  { project: civic._id, title: 'Booking confirmation not sent on retry', severity: 'High', status: 'Investigating', steps: '1. Book a slot\n2. Lose connection at confirmation\n3. Retry', expected: 'One confirmation SMS', actual: 'No confirmation is sent' },
  { project: civic._id, title: 'Slot picker off by one on DST change', severity: 'Low', status: 'Open' },
  { project: secur._id, title: 'OCR fails on low-light plates', severity: 'High', status: 'In Progress' },
  { project: secur._id, title: 'QR scan times out on Android 12', severity: 'Medium', status: 'Open' },
  { project: fleet._id, title: 'Receipt PDF missing tenant logo', severity: 'Medium', status: 'Open' },
  { project: fleet._id, title: 'Duplicate driver on CSV import', severity: 'Low', status: 'Fixed', resolution: 'Deduplicate on phone number before insert.' },
  { project: agro._id, title: 'Crash when switching language', severity: 'Medium', status: 'Open' },
]);

await mk(M.Feature, [
  { project: civic._id, title: 'SMS reminders', stage: 'Planned' }, { project: civic._id, title: 'Multi-language forms', stage: 'In Development' },
  { project: civic._id, title: 'Queue analytics', stage: 'Idea' }, { project: civic._id, title: 'Admin export', stage: 'Released' },
  { project: secur._id, title: 'Offline verification', stage: 'In Development' }, { project: secur._id, title: 'Officer audit log', stage: 'Planned' }, { project: secur._id, title: 'Batch scan', stage: 'Testing' },
  { project: fleet._id, title: 'Driver receipts', stage: 'In Development' }, { project: fleet._id, title: 'Mobile Money reconciliation', stage: 'Planned' },
  { project: fleet._id, title: 'Tenant branding', stage: 'Testing' }, { project: fleet._id, title: 'Vehicle inspection checklists', stage: 'Idea' },
  { project: agro._id, title: 'French localization', stage: 'In Development' }, { project: agro._id, title: 'Crop calendar', stage: 'Planned' }, { project: agro._id, title: 'Market prices', stage: 'Idea' },
]);

await mk(M.Deployment, [
  { project: secur._id, version: 'v1.2.0', environment: 'Production', deployedAt: at(5, 9), status: 'Scheduled', changes: 'OCR improvements\nQR scan fixes' },
  { project: fleet._id, version: 'v2.3.1', environment: 'Staging', deployedAt: at(3, 10), status: 'Scheduled', changes: 'Tenant branding' },
  { project: civic._id, version: 'v1.8.2', environment: 'Production', deployedAt: at(-3, 8), status: 'Successful', changes: 'Booking fixes\nAdmin dashboard update' },
  { project: fleet._id, version: 'v2.3.0', environment: 'Production', deployedAt: at(-14, 8), status: 'Successful' },
  { project: secur._id, version: 'v1.1.0', environment: 'Staging', deployedAt: at(-9, 15), status: 'Failed', rollbackNotes: 'Rolled back: migration timed out. Run it in batches.' },
]);

await mk(M.CalendarEvent, [
  { title: 'Coastal Rentals check-in call', kind: 'Client appointment', start: at(1, 15), end: at(1, 16), client: cRentals._id, project: fleet._id },
  { title: 'Transport Office pilot review', kind: 'Meeting', start: at(4, 10), end: at(4, 11, 30), client: cTransport._id, project: secur._id },
]);

await mk(M.Note, [
  { project: civic._id, title: 'Deployment checklist', tags: ['deploy'], body: '# Deploying CivicSlot\n\n1. Merge to `main`\n2. Wait for the build on Render\n3. Run `npm run migrate` if models changed\n4. Smoke-test booking and confirmation\n\n> Never run migrations during office hours.' },
  { project: fleet._id, title: 'Tenant onboarding', tags: ['tenants'], body: '## New tenant\n\n- Create tenant record\n- Set branding\n- Import drivers (CSV)\n- Send welcome email' },
  { project: secur._id, title: 'OCR ideas', tags: ['ideas'], body: 'Try preprocessing (contrast + deskew) before OCR. Compare on the low-light sample set.' },
]);

await mk(M.ActivityLog, [
  { summary: 'Updated CivicSlot to v1.8.2', action: 'updated', entityType: 'project', project: civic._id, at: at(-3, 8) },
  { summary: 'Added tenant "Savanna Cars"', action: 'created', entityType: 'tenant', project: fleet._id, at: at(-9, 11) },
]);

await materializeMaintenance(owner);
await generateReminders(owner);
console.log(`Seeded. Sign in with ${email} / ${password}`);
await mongoose.disconnect();
