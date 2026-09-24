import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import SearchBox from '../components/SearchBox.jsx';
import QuickAdd from '../components/QuickAdd.jsx';
import NotificationBell from '../components/NotificationBell.jsx';

const NAV = [
  ['/', 'Dashboard'], ['/projects', 'Projects'], ['/tasks', 'Tasks'], ['/calendar', 'Calendar'], ['/week', 'Week planner'],
  ['/clients', 'Clients'], ['/tenants', 'Tenants'], ['/bugs', 'Bugs'], ['/roadmap', 'Roadmap'], ['/deployments', 'Deployments'],
  ['/maintenance', 'Maintenance'], ['/analytics', 'Analytics'], ['/notes', 'Notes'], ['/settings', 'Settings'],
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="app">
      <nav className={open ? 'open' : ''}>
        <b>DevDeck</b>
        {NAV.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}>{label}</NavLink>
        ))}
      </nav>
      <div className="shell">
        <header className="bar-top">
          <button className="burger x" onClick={() => setOpen((o) => !o)} aria-label="Menu">☰</button>
          <SearchBox />
          <span className="grow" />
          <QuickAdd />
          <NotificationBell />
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  );
}
