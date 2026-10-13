import type { ActionContext } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function toggleToothAction({
  user,
  currentChild,
  currentChildToothProgress,
  firebaseChildren,
  toast,
}: ActionContext) {
  const toggleTooth = async (toothId: string) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      const erupted = !currentChildToothProgress[toothId]?.erupted;

      await firebaseChildren.updateToothProgress({
        childId: currentChild.id,
        toothId,
        erupted,
      });
    } catch (error) {
      console.error('更新乳牙記錄失敗:', error);
      toast.show(errorMessage(error, '乳牙記錄更新失敗，請稍後再試'));
    }
  };

  return toggleTooth;
}
