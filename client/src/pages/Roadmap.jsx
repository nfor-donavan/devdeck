import { useState } from 'react';
import { resource } from '../services/resources.js';
import { refreshAll } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import { FEATURE_STAGES } from '../utils/constants.js';
import Chip from '../components/Chip.jsx';
import Modal from '../components/Modal.jsx';
import RecordForm from '../components/RecordForm.jsx';

// Feature roadmap as a kanban board. Drag a card to another column to change its stage.
export function Kanban({ projectId }) {
  const [project, setProject] = useState(projectId || '');
  const [editing, setEditing] = useState(null);
  const { data } = useFetch(() => resource('features').list({ project }), [project]);
  const { data: projects } = useFetch(() => (projectId ? Promise.resolve([]) : resource('projects').list()), [projectId]);

  const drop = async (e, stage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    await resource('features').update(id, { stage });
    refreshAll();
  };

  return (
    <>
      <div className="top">
        <h2>Roadmap</h2>
        <div className="row-inline">
          {!projectId && (
            <select value={project} onChange={(e) => setProject(e.target.value)} aria-label="Project">
              <option value="">All projects</option>
              {(projects || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}
          <button className="btn" onClick={() => setEditing({})}>+ Add feature</button>
        </div>
      </div>
      <div className="kan">
        {FEATURE_STAGES.map((stage) => (
          <div key={stage} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, stage)}>
            <strong>{stage}</strong>
            {(data || []).filter((f) => f.stage === stage).map((f) => (
              <div key={f._id} className="it" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', f._id)} onClick={() => setEditing(f)}>
                {f.title}
                <div className="mu small">{f.project?.name} <Chip v={f.priority} /></div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {editing && (
        <Modal title={editing._id ? 'Edit feature' : 'New feature'} onClose={() => setEditing(null)}>
          <RecordForm entityKey="features" initial={editing._id ? editing : undefined} defaults={projectId ? { project: projectId } : {}} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}

export default function Roadmap() {
  return <Kanban />;
}
