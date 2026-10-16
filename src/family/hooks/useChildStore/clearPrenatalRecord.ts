import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

export function useClearPrenatalRecord({
  user,
  firebaseChildren,
  pregnancyChild,
}: ChildActionContext) {
  return useCallback(
    async (templateId: string) => {
      if (!user || !pregnancyChild) {
        return;
      }

      try {
        await firebaseChildren.clearPrenatalRecord(pregnancyChild.id, templateId);
      } catch (error) {
        console.error('取消產檢記錄失敗:', error);

        throw error;
      }
    },
    [user, firebaseChildren, pregnancyChild],
  );
}
