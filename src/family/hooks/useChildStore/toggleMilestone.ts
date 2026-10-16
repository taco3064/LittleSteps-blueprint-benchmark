import { useCallback } from 'react';
import { logMilestoneToggle } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useToggleMilestone({
  user,
  toast,
  firebaseChildren,
  currentChild,
  currentChildMilestoneProgress,
}: ChildActionContext) {
  return useCallback(
    async (id: string) => {
      if (!user || !currentChild) {
        return;
      }

      try {
        const isAchieved = !currentChildMilestoneProgress[id]?.achieved;

        await firebaseChildren.updateMilestoneProgress(currentChild.id, id, isAchieved);
        logMilestoneToggle(isAchieved);
      } catch (error) {
        console.error('更新里程碑失敗:', error);
        toast.show(errorMessage(error, '里程碑更新失敗，請稍後再試'));
      }
    },
    [user, toast, firebaseChildren, currentChild, currentChildMilestoneProgress],
  );
}
