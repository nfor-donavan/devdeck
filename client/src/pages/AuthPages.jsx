import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/auth.js';

function Shell({ title, children }) {
  return (
    <div className="auth">
      <div className="pn">
        <h1>DevDeck</h1>
        <p className="mu">{title}</p>
        {children}
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
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await signIn(() => (mode === 'login' ? authApi.login(f) : authApi.register(f)));
      nav('/');
    } catch (x) { setErr(x.message); }
  };
  return (
    <Shell title={mode === 'login' ? 'Sign in to your command center' : 'Create your account (first run only)'}>
      <form onSubmit={submit} className="stack">
        {mode === 'register' && <label className="fld"><span>Name</span><input value={f.name} onChange={set('name')} autoComplete="name" /></label>}
        <label className="fld"><span>Email</span><input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
        <label className="fld"><span>Password</span><input type="password" required minLength={8} value={f.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn">{mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <p className="small">
        <Link to="/forgot-password">Forgot password?</Link>{' · '}
        <button className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'First time here? Create the account' : 'Back to sign in'}
        </button>
      </p>
    </Shell>
  );
}

export function Forgot() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try { setMsg(await authApi.forgot(email)); } catch (x) { setErr(x.message); }
  };
  return (
    <Shell title="Reset your password">
      <form onSubmit={submit} className="stack">
        <label className="fld"><span>Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn">Send reset link</button>
      </form>
      {msg && <p>{msg.message}{msg.devLink && <><br /><span className="small">Dev mode (no email server): <a href={msg.devLink}>open the reset link</a></span></>}</p>}
      <p className="small"><Link to="/login">Back to sign in</Link></p>
    </Shell>
  );
}

export function Reset() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try { setMsg((await authApi.reset({ token: params.get('token'), password })).message); } catch (x) { setErr(x.message); }
  };
  return (
    <Shell title="Choose a new password">
      <form onSubmit={submit} className="stack">
        <label className="fld"><span>New password (8+ characters)</span><input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></label>
        {err && <p className="err">{err}</p>}
        <button className="btn">Update password</button>
      </form>
      {msg && <p>{msg} <Link to="/login">Sign in</Link></p>}
    </Shell>
  );
}
