import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resource, activityApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { fmtDate, fmtDateTime, relDay } from '../utils/dates.js';
import Chip from '../components/Chip.jsx';
import EntityPage from '../components/EntityPage.jsx';
import HealthBadge from '../components/HealthBadge.jsx';
import Modal from '../components/Modal.jsx';
import RecordForm from '../components/RecordForm.jsx';
import { Kanban } from './Roadmap.jsx';
import { MaintenanceView } from './Maintenance.jsx';
import { NotesView } from './Notes.jsx';

const TABS = ['Overview', 'Tasks', 'Bugs', 'Features', 'Clients / Tenants', 'Deployments', 'Maintenance', 'Infrastructure', 'Notes'];
const URLS = [['repoUrl', 'Repository'], ['frontendUrl', 'Frontend'], ['backendUrl', 'Backend'], ['productionUrl', 'Production'], ['docsUrl', 'Documentation']];

export default function ProjectDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: p, loading, error } = useFetch(() => resource('projects').get(id), [id]);
  const { data: activity } = useFetch(() => activityApi({ project: id }), [id]);
  const [tab, setTab] = useState('Overview');
  const [editing, setEditing] = useState(false);
  if (loading && !p) return <p className="mu">Loading…</p>;
  if (error) return <p className="err">{error}</p>;
  const fixed = { project: id };

  return (
    <>
      <Link to="/projects" className="small">← All projects</Link>
      <div className="top">
        <div>
          <h1>{p.name}</h1>
          <div className="mu">{p.type} · {p.status}{p.version && ` · ${p.version}`}</div>
        </div>
        <div className="row-inline">
          <HealthBadge health={p.health} reasons={p.healthReasons} label />
          <button className="btn ghost" onClick={() => setEditing(true)}>Edit project</button>
        </div>
      </div>
      <div className="tabs">{TABS.map((t) => <button key={t} className={t === tab ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === 'Overview' && (
        <div className="cols">
          <div className="pn">
            <p>{p.description || <span className="mu">No description yet.</span>}</p>
            <div>{(p.stack || []).map((s) => <Chip key={s}>{s}</Chip>)}</div>
            <div className="kv">
              <span>{p.stats.openBugs} open bugs</span><span>{p.stats.pendingFeatures} pending features</span>
              <span>{p.stats.activeTenants} active tenants</span><span>{p.stats.overdueTasks} overdue tasks</span>
              <span>Last maintenance: {fmtDate(p.lastMaintenanceAt)}</span>
              <span>Next: {p.stats.nextMaintenanceAt ? relDay(p.stats.nextMaintenanceAt) : 'not scheduled'}</span>
            </div>
            {p.healthReasons.length > 0 && <p className="small">Health signals: {p.healthReasons.join(' · ')}</p>}
            <p className="small">{URLS.filter(([k]) => p[k]).map(([k, l]) => <span key={k}><a href={p[k]} target="_blank" rel="noopener noreferrer">{l}</a>{'  '}</span>)}</p>
          </div>
          <div className="pn">
            <h2>Activity</h2>
            {!(activity || []).length && <p className="mu">No activity yet.</p>}
            {(activity || []).slice(0, 8).map((a) => <div key={a._id} className="row"><span>{a.summary}</span><span className="mu small">{fmtDateTime(a.at)}</span></div>)}
          </div>
        </div>
      )}
      {tab === 'Tasks' && <EntityPage entityKey="tasks" fixed={fixed} embedded filters={['status', 'priority']} />}
      {tab === 'Bugs' && <EntityPage entityKey="bugs" fixed={fixed} embedded filters={['severity', 'status']} />}
      {tab === 'Features' && <Kanban projectId={id} />}
      {tab === 'Clients / Tenants' && (
        <>
          <EntityPage entityKey="tenants" fixed={fixed} embedded />
          <EntityPage entityKey="clients" fixed={{ projects: id }} embedded />
        </>
      )}
      {tab === 'Deployments' && <EntityPage entityKey="deployments" fixed={fixed} embedded />}
      {tab === 'Maintenance' && <MaintenanceView projectId={id} embedded />}
      {tab === 'Infrastructure' && (
        <div className="pn">
          <div className="kv">
            <span>Deployment provider: {p.deploymentProvider || '—'}</span><span>Database provider: {p.databaseProvider || '—'}</span>
            {URLS.map(([k, l]) => <span key={k}>{l}: {p[k] ? <a href={p[k]} target="_blank" rel="noopener noreferrer">{p[k]}</a> : '—'}</span>)}
          </div>
          <p className="mu small">Never store passwords, API keys or connection strings here. Secrets belong in your hosting provider’s environment settings or a secrets manager.</p>
        </div>
      )}
      {tab === 'Notes' && <NotesView projectId={id} embedded />}

      {editing && (
        <Modal title="Edit project" onClose={() => setEditing(false)}>
          <RecordForm entityKey="projects" initial={p} onClose={() => setEditing(false)} onSaved={() => {}} />
          <button className="link danger-t" onClick={async () => {
            if (window.confirm(`Delete ${p.name} and everything that belongs to it (tasks, bugs, features, tenants, deployments, notes)?`)) {
              await resource('projects').remove(id);
              nav('/projects');
            }
          }}>Delete project and all its data</button>
        </Modal>
      )}
    </>
  );
}
