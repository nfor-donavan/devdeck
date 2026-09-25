import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDateTime, relDay } from '../utils/dates.js';
import { hours } from '../utils/dates.js';
import Chip from '../components/Chip.jsx';
import HealthBadge from '../components/HealthBadge.jsx';
import StatusSelect from '../components/StatusSelect.jsx';
import PlanModal from '../components/PlanModal.jsx';

const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return now;
};

export default function Dashboard() {
  const { data, loading, error } = useFetch(dashboardApi.get);
  const { user } = useAuth();
  const [planning, setPlanning] = useState(false);
  const now = useNow();
  if (loading && !data) return <p className="mu">Loading…</p>;
  if (error) return <p className="err">{error}</p>;

  const h = now.getHours();
  const name = data.name || user?.name;
  const c = data.counts;
  const todayTasks = [...data.today].sort((a, b) => (a.startTime || '99').localeCompare(b.startTime || '99'));
  const max = Math.max(1, ...data.workload.map((w) => w.minutes));

  return (
    <>
      <div className="top">
        <div>
          <h1>Good {h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'}{name ? `, ${name}` : ''}</h1>
          <div className="mu">
            {now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>
        <button className="btn big" onClick={() => setPlanning(true)}>Plan my day</button>
      </div>

      <div className="stats">
        <div className="st"><b>{c.todayTasks}</b>Tasks today</div>
        <div className="st"><b className={c.overdue ? 'bad-t' : ''}>{c.overdue}</b>Overdue</div>
        <div className="st"><b>{c.activeProjects}</b>Active projects</div>
        <div className="st"><b>{c.upcomingDeployments}</b>Upcoming deployments</div>
        <div className="st"><b>{c.maintenanceDue}</b>Maintenance due</div>
      </div>

      <div className="cols">
        <div className="pn">
          <h2>Today’s work</h2>
          {!todayTasks.length && <p className="mu">Nothing scheduled today. Try “Plan my day”.</p>}
          <div className="rail">
            {todayTasks.map((t) => (
              <div key={t._id} className={'ev' + (t.status === 'completed' ? ' done' : '')}>
                <span className="tm">{t.startTime ? `${t.startTime} – ${t.endTime || ''}` : 'Anytime'}</span>
                <strong>{t.title}</strong>
                <span className="mu">{t.project?.name}</span> <Chip>{t.type}</Chip> <Chip v={t.priority} /> <StatusSelect task={t} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="pn">
            <h2>Project health</h2>
            {data.health.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="row link-row">
                <span><HealthBadge health={p.health} reasons={p.reasons} /> {p.name}</span>
                <span className="mu small">{p.reasons[0] || ''}</span>
              </Link>
            ))}
          </div>
          <div className="pn">
            <h2>Upcoming</h2>
            {!data.upcoming.length && <p className="mu">Nothing in the next 7 days.</p>}
            {data.upcoming.map((u, i) => <div key={i} className="row"><span>{u.title}</span><span className="mu">{relDay(u.date)}</span></div>)}
          </div>
          <div className="pn">
            <h2>Scheduled workload (7 days)</h2>
            {data.workload.map((w) => (
              <div key={w.id} className="wl">
                <span>{w.name}</span>
                <div className="bar" style={{ width: `${(w.minutes / max) * 100}%`, background: w.color }} />
                <span className="mu">{hours(w.minutes)}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pn">
        <h2>Recent activity</h2>
        {!data.activity.length && <p className="mu">Your activity will appear here.</p>}
        {data.activity.map((a) => <div key={a._id} className="row"><span>{a.summary}</span><span className="mu">{fmtDateTime(a.at)}</span></div>)}
      </div>

      {planning && <PlanModal defaultHours={data.workdayHours} onClose={() => setPlanning(false)} />}
    </>
  );
}
