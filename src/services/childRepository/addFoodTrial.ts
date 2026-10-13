import { set } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { FoodTrialInput, FoodTrialRecord } from '~app/domain/records';
import { newRecordRef } from './shared';

export function addFoodTrialOperation(userId: string | null) {
  // Food Tracking methods
  /** 新紀錄的嘗試日期是日期集合（FoodTrialInput 型別保證），不再是陣列。 */
  const addFoodTrial = async (childId: string, foodTrial: FoodTrialInput) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { recordRef, id } = newRecordRef(
      `children/${childId}/foodTrackingProgress`,
    );

    const newFoodTrial: FoodTrialRecord = {
      ...foodTrial,
      id,
      createdAt: new Date().toISOString(),
    };

    await set(recordRef, removeUndefined(newFoodTrial));

    return id;
  };

  return addFoodTrial;
}
