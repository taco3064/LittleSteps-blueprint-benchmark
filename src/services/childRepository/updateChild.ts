import { ref, update } from 'firebase/database';
import type { GestationalAge } from '~app/domain/correctedAge';
import { lmpFromDueDate } from '~app/domain/dateHelpers';
import { removeUndefined } from '~app/domain/firebaseData';
import { Gender } from '~app/domain/records';
import { database } from '../firebase';

export function updateChildOperation(userId: string | null) {
  /**
   * 編輯既有檔案。
   *
   * 孕期檔案的 birthday 欄位存的是預產期，而 LittleBloom 的週數、孕期指南
   * 與 14 次產檢時程全部是從 pregnancyData.lastPeriodDate 推出來的。只改
   * birthday 的話兩者會永久脫鉤：畫面上的預產期改了，週數與產檢時程卻還用
   * 舊的末次月經——照超音波修正預產期正是最常見的操作。
   */
  const updateChild = async ({
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

  return updateChild;
}
