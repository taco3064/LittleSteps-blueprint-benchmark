import { ref, remove } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createDeleteFoodTrial(userId: string | null) {
  return async (childId: string, foodId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const foodRef = ref(database, `children/${childId}/foodTrackingProgress/${foodId}`);

    await remove(foodRef);
  };
}
