import { Bug, Feature, Client, Tenant, Deployment, CalendarEvent, Note, Project, Task } from '../models/index.js';
import { crud } from './crud.js';

const project = { path: 'project', select: 'name color' };

export const bugs = crud(Bug, { entity: 'bug', populate: [project, { path: 'task', select: 'title' }] });
export const features = crud(Feature, { entity: 'feature', populate: [project], sort: 'createdAt' });
export const clients = crud(Client, { entity: 'client', populate: [{ path: 'projects', select: 'name color' }], sort: 'name' });
export const tenants = crud(Tenant, { entity: 'tenant', populate: [project, { path: 'client', select: 'name' }], sort: 'name' });
export const events = crud(CalendarEvent, { entity: 'event', populate: [project], sort: 'start' });
export const notes = crud(Note, { entity: 'note', populate: [project], sort: '-updatedAt' });

export const deployments = crud(Deployment, {
  entity: 'deployment',
  populate: [project],
  sort: '-deployedAt',
  after: async (d, { created, changed }, req) => {
    // A successful production deployment updates the project's current version.
    const becameSuccess = d.status === 'Successful' && (created || changed.includes('status'));
    if (becameSuccess && d.environment === 'Production') {
      await Project.updateOne({ _id: d.project, owner: req.user.id }, { version: d.version });
    }
  },
});

// Deleting a project removes everything that belongs to it.
export const projectCascade = async (p, req) => {
  const q = { owner: req.user.id, project: p._id };
  await Promise.all([Task, Bug, Feature, Tenant, Deployment, Note, CalendarEvent].map((M) => M.deleteMany(q)));
};
