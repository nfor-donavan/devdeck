import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addWeeks, subWeeks, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { calendarApi, resource } from '../services/resources.js';
import { refreshAll } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import Modal from '../components/Modal.jsx';
import RecordForm from '../components/RecordForm.jsx';

const localizer = dateFnsLocalizer({ format, parse, startOfWeek: (d) => startOfWeek(d, { weekStartsOn: 1 }), getDay, locales: { 'en-US': enUS } });
const DnDCalendar = withDragAndDrop(Calendar);
const ENTITY = { task: 'tasks', maintenance: 'tasks', deadline: 'tasks', deployment: 'deployments', event: 'events' };
const LEGEND = [['task', 'Tasks'], ['maintenance', 'Maintenance'], ['deadline', 'Deadlines'], ['deployment', 'Deployments'], ['event', 'Meetings & appointments']];

// Server sends date-only items with (optional) start/end times, and timestamped items with start/end.
function toEvent(e) {
  if (e.date) {
    const start = new Date(`${e.date}T${e.startTime || '00:00'}:00`);
    let end = e.startTime ? new Date(`${e.date}T${e.endTime || e.startTime}:00`) : start;
    if (e.startTime && end <= start) end = new Date(start.getTime() + 3600_000);
    return { ...e, start, end, allDay: !e.startTime };
  }
  return { ...e, start: new Date(e.start), end: new Date(e.end) };
}

function EditRecord({ target, onClose }) {
  const key = ENTITY[target.type];
  const { data, error } = useFetch(() => resource(key).get(target.refId), [target.refId]);
  if (error) return <p className="err">{error}</p>;
  if (!data) return <p className="mu">Loading…</p>;
  return <RecordForm entityKey={key} initial={data} onClose={onClose} />;
}

export default function CalendarPage() {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());
  const [range, setRange] = useState(() => { const n = new Date(); return { start: startOfMonth(subWeeks(n, 1)), end: endOfMonth(addWeeks(n, 1)) }; });
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(null);
  const { data, error } = useFetch(() => calendarApi(range.start.toISOString(), range.end.toISOString()), [range.start.getTime(), range.end.getTime()]);

  const onRange = (r) => {
    const days = Array.isArray(r) ? r : [r.start, r.end];
    setRange({ start: startOfDay(days[0]), end: endOfDay(days[days.length - 1]) });
  };

  const reschedule = async ({ event, start, end, isAllDay }) => {
    const day = format(start, 'yyyy-MM-dd');
    try {
      if (event.type === 'task' || event.type === 'maintenance') {
        const body = { scheduledDate: day };
        if (event.startTime && !isAllDay) { body.startTime = format(start, 'HH:mm'); body.endTime = format(end, 'HH:mm'); }
        await resource('tasks').update(event.refId, body);
      } else if (event.type === 'deadline') await resource('tasks').update(event.refId, { dueDate: day });
      else if (event.type === 'deployment') await resource('deployments').update(event.refId, { deployedAt: start.toISOString() });
      else await resource('events').update(event.refId, { start: start.toISOString(), end: end.toISOString(), allDay: isAllDay });
      refreshAll();
    } catch (e) { window.alert(e.message); }
  };

  return (
    <>
      <div className="top"><h1>Calendar</h1><div className="legend">{LEGEND.map(([k, l]) => <span key={k}><i className={'sw ev-' + k} />{l}</span>)}</div></div>
      {error && <p className="err">{error}</p>}
      <div className="cal">
        <DnDCalendar
          localizer={localizer} events={(data || []).map(toEvent)} view={view} onView={setView} date={date} onNavigate={setDate}
          onRangeChange={onRange} views={['month', 'week', 'day']} popup selectable resizable={false}
          onSelectEvent={(e) => setEditing(e)} onSelectSlot={(s) => setCreating(format(s.start, 'yyyy-MM-dd'))}
          onEventDrop={reschedule} eventPropGetter={(e) => ({ className: 'ev-' + e.type })}
        />
      </div>
      {editing && <Modal title={editing.title} onClose={() => setEditing(null)}><EditRecord target={editing} onClose={() => setEditing(null)} /></Modal>}
      {creating && <Modal title="New task" onClose={() => setCreating(null)}><RecordForm entityKey="tasks" defaults={{ scheduledDate: creating }} onClose={() => setCreating(null)} /></Modal>}
    </>
  );
}
