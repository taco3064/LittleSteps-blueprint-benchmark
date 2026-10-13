import { logChildProfileAction } from '../firebase';
import type { ActionContext } from './types';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function deleteChildAction({
  user,
  childProfiles,
  firebaseChildren,
  toast,
}: ActionContext) {
  const deleteChild = async (id: string) => {
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
  };

  return deleteChild;
}
