import { ref, set } from 'firebase/database';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import { removeUndefined } from '~app/domain/firebaseData';
import { database } from '../firebase';

export function updateMilestoneProgressOperation(userId: string | null) {
  const updateMilestoneProgress = async (
    childId: string,
    milestoneId: string,
    achieved: boolean,
  ) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const progressRef = ref(
      database,
      `children/${childId}/milestoneProgress/${milestoneId}`,
    );

    await set(
      progressRef,
      removeUndefined({
        achieved,
        achievedDate: achieved ? toLocalDateKey() : undefined,
      }),
    );
  };

  return updateMilestoneProgress;
}
