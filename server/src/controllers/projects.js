import { Project } from '../models/index.js';
import { crud } from './crud.js';
import { wrap } from '../utils/wrap.js';
import { ApiError } from '../utils/ApiError.js';
import { summaries } from '../services/projectStats.js';
import { projectCascade } from './resources.js';

const base = crud(Project, { entity: 'project', label: (p) => p.name, afterDelete: projectCascade });

export default {
  ...base,
  list: wrap(async (req, res) => res.json(await summaries(req.user.id))),
  get: wrap(async (req, res) => {
    const [p] = await summaries(req.user.id, req.params.id);
    if (!p) throw new ApiError(404, 'Not found');
    res.json(p);
  }),
};
