import { ref, get } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type {
  ChildProfile,
  DailyLog,
  DiaryEntry,
  GrowthRecord,
} from '~app/family/domain/familyRecords';
import type { ChildExportSource } from '~app/family/domain/childExport';

import { collectionRows } from '../record_helpers';

export function createReadChildExport(userId: string | null) {
  return async (childId: string): Promise<ChildExportSource> => {
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
}
