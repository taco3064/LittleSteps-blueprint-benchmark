import { ref, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { Gender } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';
import type { GestationalAge } from '~app/family/domain/correctedAge';
import { lmpFromDueDate } from '~app/family/domain/dateHelpers';

export function createUpdateChild(userId: string | null) {
  return async ({
    childId,
    name,
    birthday,
    gender,
    isPregnancy,
    gestationalAge,
  }: {
    childId: string;
    name: string;
    birthday: string;
    gender?: Gender;
    isPregnancy?: boolean;
    gestationalAge?: GestationalAge;
  }) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childRef = ref(database, `children/${childId}`);

    await update(
      childRef,
      removeUndefined({
        name,
        birthday,
        gender,
        // 寫 null 而不是留空：呼叫端只有編輯表單，送過來的一定是當下完整的
        // 表單狀態，所以「沒有值」就是「家長把它清掉了」。用 undefined 的話
        // removeUndefined 會整個拔掉這兩個 key，舊的週數就永遠留在資料庫裡，
        // 誤填一次之後再也改不回足月。
        gestationalAgeWeeks: gestationalAge?.weeks ?? null,
        gestationalAgeDays: gestationalAge?.days ?? null,
        ...(isPregnancy
          ? {
              'pregnancyData/dueDate': birthday,
              'pregnancyData/lastPeriodDate': lmpFromDueDate(birthday),
            }
          : {}),
      }),
    );
  };
}
