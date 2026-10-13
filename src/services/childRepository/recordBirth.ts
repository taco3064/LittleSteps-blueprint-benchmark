import { ref, update } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { Gender } from '~app/domain/records';
import { database } from '../firebase';

export function recordBirthOperation(userId: string | null) {
  /**
   * 孕期檔案轉成寶寶檔案。
   *
   * 一併收性別：成長曲線的百分位要有性別才算得出來（WHO 標準男女不同表），
   * 沒有的話 calculatePercentiles 直接原樣返回，percentile 是空物件、被
   * Firebase 丟掉，於是從 LittleBloom 出生的每個孩子成長曲線都少一半功能，
   * 而且畫面上完全沒有跡象說明為什麼。出生當下正是知道性別的時刻。
   */
  const recordBirth = async (childId: string, birthday: string, gender?: Gender) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const childRef = ref(database, `children/${childId}`);

    await update(
      childRef,
      removeUndefined({
        birthday,
        gender,
        isPregnancy: false,
        'pregnancyData/status': 'archived',
      }),
    );
  };

  return recordBirth;
}
