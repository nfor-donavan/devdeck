import { useState } from 'react';
import { addDays, format, startOfWeek } from 'date-fns';
import { resource } from '../services/resources.js';
import { refreshAll } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import { dayStr, hours, todayStr } from '../utils/dates.js';
import Chip from '../components/Chip.jsx';
import Modal from '../components/Modal.jsx';
import RecordForm from '../components/RecordForm.jsx';

// Seven columns for the week. Drag a task to another day to reschedule it.
export default function WeekPlanner() {
  const [start, setStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(null);
  const days = [...Array(7)].map((_, i) => addDays(start, i));
  const from = format(days[0], 'yyyy-MM-dd');
  const to = format(days[6], 'yyyy-MM-dd');
  const { data } = useFetch(() => resource('tasks').list({ dateField: 'scheduledDate', from, to, sort: 'startTime' }), [from]);
  const tasks = data || [];

  const planned = tasks.reduce((a, t) => a + (t.estimatedMinutes || 60), 0);
  const done = tasks.filter((t) => t.status === 'completed').reduce((a, t) => a + (t.actualMinutes || t.estimatedMinutes || 60), 0);

  const drop = async (e, day) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    await resource('tasks').update(id, { scheduledDate: day });
    refreshAll();
  };

  return (
    <>
      <div className="top">
        <h1>Week planner</h1>
        <div className="row-inline">
          <button className="btn ghost" onClick={() => setStart(addDays(start, -7))}>← Previous</button>
          <button className="btn ghost" onClick={() => setStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>This week</button>
          <button className="btn ghost" onClick={() => setStart(addDays(start, 7))}>Next →</button>
        </div>
      </div>
      <div className="stats three">
        <div className="st"><b>{hours(planned)}h</b>Planned</div>
        <div className="st"><b>{hours(done)}h</b>Completed</div>
        <div className="st"><b>{hours(Math.max(0, planned - done))}h</b>Remaining</div>
      </div>
      <div className="wk">
        {days.map((d) => {
          const key = format(d, 'yyyy-MM-dd');
          const list = tasks.filter((t) => dayStr(t.scheduledDate) === key);
          return (
            <div key={key} className={key === todayStr() ? 'tdy' : ''} onDragOver={(e) => e.preventDefault()} onDrop={(e) => drop(e, key)}>
              <div className="between">
                <span><strong>{format(d, 'EEE')}</strong> <span className="mu">{format(d, 'MMM d')} · {hours(list.reduce((a, t) => a + (t.estimatedMinutes || 60), 0))}h</span></span>
                <button className="x" onClick={() => setAdding(key)} aria-label={`Add task on ${key}`}>＋</button>
              </div>
              {list.map((t) => (
                <div key={t._id} className={'wk-task' + (t.status === 'completed' ? ' done' : '')} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', t._id)} onClick={() => setEditing(t)}>
                  <span className="mu small">{t.project?.name}{t.startTime && ` · ${t.startTime}`}</span>
                  <div>{t.title}</div>
                  <Chip v={t.priority} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      {editing && <Modal title="Edit task" onClose={() => setEditing(null)}><RecordForm entityKey="tasks" initial={editing} onClose={() => setEditing(null)} /></Modal>}
      {adding && <Modal title="New task" onClose={() => setAdding(null)}><RecordForm entityKey="tasks" defaults={{ scheduledDate: adding }} onClose={() => setAdding(null)} /></Modal>}
    </>
  );
}
