import { createContext, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../api/client.js';
import { authApi } from '../services/auth.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const out = () => setUser(null);
    window.addEventListener('dd-logout', out);
    if (getToken()) authApi.me().then(setUser).catch(() => setToken(null)).finally(() => setReady(true));
    else setReady(true);
    return () => window.removeEventListener('dd-logout', out);
  }, []);

  // Runs a login/register call and stores the session.
  const signIn = async (call) => {
    const { token, user: u } = await call();
    setToken(token);
    setUser(u);
  };
  // Tokens are stateless JWTs: logging out forgets the token on this device.
  const logout = () => { setToken(null); setUser(null); };

  return <Ctx.Provider value={{ user, setUser, ready, signIn, logout }}>{children}</Ctx.Provider>;
}
