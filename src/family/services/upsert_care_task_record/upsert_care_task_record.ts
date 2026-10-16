import { ref, set } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { CareTaskRecord } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';

export function createUpsertCareTaskRecord(userId: string | null) {
  return async (childId: string, record: CareTaskRecord) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const taskRef = ref(
      database,
      `children/${childId}/careTaskProgress/${record.taskId}`,
    );

    await set(taskRef, removeUndefined(record));
  };
}
