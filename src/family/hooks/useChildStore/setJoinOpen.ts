import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useSetJoinOpen({ user, firebaseChildren }: ChildActionContext) {
  return useCallback(
    async (childId: string, open: boolean) => {
      if (!user) {
        return;
      }

      try {
        await firebaseChildren.setJoinOpen(childId, open);
      } catch (error) {
        console.error('更新共享開關失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren],
  );
}
