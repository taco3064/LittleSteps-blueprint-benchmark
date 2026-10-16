import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useClearCareTaskRecord({
  user,
  firebaseChildren,
  currentChild,
}: ChildActionContext) {
  return useCallback(
    async (taskId: string) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        await firebaseChildren.clearCareTaskRecord(currentChild.id, taskId);
      } catch (error) {
        console.error('取消照護記錄失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, currentChild],
  );
}
