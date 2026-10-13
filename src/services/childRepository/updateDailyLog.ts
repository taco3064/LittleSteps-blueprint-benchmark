import { ref, update } from 'firebase/database';
import { toUpdatePaths } from '~app/domain/firebaseData';
import { DailyLogPatch } from '~app/domain/records';
import { database } from '../firebase';

export function updateDailyLogOperation(userId: string | null) {
  /**
   * 改一筆日誌：只寫真的改到的欄位。
   *
   * update() 只在它收到的那一層合併，巢狀的 data 是整個節點換掉。所以
   * `{ data: { nightWakings: 2 } }` 會把 data 裡其他欄位一起洗掉——共享的
   * 孩子有兩位照顧者，一個人按「醒了」寫結束時間、另一個人同時在補備註，
   * 後到的那一筆連著他手上的舊值蓋回去，對方剛記的東西就沒了，而且兩邊都
   * 不會看到任何提示。攤平成 data/<欄位> 之後，各改各的欄位就會合併。
   *
   * 沒有任何欄位改到就不寫：只更新 updatedAt 沒有意義。
   */
  const updateDailyLog = async (
    childId: string,
    logId: string,
    patch: DailyLogPatch,
  ) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const paths = toUpdatePaths(patch);

    if (Object.keys(paths).length === 0) {
      return;
    }

    const logRef = ref(database, `childRecords/${childId}/dailyLogs/${logId}`);

    await update(logRef, {
      ...paths,
      updatedAt: new Date().toISOString(),
    });
  };

  return updateDailyLog;
}
