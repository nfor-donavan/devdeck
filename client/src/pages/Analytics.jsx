import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { analyticsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';

const BLUE = '#4f7bff';
const AMBER = '#f0a030';
const GRID = '#8884';

function Chart({ title, note, data, children, empty }) {
  return (
    <div className="pn">
      <h2>{title}</h2>
      {note && <p className="mu small">{note}</p>}
      {!data.length ? <p className="mu">{empty}</p> : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data}>
            <CartesianGrid stroke={GRID} vertical={false} />
            {children}
            <Tooltip />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

// Workload overview, not a productivity score: it exists to show how much is on your plate.
export default function Analytics() {
  const [days, setDays] = useState(30);
  const { data: d, error } = useFetch(() => analyticsApi(days), [days]);
  if (error) return <p className="err">{error}</p>;
  if (!d) return <p className="mu">Loading…</p>;
  return (
    <>
      <div className="top">
        <h1>Analytics</h1>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Period">
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      </div>
      <div className="stats three">
        <div className="st"><b>{d.completedTotal}</b>Tasks completed</div>
        <div className="st"><b>{d.overdueNow}</b>Overdue now</div>
        <div className="st"><b>{d.workload.reduce((a, w) => a + w.hours, 0)}h</b>Scheduled, next 14 days</div>
      </div>
      <div className="cols2">
        <Chart title="Tasks completed" data={d.completedByDay} empty="No completed tasks in this period.">
          <XAxis dataKey="date" tickFormatter={(s) => s.slice(5)} minTickGap={24} /><YAxis allowDecimals={false} width={30} />
          <Bar dataKey="count" name="Completed" fill={BLUE} radius={[3, 3, 0, 0]} />
        </Chart>
        <Chart title="Estimated vs actual hours" note="Completed tasks that have both numbers." data={d.estimatedVsActual} empty="Complete tasks with estimates to see this.">
          <XAxis dataKey="project" /><YAxis width={30} /><Legend />
          <Bar dataKey="estimated" name="Estimated" fill={BLUE} radius={[3, 3, 0, 0]} />
          <Bar dataKey="actual" name="Actual" fill={AMBER} radius={[3, 3, 0, 0]} />
        </Chart>
        <Chart title="Project workload" note="Hours scheduled over the next 14 days." data={d.workload} empty="Nothing scheduled.">
          <XAxis dataKey="project" /><YAxis width={30} />
          <Bar dataKey="hours" name="Hours" fill={BLUE} radius={[3, 3, 0, 0]} />
        </Chart>
        <Chart title="Maintenance frequency" note="Maintenance sessions completed in the last 90 days." data={d.maintenanceFrequency} empty="No completed maintenance yet.">
          <XAxis dataKey="project" /><YAxis allowDecimals={false} width={30} />
          <Bar dataKey="count" name="Sessions" fill={AMBER} radius={[3, 3, 0, 0]} />
        </Chart>
      </div>
    </>
  );
}
