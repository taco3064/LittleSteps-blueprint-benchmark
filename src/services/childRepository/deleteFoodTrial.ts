import { ref, remove } from 'firebase/database';
import { database } from '../firebase';

export function deleteFoodTrialOperation(userId: string | null) {
  const deleteFoodTrial = async (childId: string, foodId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const foodRef = ref(
      database,
      `children/${childId}/foodTrackingProgress/${foodId}`,
    );

    await remove(foodRef);
  };

  return deleteFoodTrial;
}
