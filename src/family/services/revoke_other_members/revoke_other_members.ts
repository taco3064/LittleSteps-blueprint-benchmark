import { ref, update, get } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { ChildProfile } from '~app/family/domain/familyRecords';

export function createRevokeOtherMembers(userId: string | null) {
  return async (childId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childSnapshot = await get(ref(database, `children/${childId}`));

    const childData = childSnapshot.exists()
      ? (childSnapshot.val() as ChildProfile)
      : null;

    if (!childData) {
      throw new Error('找不到這個寶寶的資料，請重新整理後再試');
    }

    const updates: Record<string, unknown> = { joinOpen: false };

    for (const memberUid of Object.keys(childData.members ?? {})) {
      if (memberUid === userId || memberUid === childData.createdBy) {
        continue;
      }

      updates[`members/${memberUid}`] = null;
    }

    await update(ref(database, `children/${childId}`), updates);
  };
}
