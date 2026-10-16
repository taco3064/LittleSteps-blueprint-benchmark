import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useUpsertPrenatalRecord({
  user,
  firebaseChildren,
  pregnancyChild,
}: ChildActionContext) {
  return useCallback(
    async (
      templateId: string,
      record: { completedDate: string; clinicName?: string; notes?: string },
    ) => {
      if (!user || !pregnancyChild) {
        return;
      }

      try {
        await firebaseChildren.upsertPrenatalRecord(
          pregnancyChild.id,
          templateId,
          record,
        );
      } catch (error) {
        console.error('更新產檢記錄失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, pregnancyChild],
  );
}
