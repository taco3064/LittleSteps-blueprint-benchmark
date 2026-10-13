import type { ActionContext } from './types';

export function revokeOtherMembersAction({ user, firebaseChildren }: ActionContext) {
  const revokeOtherMembers = async (childId: string) => {
    if (!user) {
      return;
    }

    try {
      await firebaseChildren.revokeOtherMembers(childId);
    } catch (error) {
      console.error('收回共享失敗:', error);

      throw error;
    }
  };

  return revokeOtherMembers;
}
