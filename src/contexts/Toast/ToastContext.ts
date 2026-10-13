import { createContext } from 'react';
export type ToastTone = 'error' | 'success';

export interface ToastApi {
  /** 預設 error：呼叫點絕大多數是失敗訊息，成功才需要明講。 */
  show: (message: string, tone?: ToastTone) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
