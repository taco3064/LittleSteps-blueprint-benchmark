import { set } from 'firebase/database';

import type { FoodTrialInput, FoodTrialRecord } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';

import { newRecordRef } from '../record_helpers';

export function createAddFoodTrial(userId: string | null) {
  return async (childId: string, foodTrial: FoodTrialInput) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { recordRef, id } = newRecordRef(`children/${childId}/foodTrackingProgress`);

    const newFoodTrial: FoodTrialRecord = {
      ...foodTrial,
      id,
      createdAt: new Date().toISOString(),
    };

    await set(recordRef, removeUndefined(newFoodTrial));

    return id;
  };
}
