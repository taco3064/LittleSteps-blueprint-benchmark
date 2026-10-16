import { useCallback } from 'react';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useToggleTooth({
  user,
  toast,
  firebaseChildren,
  currentChild,
  currentChildToothProgress,
}: ChildActionContext) {
  return useCallback(
    async (toothId: string) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        const erupted = !currentChildToothProgress[toothId]?.erupted;

        await firebaseChildren.updateToothProgress({
          childId: currentChild.id,
          toothId: toothId,
          erupted: erupted,
        });
      } catch (error) {
        console.error('更新乳牙記錄失敗:', error);
        toast.show(errorMessage(error, '乳牙記錄更新失敗，請稍後再試'));
      }
    },
    [user, toast, firebaseChildren, currentChild, currentChildToothProgress],
  );
}
