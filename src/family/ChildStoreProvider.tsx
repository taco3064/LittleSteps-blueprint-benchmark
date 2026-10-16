import type { ReactNode } from 'react';
import { useAuth } from '~app/platform/hooks/useAuth';
import { useChildStore } from '~app/family/hooks/useChildStore';
import { ChildStoreContextProvider } from '~app/family/contexts/ChildStoreContext';

export function ChildStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useChildStore(user);

  return (
    <ChildStoreContextProvider value={store}>{children}</ChildStoreContextProvider>
  );
}
