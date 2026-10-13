import { ref, set } from 'firebase/database';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { removeUndefined } from '~app/domain/firebaseData';
import { database } from '../firebase';

export function updateDevelopmentProgressOperation(userId: string | null) {
  // LittleExplorer methods
  const updateDevelopmentProgress = async (
    childId: string,
    checkItemId: string,
    achieved: boolean,
  ) => {
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

  return updateDevelopmentProgress;
}
