import { ref, set } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

import { removeUndefined } from '~app/platform/domain/firebaseData';

export function createUpsertPrenatalRecord(userId: string | null) {
  return async (
    childId: string,
    templateId: string,
    record: { completedDate: string; clinicName?: string; notes?: string },
  ) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const recordRef = ref(
      database,
      `children/${childId}/prenatalProgress/${templateId}`,
    );

    await set(recordRef, removeUndefined(record));
  };
}
