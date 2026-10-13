import type { ReactNode } from 'react';
import { ChildStoreContext } from '~app/contexts/ChildStore';
import { useAuth } from '~app/hooks/useAuth';
import { useChildStore } from '~app/hooks/useChildStore';

export function ChildStoreProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const store = useChildStore(user);

  return (
    <ChildStoreContext.Provider value={store}>{children}</ChildStoreContext.Provider>
  );
}
