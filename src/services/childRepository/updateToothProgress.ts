import { ref, set } from 'firebase/database';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { removeUndefined } from '~app/domain/firebaseData';
import { database } from '../firebase';

export function updateToothProgressOperation(userId: string | null) {
  const updateToothProgress = async ({
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

  return updateToothProgress;
}
