import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../services/resources.js';

const GROUPS = {
  projects: ['Projects', (r) => `/projects/${r._id}`, (r) => r.name],
  tasks: ['Tasks', () => '/tasks', (r) => r.title],
  bugs: ['Bugs', () => '/bugs', (r) => r.title],
  features: ['Features', () => '/roadmap', (r) => r.title],
  clients: ['Clients', () => '/clients', (r) => r.name],
  tenants: ['Tenants', () => '/tenants', (r) => r.name],
  deployments: ['Deployments', () => '/deployments', (r) => r.version],
  notes: ['Notes', () => '/notes', (r) => r.title],
};

export default function SearchBox() {
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const t = setTimeout(() => searchApi(q.trim()).then(setRes).catch(() => setRes(null)), 250);
    return () => clearTimeout(t);
  }, [q]);

  const groups = res ? Object.entries(GROUPS).filter(([k]) => res[k]?.length) : [];
  return (
    <div className="search">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search everything…" aria-label="Search" />
      {res && (
        <div className="menu wide-menu">
          {!groups.length && <p className="mu pad">No results for “{q}”.</p>}
          {groups.map(([k, [label, to, text]]) => (
            <div key={k}>
              <div className="grp">{label}</div>
              {res[k].map((r) => (
                <button key={r._id} onClick={() => { nav(to(r)); setQ(''); setRes(null); }}>
                  {text(r)}{r.project?.name && <span className="mu"> · {r.project.name}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
