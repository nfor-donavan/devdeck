import { MaintenanceSchedule } from '../models/index.js';
import { crud } from './crud.js';
import { today } from '../utils/dates.js';
import { materializeMaintenance } from '../services/maintenance.js';

export default crud(MaintenanceSchedule, {
  entity: 'maintenance schedule',
  populate: [{ path: 'project', select: 'name color' }],
  sort: 'nextDueAt',
  before: (data, prev) => {
    if (!data.nextDueAt && !prev) data.nextDueAt = today();
  },
  after: (_doc, _info, req) => materializeMaintenance(req.user.id),
});
