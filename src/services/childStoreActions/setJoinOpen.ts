import type { ActionContext } from './types';

export function setJoinOpenAction({ user, firebaseChildren }: ActionContext) {
  const setJoinOpen = async (childId: string, open: boolean) => {
    if (!user) {
      return;
    }

    try {
      await firebaseChildren.setJoinOpen(childId, open);
    } catch (error) {
      console.error('更新共享開關失敗:', error);

      throw error;
    }
  };

  return setJoinOpen;
}
