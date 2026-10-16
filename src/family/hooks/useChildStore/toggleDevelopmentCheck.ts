import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useToggleDevelopmentCheck({
  user,
  toast,
  firebaseChildren,
  currentChild,
  currentChildDevelopmentProgress,
}: ChildActionContext) {
  return useCallback(
    async (checkItemId: string) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        const achieved = !currentChildDevelopmentProgress[checkItemId]?.achieved;

        await firebaseChildren.updateDevelopmentProgress(
          currentChild.id,
          checkItemId,
          achieved,
        );
      } catch (error) {
        console.error('更新發展檢核失敗:', error);
        toast.show(errorMessage(error, '發展檢核更新失敗，請稍後再試'));
      }
    },
    [user, toast, firebaseChildren, currentChild, currentChildDevelopmentProgress],
  );
}
