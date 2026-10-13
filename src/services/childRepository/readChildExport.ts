import { get, ref } from 'firebase/database';
import type { ChildExportSource } from '~app/domain/childExport';
import {
  ChildProfile,
  DailyLog,
  DiaryEntry,
  GrowthRecord,
} from '~app/domain/records';
import { database } from '../firebase';
import { collectionRows } from './shared';

export function readChildExportOperation(userId: string | null) {
  /**
   * 匯出用的一次性讀取：孩子本體，加上 childRecords 底下那三份只增不減的紀錄。
   *
   * 四條路徑各 get() 一次就結束，刻意不用 onValue。畫面上那三個 listener 是為了
   * 「記完立刻看得到」而存在的；匯出是按一下就結束的動作，掛上 listener 等於為了
   * 一份檔案，把整段歷史留在記憶體裡持續同步。四筆同時發，不是排隊等。
   *
   * 讀不到本體就直接失敗，不要匯出一個 child 是 null 的檔案——那種檔案家長要
   * 過很久、在真的需要它的時候才會發現是空的。成員資格由規則把關，這裡不重複驗。
   *
   * 排序照畫面上的順序（新的在前），與 LogTimeline、diaryHelpers 及
   * useGrowthTracking 一致：push key 的先後對讀檔的家長沒有任何意義。
   */
  const readChildExport = async (childId: string): Promise<ChildExportSource> => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const [childSnapshot, logsSnapshot, diarySnapshot, growthSnapshot]
      = await Promise.all([
        get(ref(database, `children/${childId}`)),
        get(ref(database, `childRecords/${childId}/dailyLogs`)),
        get(ref(database, `childRecords/${childId}/diaryEntries`)),
        get(ref(database, `childRecords/${childId}/growthRecords`)),
      ]);

    if (!childSnapshot.exists()) {
      throw new Error('找不到這個寶寶的資料，請重新整理後再試');
    }

    return {
      child: childSnapshot.val() as ChildProfile,
      dailyLogs: collectionRows<DailyLog>(logsSnapshot).sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
      diaryEntries: collectionRows<DiaryEntry>(diarySnapshot).sort(
        (a, b) =>
          b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
      ),
      growthRecords: collectionRows<GrowthRecord>(growthSnapshot).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    };
  };

  return readChildExport;
}
