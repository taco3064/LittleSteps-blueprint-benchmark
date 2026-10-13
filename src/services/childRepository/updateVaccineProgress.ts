import { ref, set } from 'firebase/database';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { removeUndefined } from '~app/domain/firebaseData';
import { database } from '../firebase';

export function updateVaccineProgressOperation(userId: string | null) {
  const updateVaccineProgress = async ({
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

  return updateVaccineProgress;
}
