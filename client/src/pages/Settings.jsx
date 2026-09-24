import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { authApi } from '../services/auth.js';

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [hoursPerDay, setHoursPerDay] = useState(user?.settings?.workdayHours || 6);
  const [pw, setPw] = useState({ current: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const wrap = (fn) => async (e) => {
    e.preventDefault();
    setMsg(''); setErr('');
    try { await fn(); } catch (x) { setErr(x.message); }
  };
  const saveProfile = wrap(async () => {
    setUser(await authApi.saveSettings({ name, workdayHours: hoursPerDay, theme }));
    setMsg('Saved');
  });
  const changePw = wrap(async () => {
    setMsg((await authApi.changePassword(pw)).message);
    setPw({ current: '', password: '' });
  });

  return (
    <>
      <div className="top"><h1>Settings</h1></div>
      <div className="cols2">
        <form className="pn stack" onSubmit={saveProfile}>
          <h2>Profile</h2>
          <p className="mu small">{user?.email}</p>
          <label className="fld"><span>Name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label className="fld"><span>Working hours per day (used by “Plan my day”)</span><input type="number" min="1" max="16" step="0.5" value={hoursPerDay} onChange={(e) => setHoursPerDay(e.target.value)} /></label>
          <div className="fld"><span>Theme</span>
            <div className="tabs">{['system', 'light', 'dark'].map((t) => <button type="button" key={t} className={t === theme ? 'on' : ''} onClick={() => setTheme(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
          </div>
          <button className="btn">Save</button>
        </form>
        <form className="pn stack" onSubmit={changePw}>
          <h2>Password</h2>
          <label className="fld"><span>Current password</span><input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} autoComplete="current-password" /></label>
          <label className="fld"><span>New password (8+ characters)</span><input type="password" required minLength={8} value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} autoComplete="new-password" /></label>
          <button className="btn">Change password</button>
          <hr />
          <button type="button" className="btn ghost" onClick={logout}>Sign out</button>
        </form>
      </div>
      {msg && <p className="ok-t">{msg}</p>}
      {err && <p className="err">{err}</p>}
    </>
  );
}
