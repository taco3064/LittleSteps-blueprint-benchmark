import { ref, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { FoodTrialPatch } from '~app/family/domain/familyRecords';

import { removeUndefined, toUpdatePaths } from '~app/platform/domain/firebaseData';

export function createUpdateFoodTrial(userId: string | null) {
  return async (childId: string, foodId: string, updates: FoodTrialPatch) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const foodRef = ref(database, `children/${childId}/foodTrackingProgress/${foodId}`);

    await update(foodRef, {
      ...toUpdatePaths(removeUndefined(updates)),
      updatedAt: new Date().toISOString(),
    });
  };
}
