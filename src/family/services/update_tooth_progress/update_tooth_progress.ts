import { ref, set } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

import { removeUndefined } from '~app/platform/domain/firebaseData';

import { toLocalDateKey } from '~app/platform/domain/calendar';

export function createUpdateToothProgress(userId: string | null) {
  return async ({
    childId,
    toothId,
    erupted,
    customDate,
  }: {
    childId: string;
    toothId: string;
    erupted: boolean;
    customDate?: string;
  }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const toothRef = ref(database, `children/${childId}/toothProgress/${toothId}`);

    await set(
      toothRef,
      removeUndefined({
        erupted,
        eruptedDate: erupted ? customDate || toLocalDateKey() : undefined,
      }),
    );
  };
}
