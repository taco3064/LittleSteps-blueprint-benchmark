import { useContext } from 'react';
import { ToastContext } from '~app/platform/contexts/ToastContext';
import type { ToastApi } from '~app/platform/domain/toast';

export function useToast(): ToastApi {
  const context = useContext(ToastContext);

  return (
    context ?? {
      show: (message: string) => {
        console.warn('ToastProvider 不在上層，退回 alert：', message);
        window.alert(message);
      },
    }
  );
}
