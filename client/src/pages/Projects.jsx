import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resource } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { fmtDate, relDay } from '../utils/dates.js';
import Chip from '../components/Chip.jsx';
import HealthBadge from '../components/HealthBadge.jsx';
import Modal from '../components/Modal.jsx';
import RecordForm from '../components/RecordForm.jsx';

export default function Projects() {
  const { data, loading, error } = useFetch(() => resource('projects').list());
  const [adding, setAdding] = useState(false);
  return (
    <>
      <div className="top">
        <h1>Projects</h1>
        <button className="btn" onClick={() => setAdding(true)}>+ Add project</button>
      </div>
      {error && <p className="err">{error}</p>}
      {!loading && !data?.length && <p className="mu">No projects yet. Add your first one.</p>}
      <div className="gr">
        {(data || []).map((p) => (
          <Link key={p._id} to={`/projects/${p._id}`} className="card" style={{ '--c': p.color }}>
            <div className="between">
              <h3>{p.name}</h3>
              <HealthBadge health={p.health} reasons={p.healthReasons} label />
            </div>
            <div className="mu">{p.type} · {p.status}{p.version && ` · ${p.version}`}</div>
            <p>{p.description}</p>
            <div>{(p.stack || []).map((s) => <Chip key={s}>{s}</Chip>)}</div>
            <div className="kv">
              <span>{p.stats.openBugs} open bugs</span>
              <span>{p.stats.pendingFeatures} pending features</span>
              <span>{p.stats.activeTenants} active tenants</span>
              <span>Last maintenance: {fmtDate(p.lastMaintenanceAt)}</span>
              <span className="span2">Next maintenance: {p.stats.nextMaintenanceAt ? relDay(p.stats.nextMaintenanceAt) : 'Not scheduled'}</span>
            </div>
          </Link>
        ))}
      </div>
      {adding && <Modal title="New project" onClose={() => setAdding(false)}><RecordForm entityKey="projects" onClose={() => setAdding(false)} /></Modal>}
    </>
  );
}
