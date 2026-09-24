import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('dd-theme') || 'system');
  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'system' ? '' : theme;
    localStorage.setItem('dd-theme', theme);
  }, [theme]);
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}
