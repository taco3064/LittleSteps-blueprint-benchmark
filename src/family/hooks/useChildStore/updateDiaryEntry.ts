import { useCallback } from 'react';
import type { DiaryEntry } from '~app/family/domain/familyRecords';

import type { ChildActionContext } from './actionContext';

export function useUpdateDiaryEntry({
  user,
  firebaseChildren,
  currentChild,
}: ChildActionContext) {
  return useCallback(
    async (entryId: string, updates: Partial<DiaryEntry>) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        await firebaseChildren.updateDiaryEntry(currentChild.id, entryId, updates);
      } catch (error) {
        console.error('更新日記失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, currentChild],
  );
}
