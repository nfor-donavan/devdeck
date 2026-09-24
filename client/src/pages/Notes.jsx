import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { resource } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { fmtDate } from '../utils/dates.js';
import Chip from '../components/Chip.jsx';
import Modal from '../components/Modal.jsx';
import RecordForm from '../components/RecordForm.jsx';

export function NotesView({ projectId, embedded }) {
  const { data } = useFetch(() => resource('notes').list(projectId ? { project: projectId } : {}), [projectId]);
  const [sel, setSel] = useState(null);
  const [editing, setEditing] = useState(null);
  const notes = data || [];
  const current = notes.find((n) => n._id === sel) || notes[0];
  const Head = embedded ? 'h2' : 'h1';
  return (
    <>
      <div className="top">
        <Head>Notes</Head>
        <button className="btn" onClick={() => setEditing({})}>+ Add note</button>
      </div>
      {!notes.length && <p className="mu">No notes yet. Use them for architecture decisions, commands, client requirements and troubleshooting.</p>}
      {notes.length > 0 && (
        <div className="notes">
          <div className="pn">
            {notes.map((n) => (
              <button key={n._id} className={'note-item' + (current?._id === n._id ? ' on' : '')} onClick={() => setSel(n._id)}>
                <strong>{n.title}</strong>
                <span className="mu small">{n.project?.name || 'General'} · {fmtDate(n.updatedAt)}</span>
              </button>
            ))}
          </div>
          {current && (
            <div className="pn md-body">
              <div className="between">
                <h2>{current.title}</h2>
                <button className="btn ghost" onClick={() => setEditing(current)}>Edit</button>
              </div>
              <div>{(current.tags || []).map((t) => <Chip key={t}>{t}</Chip>)}</div>
              <ReactMarkdown>{current.body || '*Empty note*'}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
      {editing && (
        <Modal title={editing._id ? 'Edit note' : 'New note'} onClose={() => setEditing(null)} wide>
          <RecordForm entityKey="notes" initial={editing._id ? editing : undefined} defaults={projectId ? { project: projectId } : {}} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </>
  );
}

export default function Notes() {
  return <NotesView />;
}
