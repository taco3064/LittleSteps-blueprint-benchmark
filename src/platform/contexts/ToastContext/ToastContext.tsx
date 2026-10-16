import { createContext } from 'react';
import type { ToastApi } from '~app/platform/domain/toast';
export const ToastContext = createContext<ToastApi | null>(null);
export const ToastContextProvider = ToastContext.Provider;
