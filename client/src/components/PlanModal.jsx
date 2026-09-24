import { useEffect, useState } from 'react';
import { dashboardApi } from '../services/resources.js';
import { refreshAll } from '../api/client.js';
import Modal from './Modal.jsx';
import Chip from './Chip.jsx';

// "Plan my day": a suggestion the user can edit. Nothing is saved until "Add to today".
export default function PlanModal({ defaultHours = 6, onClose }) {
  const [hours, setHours] = useState(defaultHours);
  const [plan, setPlan] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const load = (h) => dashboardApi.plan(h).then(setPlan).catch((e) => setErr(e.message));
  useEffect(() => { load(hours); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const items = plan?.items || [];
  const total = items.reduce((a, i) => a + i.minutes, 0);
  const patch = (id, fn) => setPlan((p) => ({ ...p, items: fn(p.items) }));
  const resize = (id, d) => patch(id, (l) => l.map((i) => (i.taskId === id ? { ...i, minutes: Math.max(15, i.minutes + d) } : i)));
  const drop = (id) => patch(id, (l) => l.filter((i) => i.taskId !== id));

  const apply = async () => {
    setBusy(true);
    try { await dashboardApi.apply(items.map((i) => ({ taskId: i.taskId, minutes: i.minutes }))); refreshAll(); onClose(); }
    catch (e) { setErr(e.message); setBusy(false); }
  };

  return (
    <Modal title="Suggested workload" onClose={onClose} wide>
      <p className="mu">Ranked by priority, overdue work, deadlines, maintenance and deployments. Remove or resize anything — this is only a suggestion.</p>
      <label className="row-inline">Hours available today
        <input type="number" min="1" max="16" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} style={{ width: 80 }} />
        <button className="btn ghost" onClick={() => load(Number(hours) || 6)}>Re-plan</button>
      </label>
      {err && <p className="err">{err}</p>}
      {!plan && !err && <p className="mu">Planning…</p>}
      {plan && !items.length && <p className="mu">No open tasks fit. Add tasks or increase the hours.</p>}
      {items.map((i, n) => (
        <div className="row" key={i.taskId}>
          <div>
            <strong>{n + 1}. {i.project}</strong> — {i.title}<br />
            <Chip v={i.priority} /> <Chip>{i.type}</Chip>
            <span className="mu small"> {i.reasons.slice(1, 3).join(' · ')}</span>
          </div>
          <div className="row-inline nowrap">
            <button className="x" onClick={() => resize(i.taskId, -30)} aria-label="30 minutes less">−</button>
            <span>{i.minutes >= 60 ? `${Math.round((i.minutes / 60) * 10) / 10}h` : `${i.minutes}m`}</span>
            <button className="x" onClick={() => resize(i.taskId, 30)} aria-label="30 minutes more">+</button>
            <button className="x" onClick={() => drop(i.taskId)} aria-label="Remove from plan">✕</button>
          </div>
        </div>
      ))}
      <div className="actions">
        <strong>Total planned: {Math.round((total / 60) * 10) / 10}h</strong>
        <span className="grow" />
        <button className="btn ghost" onClick={onClose}>Not now</button>
        <button className="btn" disabled={!items.length || busy} onClick={apply}>Add to today</button>
      </div>
    </Modal>
  );
}
