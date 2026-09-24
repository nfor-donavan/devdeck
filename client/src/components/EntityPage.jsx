import { useState } from 'react';
import { ENTITIES } from '../entities.js';
import { resource } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { fmtDate, fmtDateTime, relDay, isOverdue } from '../utils/dates.js';
import Chip from './Chip.jsx';
import Modal from './Modal.jsx';
import RecordForm from './RecordForm.jsx';
import StatusSelect from './StatusSelect.jsx';

const get = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);

function Cell({ col, row }) {
  const v = get(row, col.key);
  switch (col.type) {
    case 'chip': return v ? <Chip v={v} /> : '—';
    case 'status': return <StatusSelect task={row} />;
    case 'date': return fmtDate(v);
    case 'day': return relDay(v) || '—';
    case 'datetime': return fmtDateTime(v);
    case 'ref': return v?.name || v?.title || '—';
    case 'refs': return (v || []).length ? v.map((p) => <span key={p._id} className="chip info">{p.name}</span>) : '—';
    default: return v ?? '—';
  }
}

const isRef = (f) => f.type === 'ref' || f.type === 'refs';

function FilterSelect({ field, value, onChange }) {
  const { data } = useFetch(() => (isRef(field) ? resource(field.endpoint).list() : Promise.resolve([])), [field.name]);
  const options = isRef(field) ? (data || []).map((o) => ({ value: o._id, label: o[field.labelKey || 'name'] })) : field.options;
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value)} aria-label={field.label}>
      <option value="">All ({field.label.toLowerCase()})</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

/** List + filters + create/edit modal for one entity type. */
export default function EntityPage({ entityKey, fixed = {}, filters = [], title, embedded }) {
  const E = ENTITIES[entityKey];
  const res = resource(E.endpoint);
  const [f, setF] = useState({});
  const [editing, setEditing] = useState(null);
  const { data, loading, error } = useFetch(() => res.list({ ...fixed, ...f, sort: E.sort }), [JSON.stringify([fixed, f]), entityKey]);
  const defaults = Object.fromEntries(Object.entries(fixed).map(([k, v]) => [k, k === 'projects' ? [v] : v]));
  const Head = embedded ? 'h2' : 'h1';

  return (
    <div>
      <div className="top">
        <Head>{title || E.title}</Head>
        <div className="row-inline">
          {filters.map((n) => <FilterSelect key={n} field={E.fields.find((x) => x.name === n)} value={f[n]} onChange={(v) => setF((s) => ({ ...s, [n]: v }))} />)}
          <button className="btn" onClick={() => setEditing({})}>+ Add {E.label.toLowerCase()}</button>
        </div>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="pn tbl">
        <table>
          <thead><tr>{E.columns.map((c) => <th key={c.label}>{c.label}</th>)}</tr></thead>
          <tbody>
            {(data || []).map((row) => (
              <tr key={row._id} className={isOverdue(row) ? 'late' : ''} onClick={() => setEditing(row)}>
                {E.columns.map((c) => <td key={c.label}><Cell col={c} row={row} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !(data || []).length && <p className="mu empty">Nothing here yet. Use “Add {E.label.toLowerCase()}” to create the first one.</p>}
      </div>
      {editing && (
        <Modal title={editing._id ? `Edit ${E.label.toLowerCase()}` : `New ${E.label.toLowerCase()}`} onClose={() => setEditing(null)}>
          <RecordForm entityKey={entityKey} initial={editing._id ? editing : undefined} defaults={defaults} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}
