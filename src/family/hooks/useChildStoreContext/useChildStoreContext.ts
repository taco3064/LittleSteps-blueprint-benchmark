import { useContext } from 'react';
import { ChildStoreContext } from '~app/family/contexts/ChildStoreContext';

export function useChildStoreContext() {
  const store = useContext(ChildStoreContext);

  if (!store) {
    throw new Error('useChildStoreContext 必須在 ChildStoreProvider 之內使用');
  }

  return store;
}

export function useOptionalChildStore() {
  return useContext(ChildStoreContext);
}
