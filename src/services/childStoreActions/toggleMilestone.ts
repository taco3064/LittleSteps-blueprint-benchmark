import { logMilestoneToggle } from '../firebase';
import type { ActionContext } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function toggleMilestoneAction({
  user,
  currentChild,
  currentChildMilestoneProgress,
  firebaseChildren,
  toast,
}: ActionContext) {
  const toggleMilestone = async (id: string) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      const isAchieved = !currentChildMilestoneProgress[id]?.achieved;

      await firebaseChildren.updateMilestoneProgress(
        currentChild.id,
        id,
        isAchieved,
      );

      logMilestoneToggle(isAchieved);
    } catch (error) {
      console.error('更新里程碑失敗:', error);
      toast.show(errorMessage(error, '里程碑更新失敗，請稍後再試'));
    }
  };

  return toggleMilestone;
}
