import { ref, set } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

import { removeUndefined } from '~app/platform/domain/firebaseData';

import { toLocalDateKey } from '~app/platform/domain/calendar';

export function createUpdateVaccineProgress(userId: string | null) {
  return async ({
    childId,
    vaccineId,
    doseNumber,
    administered,
    customDate,
  }: {
    childId: string;
    vaccineId: string;
    doseNumber: number;
    administered: boolean;
    customDate?: string;
  }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const progressRef = ref(
      database,
      `children/${childId}/vaccineProgress/${vaccineId}/doses/${doseNumber}`,
    );

    await set(
      progressRef,
      removeUndefined({
        administered,
        administeredDate: administered ? customDate || toLocalDateKey() : undefined,
      }),
    );
  };
}
