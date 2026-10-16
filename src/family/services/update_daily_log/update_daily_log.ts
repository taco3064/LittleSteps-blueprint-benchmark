import { ref, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { DailyLogPatch } from '~app/family/domain/familyRecords';

import { toUpdatePaths } from '~app/platform/domain/firebaseData';

export function createUpdateDailyLog(userId: string | null) {
  return async (childId: string, logId: string, patch: DailyLogPatch) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const paths = toUpdatePaths(patch);

    if (Object.keys(paths).length === 0) {
      return;
    }

    const logRef = ref(database, `childRecords/${childId}/dailyLogs/${logId}`);

    await update(logRef, {
      ...paths,
      updatedAt: new Date().toISOString(),
    });
  };
}
