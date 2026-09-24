import { useState } from 'react';
import { ENTITIES, QUICK_ADD } from '../entities.js';
import Modal from './Modal.jsx';
import RecordForm from './RecordForm.jsx';

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [entity, setEntity] = useState(null);
  return (
    <div className="qa">
      <button className="btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>+ Add</button>
      {open && (
        <div className="menu" onMouseLeave={() => setOpen(false)}>
          {QUICK_ADD.map((k) => (
            <button key={k} onClick={() => { setEntity(k); setOpen(false); }}>{ENTITIES[k].label}</button>
          ))}
        </div>
      )}
      {entity && (
        <Modal title={`New ${ENTITIES[entity].label.toLowerCase()}`} onClose={() => setEntity(null)}>
          <RecordForm entityKey={entity} onClose={() => setEntity(null)} />
        </Modal>
      )}
    </div>
  );
}
