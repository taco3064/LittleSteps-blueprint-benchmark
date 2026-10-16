import { useCallback } from 'react';
import { logChildProfileAction } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSetCurrentChild({
  user,
  toast,
  firebaseChildren,
}: ChildActionContext) {
  return useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }

      try {
        await firebaseChildren.setCurrentChild(id);
        logChildProfileAction('switch');
      } catch (error) {
        console.error('切換寶寶失敗:', error);
        toast.show(errorMessage(error, '切換寶寶失敗，請稍後再試'));
      }
    },
    [user, toast, firebaseChildren],
  );
}
