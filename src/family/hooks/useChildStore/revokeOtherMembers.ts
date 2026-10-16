import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useRevokeOtherMembers({ user, firebaseChildren }: ChildActionContext) {
  return useCallback(
    async (childId: string) => {
      if (!user) {
        return;
      }

      try {
        await firebaseChildren.revokeOtherMembers(childId);
      } catch (error) {
        console.error('收回共享失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren],
  );
}
