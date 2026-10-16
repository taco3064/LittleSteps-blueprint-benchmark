import { useCallback } from 'react';
import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from '~app/family/domain/childLimits';

import { logChildProfileAction } from '~app/family/services/telemetry';
import type { ChildActionContext } from './actionContext';

export function useJoinChild({
  user,
  toast,
  firebaseChildren,
  childCount,
}: ChildActionContext) {
  return useCallback(
    async (childUuid: string) => {
      if (!user) {
        return;
      }

      if (childCount >= MAX_CHILDREN) {
        toast.show(CHILD_LIMIT_MESSAGE);

        return;
      }

      try {
        await firebaseChildren.joinChild(childUuid, childCount);
        logChildProfileAction('create'); // Creating a reference to an existing child.
      } catch (error) {
        console.error('加入寶寶失敗:', error);

        throw error;
      }
    },
    [user, toast, firebaseChildren, childCount],
  );
}
