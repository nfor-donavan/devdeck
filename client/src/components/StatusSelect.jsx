import { resource } from '../services/resources.js';
import { refreshAll } from '../api/client.js';
import { STATUS_LABEL } from '../utils/constants.js';
import { tone } from './Chip.jsx';

// Change a task's status inline.
export default function StatusSelect({ task }) {
  const change = async (e) => {
    await resource('tasks').update(task._id, { status: e.target.value });
    refreshAll();
  };
  return (
    <select className={'chip sel ' + tone(task.status)} value={task.status} onChange={change} onClick={(e) => e.stopPropagation()} aria-label="Task status">
      {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
