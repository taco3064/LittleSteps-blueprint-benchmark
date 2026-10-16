import { ref, set, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { ChildProfile, Gender } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';
import type { GestationalAge } from '~app/family/domain/correctedAge';
import { lmpFromDueDate } from '~app/family/domain/dateHelpers';
import { CHILD_LIMIT_MESSAGE, MAX_CHILDREN } from '~app/family/domain/childLimits';

export function createAddChild(userId: string | null) {
  return async ({
    name,
    birthday,
    currentChildCount,
    gender,
    dueDate,
    gestationalAge,
  }: {
    name: string;
    birthday: string;
    currentChildCount: number;
    gender?: Gender;
    dueDate?: string;
    gestationalAge?: GestationalAge;
  }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // 帳號層級的上限，見 common/childLimits。
    if (currentChildCount >= MAX_CHILDREN) {
      throw new Error(CHILD_LIMIT_MESSAGE);
    }

    const childId = crypto.randomUUID();

    const newChild: ChildProfile = {
      id: childId,
      name,
      birthday,
      gender,
      gestationalAgeWeeks: gestationalAge?.weeks,
      gestationalAgeDays: gestationalAge?.days,
      // 授權名單，不是 users/{uid}/childrenIds。建立者必須在同一筆寫入裡就是
      // 成員，否則規則擋下這筆——連他自己都讀不回這個孩子。
      members: { [userId]: true },
      // 一律寫成布林值，不留空。規則驗的是 isBoolean，欄位缺著的話分享視窗
      // 讀到的是 undefined，切換開關時就會以為自己在改一個本來存在的設定。
      // 預設關：代碼是 UUID，但 UUID 會流過聊天軟體與截圖。
      joinOpen: false,
      milestoneProgress: {},
      vaccineProgress: {},
      // 孕期檔案在這裡就要把 pregnancyData 寫進去。先前這兩個參數在
      // AddChildModal → Sidebar → useChildStore 的傳遞途中被靜默丟棄，
      // 導致 LittleBloom 永遠讀不到資料、每個人都停在第 1 週。
      isPregnancy: dueDate ? true : undefined,
      pregnancyData: dueDate
        ? {
            childId,
            dueDate,
            lastPeriodDate: lmpFromDueDate(dueDate),
            status: 'active',
          }
        : undefined,
      createdAt: new Date().toISOString(),
      createdBy: userId,
    };

    // 一次寫完，不是兩筆循序 set。
    //
    // 孩子本體與自己的名單索引要嘛都在、要嘛都不在。只有本體落地的話，那份
    // 檔案讀得到（我還在 members 裡）卻沒有任何入口指得到它——名單上沒有、
    // 切換器裡沒有，只剩當初那個 UUID，而家長從來沒看過它。
    const updates: Record<string, unknown> = {
      [`children/${childId}`]: removeUndefined(newChild),
      [`users/${userId}/childrenIds/${childId}`]: true,
    };

    // 第一個孩子自動設為當前選取，同一筆帶過去。
    if (currentChildCount === 0) {
      updates[`users/${userId}/currentChildId`] = childId;
    }

    await update(ref(database), updates);

    // 加入用的公開索引，見 childIndex 的說明。它進不了上面那一筆：規則檢查的
    // 是寫入前的 root，成員資格在同一筆裡還不算存在，所以只能排在授權之後。
    // 寫失敗不算新增失敗——孩子已經建好了，而 useUserChildren 對每個有權限的
    // 孩子都會補一次索引。
    await set(ref(database, `childIndex/${childId}`), true).catch((error) => {
      console.error('寫入寶寶索引失敗，稍後由名單 listener 補上:', error);
    });

    return childId;
  };
}
