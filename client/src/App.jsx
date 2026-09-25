import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import AppLayout from './layouts/AppLayout.jsx';
import { Login, Forgot, Reset } from './pages/AuthPages.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import WeekPlanner from './pages/WeekPlanner.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Analytics from './pages/Analytics.jsx';
import Notes from './pages/Notes.jsx';
import Notifications from './pages/Notifications.jsx';
import Settings from './pages/Settings.jsx';
import EntityPage from './components/EntityPage.jsx';
import Logo from './components/Logo.jsx';

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="splash"><Logo size={60} text={false} /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<Forgot />} />
      <Route path="/reset-password" element={<Reset />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="tasks" element={<EntityPage entityKey="tasks" filters={['project', 'status', 'priority', 'type']} />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="week" element={<WeekPlanner />} />
        <Route path="clients" element={<EntityPage entityKey="clients" filters={['projects']} />} />
        <Route path="tenants" element={<EntityPage entityKey="tenants" filters={['project', 'status', 'environment']} />} />
        <Route path="bugs" element={<EntityPage entityKey="bugs" filters={['project', 'severity', 'status']} />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="deployments" element={<EntityPage entityKey="deployments" filters={['project', 'environment', 'status']} />} />
        <Route path="maintenance" element={<Maintenance />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="notes" element={<Notes />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
