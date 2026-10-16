import { createContext, type ReactNode } from 'react';
import type { ChildStore } from '~app/family/domain/childStore';
export const ChildStoreContext = createContext<ChildStore | null>(null);

export function ChildStoreContextProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ChildStore;
}) {
  return (
    <ChildStoreContext.Provider value={value}>{children}</ChildStoreContext.Provider>
  );
}
