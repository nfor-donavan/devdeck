import { useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../services/resources.js';
import { refreshAll } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import { fmtDateTime } from '../utils/dates.js';

const TYPES = ['Task', 'Maintenance', 'Deployment', 'Client', 'Deadline', 'System'];

export default function Notifications() {
  const [type, setType] = useState('');
  const { data, loading, error } = useFetch(() => notificationsApi.list({ type }), [type]);
  const act = (fn) => async () => { await fn(); refreshAll(); };
  return (
    <>
      <div className="top">
        <h1>Notifications</h1>
        <div className="row-inline">
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <button className="btn ghost" onClick={act(notificationsApi.readAll)}>Mark all as read</button>
        </div>
      </div>
      {error && <p className="err">{error}</p>}
      <div className="pn">
        {!loading && !(data || []).length && <p className="mu">You’re all caught up.</p>}
        {(data || []).map((n) => (
          <div key={n._id} className={'row notif' + (n.read ? '' : ' unread')}>
            <div>
              <strong>{n.link ? <Link to={n.link}>{n.title}</Link> : n.title}</strong>
              {n.body && <div className="mu small">{n.body}</div>}
              <div className="mu small">{n.type} · {fmtDateTime(n.createdAt)}</div>
            </div>
            <div className="row-inline nowrap">
              <button className="btn ghost" onClick={act(() => notificationsApi.read(n._id, !n.read))}>{n.read ? 'Mark unread' : 'Mark read'}</button>
              <button className="x" onClick={act(() => notificationsApi.remove(n._id))} aria-label="Delete notification">✕</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
