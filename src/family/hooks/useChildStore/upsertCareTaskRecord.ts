import { useCallback } from 'react';
import type { CareTaskRecord } from '~app/family/domain/familyRecords';

import type { ChildActionContext } from './actionContext';

export function useUpsertCareTaskRecord({
  user,
  firebaseChildren,
  currentChild,
}: ChildActionContext) {
  return useCallback(
    async (record: CareTaskRecord) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        await firebaseChildren.upsertCareTaskRecord(currentChild.id, record);
      } catch (error) {
        console.error('更新照護記錄失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, currentChild],
  );
}
