import { ref, update, remove, get } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { ChildProfile } from '~app/family/domain/familyRecords';

import { fullChildDeletePaths } from '../record_helpers';

export function createDeleteAccountData(userId: string | null) {
  return async () => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childIdsSnapshot = await get(ref(database, `users/${userId}/childrenIds`));

    const childIds = Object.keys(
      (childIdsSnapshot.val() as Record<string, true> | null) ?? {},
    );

    const children = await Promise.all(
      childIds.map(async (childId) => {
        const snapshot = await get(ref(database, `children/${childId}`)).catch(
          () => null,
        );

        return {
          childId,
          data: snapshot?.exists() ? (snapshot.val() as ChildProfile) : null,
        };
      }),
    );

    const updates: Record<string, unknown> = {
      [`users/${userId}/childrenIds`]: null,
      [`users/${userId}/currentChildId`]: null,
    };

    for (const { childId, data } of children) {
      if (!data) {
        continue;
      }

      const others = Object.keys(data.members ?? {}).filter((uid) => uid !== userId);

      if (others.length === 0) {
        Object.assign(updates, fullChildDeletePaths(childId));
      } else {
        updates[`children/${childId}/members/${userId}`] = null;
      }
    }

    await update(ref(database), updates);

    await remove(ref(database, `users/${userId}/lastFeedbackAt`)).catch((error) => {
      console.error('清掉回饋節流戳記失敗（還在節流窗口內，規則不允許刪除）:', error);
    });
  };
}
