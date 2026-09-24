import { ApiError } from '../utils/ApiError.js';
import { wrap } from '../utils/wrap.js';
import { logActivity } from '../services/activity.js';

// Strip fields the client must never set; '' becomes null so empty inputs clear a value.
const clean = ({ _id, id, owner, createdAt, updatedAt, __v, ...rest }) => rest;
const blank = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v === '' ? null : v]));

/**
 * Generic owner-scoped CRUD.
 * before(data, previousDoc, req) can adjust incoming data; after(doc, {created, changed}, req) runs after saving.
 */
export function crud(Model, opts = {}) {
  const { populate, entity, before, after, afterDelete, sort = '-createdAt' } = opts;
  const label = opts.label || ((d) => d.title || d.name || d.version);
  const pop = (q) => (populate ? q.populate(populate) : q);
  const projectOf = (d) => d.project?._id || d.project;

  const list = wrap(async (req, res) => {
    const q = { owner: req.user.id };
    const { sort: s, from, to, dateField, limit, ...rest } = req.query;
    for (const [k, v] of Object.entries(rest)) {
      if (typeof v === 'string' && v && Model.schema.path(k)) q[k] = v; // strings only: no operator injection
    }
    if (typeof dateField === 'string' && Model.schema.path(dateField) && (from || to)) {
      q[dateField] = {};
      if (from) q[dateField].$gte = new Date(from);
      if (to) q[dateField].$lte = new Date(to);
    }
    const sortKey = typeof s === 'string' && Model.schema.path(s.replace(/^-/, '')) ? s : sort;
    res.json(await pop(Model.find(q).sort(sortKey).limit(Math.min(Number(limit) || 500, 1000))));
  });

  const get = wrap(async (req, res) => {
    const doc = await pop(Model.findOne({ _id: req.params.id, owner: req.user.id }));
    if (!doc) throw new ApiError(404, 'Not found');
    res.json(doc);
  });

  const create = wrap(async (req, res) => {
    const data = blank(clean(req.body));
    if (before) await before(data, null, req);
    const doc = await Model.create({ ...data, owner: req.user.id });
    if (after) await after(doc, { created: true, changed: [] }, req);
    if (entity) {
      await logActivity(req.user.id, { action: 'created', entityType: entity, entityId: doc._id, summary: `Created ${entity} "${label(doc)}"`, project: projectOf(doc) });
    }
    res.status(201).json(await pop(Model.findById(doc._id)));
  });

  const update = wrap(async (req, res) => {
    const doc = await Model.findOne({ _id: req.params.id, owner: req.user.id });
    if (!doc) throw new ApiError(404, 'Not found');
    const data = blank(clean(req.body));
    if (before) await before(data, doc, req);
    doc.set(data);
    const changed = doc.modifiedPaths();
    await doc.save();
    if (after) await after(doc, { created: false, changed }, req);
    const state = doc.status || doc.stage;
    if (entity && (changed.includes('status') || changed.includes('stage'))) {
      const verb = state === 'completed' ? 'Completed' : 'Updated';
      await logActivity(req.user.id, { action: 'updated', entityType: entity, entityId: doc._id, summary: `${verb} ${entity} "${label(doc)}" (${state})`, project: projectOf(doc) });
    }
    res.json(await pop(Model.findById(doc._id)));
  });

  const remove = wrap(async (req, res) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!doc) throw new ApiError(404, 'Not found');
    if (afterDelete) await afterDelete(doc, req);
    if (entity) await logActivity(req.user.id, { action: 'deleted', entityType: entity, summary: `Deleted ${entity} "${label(doc)}"`, project: projectOf(doc) });
    res.status(204).end();
  });

  return { list, get, create, update, remove };
}
