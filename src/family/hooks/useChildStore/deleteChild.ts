import { useCallback } from 'react';
import { logChildProfileAction } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useDeleteChild({
  user,
  toast,
  firebaseChildren,
  childProfiles,
}: ChildActionContext) {
  return useCallback(
    async (id: string) => {
      if (!user) {
        return;
      }

      try {
        await firebaseChildren.deleteChild(
          id,
          childProfiles.map((child) => child.id),
        );

        logChildProfileAction('delete');
      } catch (error) {
        console.error('刪除寶寶失敗:', error);
        toast.show(errorMessage(error, '刪除寶寶失敗，請稍後再試'));
      }
    },
    [user, toast, firebaseChildren, childProfiles],
  );
}
