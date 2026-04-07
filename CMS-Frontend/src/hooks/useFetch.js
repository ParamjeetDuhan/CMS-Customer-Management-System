import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 * @param {Function} fetchFn  – async function that returns data
 * @param {Array}    deps     – dependency array (re-fetches when changed)
 * @param {Object}   opts     – { immediate: bool }
 */
const useFetch = (fetchFn, deps = [], { immediate = true } = {}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result);
      return result;
    } catch (err) {
      if (err.name !== 'CanceledError') setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
    return () => { if (abortRef.current) abortRef.current(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  const reset = () => { setData(null); setError(null); setLoading(false); };

  return { data, loading, error, execute, reset };
};

export default useFetch;
