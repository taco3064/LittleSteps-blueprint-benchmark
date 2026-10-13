import { useEffect, useState } from 'react';

export function useLoadStalled(dataPending: boolean) {
  const [loadStalled, setLoadStalled] = useState(false);

  useEffect(() => {
    if (!dataPending) {
      setLoadStalled(false);

      return;
    }

    if (navigator.onLine === false) {
      setLoadStalled(true);

      return;
    }

    const timer = window.setTimeout(() => setLoadStalled(true), 10000);

    return () => window.clearTimeout(timer);
  }, [dataPending]);

  return loadStalled;
}
