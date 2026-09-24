import { resource } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { fmtDate, relDay } from '../utils/dates.js';
import EntityPage from '../components/EntityPage.jsx';
import StatusSelect from '../components/StatusSelect.jsx';

// Schedules (recurring rules) + upcoming maintenance tasks + history of completed maintenance.
export function MaintenanceView({ projectId, embedded }) {
  const fixed = projectId ? { project: projectId } : {};
  const { data } = useFetch(() => resource('tasks').list({ ...fixed, type: 'Maintenance' }), [projectId]);
  const tasks = data || [];
  const upcoming = tasks.filter((t) => t.status !== 'completed').sort((a, b) => String(a.scheduledDate).localeCompare(String(b.scheduledDate)));
  const history = tasks.filter((t) => t.status === 'completed').sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  return (
    <>
      <EntityPage entityKey="maintenance" fixed={fixed} embedded={embedded} title="Recurring maintenance" />
      <div className="cols">
        <div className="pn">
          <h2>Upcoming</h2>
          {!upcoming.length && <p className="mu">No maintenance tasks yet. They are created automatically from your schedules.</p>}
          {upcoming.map((t) => (
            <div key={t._id} className="row">
              <span>{!projectId && <strong>{t.project?.name}: </strong>}{t.title}<br /><span className="mu small">{relDay(t.scheduledDate)}</span></span>
              <StatusSelect task={t} />
            </div>
          ))}
        </div>
        <div className="pn">
          <h2>History</h2>
          {!history.length && <p className="mu">Completed maintenance appears here.</p>}
          {history.slice(0, 20).map((t) => (
            <div key={t._id} className="row">
              <span>{!projectId && <strong>{t.project?.name}: </strong>}{t.title}{t.notes && <><br /><span className="mu small">{t.notes.split('\n').join(' · ')}</span></>}</span>
              <span className="mu small">{fmtDate(t.completedAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Maintenance() {
  return <MaintenanceView />;
}
