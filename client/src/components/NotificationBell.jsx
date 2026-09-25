import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../services/resources.js';
import { useFetch } from '../hooks/useFetch.js';
import Icon from './Icon.jsx';

export default function NotificationBell() {
  const { data, reload } = useFetch(() => notificationsApi.list({ read: 'false' }));
  useEffect(() => { const t = setInterval(reload, 60000); return () => clearInterval(t); }, [reload]);
  const n = data?.length || 0;
  return (
    <Link to="/notifications" className="bell" aria-label={`Notifications${n ? `, ${n} unread` : ''}`}>
      <Icon name="bell" size={18} />{n > 0 && <b>{n > 9 ? '9+' : n}</b>}
    </Link>
  );
}
