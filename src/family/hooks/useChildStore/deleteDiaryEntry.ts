import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useDeleteDiaryEntry({
  user,
  firebaseChildren,
  currentChild,
}: ChildActionContext) {
  return useCallback(
    async (entryId: string) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        await firebaseChildren.deleteDiaryEntry(currentChild.id, entryId);
      } catch (error) {
        console.error('刪除日記失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, currentChild],
  );
}
