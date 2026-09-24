import { Project, Task, Bug, Feature, Client, Tenant, Deployment, Note } from '../models/index.js';
import { wrap } from '../utils/wrap.js';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Global search across every entity. Returns results grouped by type.
export const search = wrap(async (req, res) => {
  const term = String(req.query.q || '').trim().slice(0, 60);
  if (term.length < 2) return res.json({});
  const rx = new RegExp(esc(term), 'i');
  const owner = req.user.id;
  const find = (Model, fields, select, populate) => {
    const q = Model.find({ owner, $or: fields.map((f) => ({ [f]: rx })) }).select(select).limit(6).lean();
    return populate ? q.populate(populate, 'name') : q;
  };
  const [projects, tasks, bugs, features, clients, tenants, deployments, notes] = await Promise.all([
    find(Project, ['name', 'description'], 'name status'),
    find(Task, ['title', 'description'], 'title status project', 'project'),
    find(Bug, ['title', 'description'], 'title status project', 'project'),
    find(Feature, ['title', 'description'], 'title stage project', 'project'),
    find(Client, ['name', 'organization'], 'name organization'),
    find(Tenant, ['name'], 'name status project', 'project'),
    find(Deployment, ['version', 'changes'], 'version status project', 'project'),
    find(Note, ['title', 'body'], 'title project', 'project'),
  ]);
  // Also include everything that belongs to a project whose name matches (searching "CivicSlot" returns it all).
  const named = projects.map((p) => p._id);
  let byProject = {};
  if (named.length) {
    const inProject = (Model, select) => Model.find({ owner, project: { $in: named } }).select(select).limit(6).populate('project', 'name').lean();
    const [t, b, f, n] = await Promise.all([inProject(Task, 'title status project'), inProject(Bug, 'title status project'), inProject(Feature, 'title stage project'), inProject(Note, 'title project')]);
    byProject = { tasks: t, bugs: b, features: f, notes: n };
  }
  const merge = (a, b = []) => [...a, ...b.filter((x) => !a.some((y) => String(y._id) === String(x._id)))];
  res.json({
    projects, tasks: merge(tasks, byProject.tasks), bugs: merge(bugs, byProject.bugs), features: merge(features, byProject.features),
    clients, tenants, deployments, notes: merge(notes, byProject.notes),
  });
});
