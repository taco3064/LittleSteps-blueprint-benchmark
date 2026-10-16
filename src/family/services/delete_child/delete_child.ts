import { ref, update, get } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { ChildProfile } from '~app/family/domain/familyRecords';

import { fullChildDeletePaths } from '../record_helpers';

export function createDeleteChild(userId: string | null) {
  return async (childId: string, remainingChildIds: string[] = []) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 讀不到本體有兩種可能：已經被建立者刪掉，或自己的成員資格被收回了。兩種
    // 都還是要清掉自己這一端的名單，否則被收回的家長會永遠卡著一個讀不到、
    // 又刪不掉的項目。
    const childSnapshot = await get(ref(database, `children/${childId}`)).catch(
      () => null,
    );

    const childData = childSnapshot?.exists()
      ? (childSnapshot.val() as ChildProfile)
      : null;

    // 名單上除了我還有誰。整份刪除的條件是「我是建立者」或「我是最後一位成員」。
    const others = Object.keys(childData?.members ?? {}).filter(
      (uid) => uid !== userId,
    );

    const updates: Record<string, unknown> = {
      [`users/${userId}/childrenIds/${childId}`]: null,
      [`users/${userId}/currentChildId`]:
        remainingChildIds.find((id) => id !== childId) ?? null,
    };

    if (childData && (childData.createdBy === userId || others.length === 0)) {
      Object.assign(updates, fullChildDeletePaths(childId));
    } else if (childData) {
      updates[`children/${childId}/members/${userId}`] = null;
    }

    await update(ref(database), updates);
  };
}
