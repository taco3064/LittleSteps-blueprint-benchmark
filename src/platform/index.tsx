import type { ReactNode } from 'react';
import { AuthContextProvider } from '~app/platform/contexts/AuthContext';
import { ToastContextProvider } from '~app/platform/contexts/ToastContext';
import { useAuthSession } from '~app/platform/hooks/useAuthSession';
import { useToastState } from '~app/platform/hooks/useToastState';
import { ToastViewport } from '~app/platform/components/ToastViewport';

export function AuthProvider({
  children,
  onLeave,
}: {
  children: ReactNode;
  onLeave: () => void;
}) {
  const value = useAuthSession(onLeave);

  return <AuthContextProvider value={value}>{children}</AuthContextProvider>;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { api, toasts, dismiss } = useToastState();

  return (
    <ToastContextProvider value={api}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContextProvider>
  );
}
