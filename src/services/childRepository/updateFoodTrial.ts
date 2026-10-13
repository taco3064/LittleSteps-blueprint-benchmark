import { ref, update } from 'firebase/database';
import { removeUndefined, toUpdatePaths } from '~app/domain/firebaseData';
import { FoodTrialPatch } from '~app/domain/records';
import { database } from '../firebase';

export function updateFoodTrialOperation(userId: string | null) {
  /**
   * 改一筆食物紀錄。嘗試日期只收補丁（要加的日期 true、要拿掉的 key null），
   * 攤平成 trialDates/<key> 一條一條寫：update() 只在它收到的那一層合併，
   * 整個 trialDates 物件送進去等於把節點換掉，兩位照顧者同一天各記一次，
   * 後到的那筆會連著自己手上的舊清單把對方那一天蓋掉（#89）。
   *
   * 其他欄位維持原樣：過敏反應是陣列，仍然整個寫成一個節點（#91）。
   */
  const updateFoodTrial = async (
    childId: string,
    foodId: string,
    updates: FoodTrialPatch,
  ) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const foodRef = ref(
      database,
      `children/${childId}/foodTrackingProgress/${foodId}`,
    );

    await update(foodRef, {
      ...toUpdatePaths(removeUndefined(updates)),
      updatedAt: new Date().toISOString(),
    });
  };

  return updateFoodTrial;
}
