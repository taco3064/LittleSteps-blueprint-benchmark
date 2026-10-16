import { useState, useCallback, useMemo } from 'react';
import type { Toast, ToastTone } from '~app/platform/domain/toast';
const AUTO_DISMISS_MS = 4500;

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: ToastTone = 'error') => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, message, tone }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  const api = useMemo(() => ({ show }), [show]);

  return {
    toasts,
    api,
    dismiss: (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)),
  };
}
