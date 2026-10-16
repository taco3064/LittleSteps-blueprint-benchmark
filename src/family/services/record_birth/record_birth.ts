import { ref, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { Gender } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';

export function createRecordBirth(userId: string | null) {
  return async (childId: string, birthday: string, gender?: Gender) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childRef = ref(database, `children/${childId}`);

    await update(
      childRef,
      removeUndefined({
        birthday,
        gender,
        isPregnancy: false,
        'pregnancyData/status': 'archived',
      }),
    );
  };
}
