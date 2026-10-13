import { logChildProfileAction } from '../firebase';
import type { ActionContext } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function setCurrentChildAction({
  user,
  firebaseChildren,
  toast,
}: ActionContext) {
  const setCurrentChild = async (id: string) => {
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
  };

  return setCurrentChild;
}
