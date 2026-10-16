import { ref, set } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

import { removeUndefined } from '~app/platform/domain/firebaseData';

import { toLocalDateKey } from '~app/platform/domain/calendar';

export function createUpdateDevelopmentProgress(userId: string | null) {
  return async (childId: string, checkItemId: string, achieved: boolean) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const progressRef = ref(
      database,
      `children/${childId}/developmentProgress/${checkItemId}`,
    );

    await set(
      progressRef,
      removeUndefined({
        achieved,
        achievedDate: achieved ? toLocalDateKey() : undefined,
      }),
    );
  };
}
