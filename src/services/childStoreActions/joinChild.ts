import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from '~app/domain/childLimits';
import { logChildProfileAction } from '../firebase';
import type { ActionContext } from './types';

export function joinChildAction({
  user,
  childCount,
  firebaseChildren,
  toast,
}: ActionContext) {
  const joinChild = async (childUuid: string) => {
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
  };

  return joinChild;
}
