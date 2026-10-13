import { useContext } from 'react';
import { ToastContext, type ToastApi } from '~app/contexts/Toast';

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
