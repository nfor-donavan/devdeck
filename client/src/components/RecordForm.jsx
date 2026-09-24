import { useEffect, useState } from 'react';
import { ENTITIES } from '../entities.js';
import { resource } from '../services/resources.js';
import { refreshAll } from '../api/client.js';

const getPath = (o, p) => p.split('.').reduce((a, k) => a?.[k], o);
const setPath = (o, p, v) => {
  const ks = p.split('.');
  ks.slice(0, -1).reduce((a, k) => (a[k] ??= {}), o)[ks[ks.length - 1]] = v;
};
const pad = (n) => String(n).padStart(2, '0');
const localInput = (v) => {
  const d = new Date(v);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function toInput(f, v) {
  switch (f.type) {
    case 'date': return v ? String(v).slice(0, 10) : '';
    case 'datetime': return v ? localInput(v) : '';
    case 'tags': return (v || []).join(', ');
    case 'lines': return (v || []).join('\n');
    case 'links': return (v || []).map((a) => `${a.name || ''} | ${a.url || ''}`).join('\n');
    case 'ref': return v?._id || v || '';
    case 'refs': return (v || []).map((x) => x._id || x);
    case 'checkbox': return v === undefined || v === null ? !!f.default : !!v;
    case 'number': return v ?? f.default ?? '';
    default: return v ?? f.default ?? '';
  }
}

const lines = (v) => v.split('\n').map((s) => s.trim()).filter(Boolean);
function fromInput(f, v) {
  switch (f.type) {
    case 'tags': return v.split(',').map((s) => s.trim()).filter(Boolean);
    case 'lines': return lines(v);
    case 'links': return lines(v).map((l) => {
      const [name, ...rest] = l.split('|');
      return rest.length ? { name: name.trim(), url: rest.join('|').trim() } : { name: l, url: l };
    });
    case 'number': return v === '' ? null : Number(v);
    case 'datetime': return v ? new Date(v).toISOString() : null;
    default: return v;
  }
}

/** Create or edit any record described in entities.js. */
export default function RecordForm({ entityKey, initial, defaults = {}, onClose, onSaved }) {
  const E = ENTITIES[entityKey];
  const res = resource(E.endpoint);
  const src = { ...defaults, ...(initial || {}) };
  const [vals, setVals] = useState(() => Object.fromEntries(E.fields.map((f) => [f.name, toInput(f, getPath(src, f.name))])));
  const [refs, setRefs] = useState({});
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    E.fields.filter((f) => f.type === 'ref' || f.type === 'refs').forEach((f) =>
      resource(f.endpoint).list().then((l) => setRefs((r) => ({ ...r, [f.name]: l }))).catch(() => {}));
  }, [entityKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const body = {};
      E.fields.forEach((f) => setPath(body, f.name, fromInput(f, vals[f.name])));
      const saved = initial?._id ? await res.update(initial._id, body) : await res.create(body);
      refreshAll();
      onSaved?.(saved);
      onClose?.();
    } catch (x) {
      setErr(x.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete this ${E.label.toLowerCase()}? This cannot be undone.`)) return;
    try { await res.remove(initial._id); refreshAll(); onClose?.(); } catch (x) { setErr(x.message); }
  };

  const control = (f) => {
    const v = vals[f.name];
    const set = (x) => setVals((s) => ({ ...s, [f.name]: x }));
    const common = { id: 'f-' + f.name, value: v, onChange: (e) => set(e.target.value), required: f.required };
    switch (f.type) {
      case 'textarea': case 'lines': case 'links':
        return <textarea {...common} rows={f.rows || 3} />;
      case 'select':
        return (
          <select {...common}>
            {(f.optional || !f.default) && <option value="">{f.required ? 'Select…' : 'None'}</option>}
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        );
      case 'ref':
        return (
          <select {...common}>
            <option value="">{f.required ? 'Select…' : 'None'}</option>
            {(refs[f.name] || []).map((o) => <option key={o._id} value={o._id}>{o[f.labelKey || 'name']}</option>)}
          </select>
        );
      case 'refs':
        return (
          <select id={'f-' + f.name} multiple size={4} value={v} onChange={(e) => set(Array.from(e.target.selectedOptions, (o) => o.value))}>
            {(refs[f.name] || []).map((o) => <option key={o._id} value={o._id}>{o[f.labelKey || 'name']}</option>)}
          </select>
        );
      case 'checkbox':
        return <input id={'f-' + f.name} type="checkbox" checked={v} onChange={(e) => set(e.target.checked)} />;
      default:
        return <input {...common} type={{ date: 'date', time: 'time', number: 'number', color: 'color', datetime: 'datetime-local' }[f.type] || 'text'} />;
    }
  };

  return (
    <form onSubmit={submit} className="form">
      {E.fields.map((f) => (
        <label key={f.name} className={'fld' + (['textarea', 'lines', 'links'].includes(f.type) ? ' wide' : '')} htmlFor={'f-' + f.name}>
          <span>{f.label}{f.required && ' *'}</span>
          {control(f)}
        </label>
      ))}
      {err && <p className="err wide">{err}</p>}
      <div className="actions wide">
        {initial?._id && <button type="button" className="btn danger" onClick={remove}>Delete</button>}
        <span className="grow" />
        <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" disabled={busy}>{busy ? 'Saving…' : initial?._id ? 'Save changes' : 'Create'}</button>
      </div>
    </form>
  );
}
