import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from '~app/domain/childLimits';
import type { GestationalAge } from '~app/domain/correctedAge';
import type { Gender } from '~app/domain/records';
import { logChildProfileAction } from '../firebase';
import type { ActionContext } from './types';

export function addChildAction({
  user,
  childCount,
  firebaseChildren,
  toast,
}: ActionContext) {
  const addChild = async ({
    name,
    birthday,
    gender,
    dueDate,
    gestationalAge,
  }: {
    name: string;
    birthday: string;
    gender?: Gender;
    dueDate?: string;
    gestationalAge?: GestationalAge;
  }) => {
    if (!user) {
      return;
    }

    // 上限比的是 childCount（帳號名下所有 id），不是 childProfiles.length。
    // 後者濾掉了 listener 還沒回報的孩子，第三個檔案就是這樣溜進來的。
    if (childCount >= MAX_CHILDREN) {
      toast.show(CHILD_LIMIT_MESSAGE);

      return;
    }

    try {
      await firebaseChildren.addChild({
        name: name,
        birthday: birthday,
        currentChildCount: childCount,
        gender: gender,
        dueDate: dueDate,
        gestationalAge: gestationalAge,
      });

      logChildProfileAction('create');
    } catch (error) {
      console.error('新增寶寶失敗:', error);

      throw error;
    }
  };

  return addChild;
}
