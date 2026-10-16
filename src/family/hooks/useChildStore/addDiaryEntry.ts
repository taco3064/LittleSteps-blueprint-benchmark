import { useCallback } from 'react';
import type { DiaryEntry } from '~app/family/domain/familyRecords';

import type { ChildActionContext } from './actionContext';

export function useAddDiaryEntry({
  user,
  firebaseChildren,
  currentChild,
}: ChildActionContext) {
  return useCallback(
    async (entry: Omit<DiaryEntry, 'id' | 'childId' | 'createdAt'>) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        return await firebaseChildren.addDiaryEntry(currentChild.id, {
          ...entry,
          childId: currentChild.id,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('新增日記失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, currentChild],
  );
}
