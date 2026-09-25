import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/auth.js';
import Logo from '../components/Logo.jsx';
import Icon from '../components/Icon.jsx';

const POINTS = [
  ['dashboard', 'One dashboard', 'Every project, task and deadline you own, in a single view.'],
  ['shield', 'Built for reliability', 'Recurring maintenance and deployments are tracked automatically, nothing slips through.'],
  ['analytics', 'Clear insight', 'Workload and delivery trends across all your platforms, at a glance.'],
];

function AuthShell({ eyebrow, title, sub, children, foot }) {
  return (
    <div className="auth">
      <div className="auth-side">
        <Logo size={40} light tagline="Engineering Operations Platform" />
        <div className="auth-points">
          {POINTS.map(([icon, h, t]) => (
            <div key={h} className="auth-point">
              <span className="auth-ic"><Icon name={icon} size={19} /></span>
              <div><strong>{h}</strong><p>{t}</p></div>
            </div>
          ))}
        </div>
        <p className="auth-side-foot">Trusted internal tooling for CivicSlot, SecurRoute, Fleet SaaS and AgroNjangi.</p>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-card-logo"><Logo size={34} /></div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {sub && <p className="mu">{sub}</p>}
          {children}
          {foot}
        </div>
        <p className="auth-legal">© {new Date().getFullYear()} DevDeck. Internal platform — not for public distribution.</p>
      </div>
    </div>
  );
}

export function Login() {
  const { user, signIn } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await signIn(() => (mode === 'login' ? authApi.login(f) : authApi.register(f)));
      nav('/');
    } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell
      eyebrow={mode === 'login' ? 'Sign in' : 'First-time setup'}
      title={mode === 'login' ? 'Welcome back' : 'Create the administrator account'}
      sub={mode === 'login' ? 'Sign in to access your command center.' : 'This is a one-time setup for the platform owner.'}
      foot={
        <p className="small auth-links">
          <Link to="/forgot-password">Forgot password?</Link>
          <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'First time here? Create the account' : 'Back to sign in'}
          </button>
        </p>
      }
    >
      <form onSubmit={submit} className="stack">
        {mode === 'register' && <label className="fld"><span>Full name</span><input value={f.name} onChange={set('name')} autoComplete="name" placeholder="Donovan" /></label>}
        <label className="fld"><span>Email address</span><input type="email" required value={f.email} onChange={set('email')} autoComplete="email" placeholder="you@company.com" /></label>
        <label className="fld"><span>Password</span><input type="password" required minLength={8} value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="••••••••" /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn big full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}

export function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { setMsg(await authApi.forgot(email)); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell eyebrow="Password reset" title="Reset your password" sub="We'll send a secure link to your email." foot={<p className="small auth-links"><Link to="/login">Back to sign in</Link></p>}>
      <form onSubmit={submit} className="stack">
        <label className="fld"><span>Email address</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn big full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      {msg && <p className="notice">{msg.message}{msg.devLink && <><br /><span className="small">Dev mode (no email server configured): <a href={msg.devLink}>open the reset link</a></span></>}</p>}
    </AuthShell>
  );
}

export function Reset() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { setMsg((await authApi.reset({ token: params.get('token'), password })).message); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  };
  return (
    <AuthShell eyebrow="Password reset" title="Choose a new password" sub="Use at least 8 characters.">
      <form onSubmit={submit} className="stack">
        <label className="fld"><span>New password</span><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="••••••••" /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn big full" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
      </form>
      {msg && <p className="notice">{msg} <Link to="/login">Sign in</Link></p>}
    </AuthShell>
  );
}
