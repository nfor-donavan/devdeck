import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import auth from '../middleware/auth.js';
import * as A from '../controllers/auth.js';
import * as R from '../controllers/resources.js';
import projects from '../controllers/projects.js';
import tasks from '../controllers/tasks.js';
import maintenance from '../controllers/maintenance.js';
import * as N from '../controllers/notifications.js';
import * as D from '../controllers/dashboard.js';
import { search } from '../controllers/search.js';
import { feed } from '../controllers/calendar.js';
import { analytics } from '../controllers/analytics.js';
import * as Act from '../controllers/activity.js';

const api = Router();

const authLimit = rateLimit({ windowMs: 15 * 60_000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many attempts, try again later' } });
api.post('/auth/register', authLimit, A.register);
api.post('/auth/login', authLimit, A.login);
api.post('/auth/forgot-password', authLimit, A.forgot);
api.post('/auth/reset-password', authLimit, A.reset);

api.use(auth); // everything below needs a valid token
api.get('/auth/me', A.me);
api.patch('/auth/settings', A.saveSettings);
api.post('/auth/change-password', A.changePassword);

const rest = (path, c) => {
  const r = Router();
  r.get('/', c.list).post('/', c.create);
  r.get('/:id', c.get).patch('/:id', c.update).delete('/:id', c.remove);
  api.use(path, r);
};
rest('/projects', projects);
rest('/tasks', tasks);
rest('/bugs', R.bugs);
rest('/features', R.features);
rest('/clients', R.clients);
rest('/tenants', R.tenants);
rest('/deployments', R.deployments);
rest('/maintenance', maintenance);
rest('/events', R.events);
rest('/notes', R.notes);

api.get('/notifications', N.list);
api.post('/notifications/read-all', N.readAll);
api.patch('/notifications/:id', N.markRead);
api.delete('/notifications/:id', N.remove);

api.get('/dashboard', D.summary);
api.post('/dashboard/plan', D.plan);
api.post('/dashboard/plan/apply', D.applyDayPlan);
api.get('/search', search);
api.get('/calendar', feed);
api.get('/analytics', analytics);
api.get('/activity', Act.list);

export default api;
