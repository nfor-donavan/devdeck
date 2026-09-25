import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';
import Icon from '../components/Icon.jsx';
import SearchBox from '../components/SearchBox.jsx';
import QuickAdd from '../components/QuickAdd.jsx';
import NotificationBell from '../components/NotificationBell.jsx';

const GROUPS = [
  ['Workspace', [['/', 'Dashboard', 'dashboard'], ['/projects', 'Projects', 'projects'], ['/tasks', 'Tasks', 'tasks'], ['/calendar', 'Calendar', 'calendar'], ['/week', 'Week planner', 'week']]],
  ['Operations', [['/clients', 'Clients', 'clients'], ['/tenants', 'Tenants', 'tenants'], ['/deployments', 'Deployments', 'deployments'], ['/maintenance', 'Maintenance', 'maintenance'], ['/bugs', 'Bugs', 'bugs'], ['/roadmap', 'Roadmap', 'roadmap']]],
  ['Insights', [['/analytics', 'Analytics', 'analytics'], ['/notes', 'Notes', 'notes']]],
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const initials = (user?.name || user?.email || '?').trim().slice(0, 2).toUpperCase();
  const close = () => setOpen(false);

  return (
    <div className="app">
      {open && <div className="scrim" onClick={close} />}
      <nav className={open ? 'open' : ''} aria-label="Main">
        <div className="brand"><Logo size={38} light tagline="Engineering Operations" /></div>
        <div className="nav-scroll">
          {GROUPS.map(([label, items]) => (
            <div key={label}>
              <div className="nav-label">{label}</div>
              {items.map(([to, text, icon]) => (
                <NavLink key={to} to={to} end={to === '/'} onClick={close}><Icon name={icon} />{text}</NavLink>
              ))}
            </div>
          ))}
        </div>
        <div className="nav-foot">
          <NavLink to="/settings" onClick={close}><Icon name="settings" />Settings</NavLink>
          <div className="user">
            <span className="avatar">{initials}</span>
            <span className="who"><strong>{user?.name || 'Account'}</strong><small>{user?.email}</small></span>
            <button className="x" onClick={logout} aria-label="Sign out" title="Sign out"><Icon name="logout" size={17} /></button>
          </div>
        </div>
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
