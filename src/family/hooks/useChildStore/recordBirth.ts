import { useCallback } from 'react';
import type { Gender } from '~app/family/domain/familyRecords';

import { logChildProfileAction } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

export function useRecordBirth({
  user,
  firebaseChildren,
  pregnancyChild,
}: ChildActionContext) {
  return useCallback(
    async (birthday: string, gender?: Gender) => {
      if (!user || !pregnancyChild) {
        return;
      }

      try {
        await firebaseChildren.recordBirth(pregnancyChild.id, birthday, gender);
        logChildProfileAction('update');
      } catch (error) {
        console.error('登記出生失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, pregnancyChild],
  );
}
