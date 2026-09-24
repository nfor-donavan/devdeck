import { useCallback, useEffect, useState } from 'react';

// Loads data, exposes reload(), and reloads whenever something calls refreshAll().
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    return fn()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => setState({ data: null, loading: false, error: e.message }));
  }, deps);
  useEffect(() => {
    run();
    window.addEventListener('dd-refresh', run);
    return () => window.removeEventListener('dd-refresh', run);
  }, [run]);
  return { ...state, reload: run };
}
