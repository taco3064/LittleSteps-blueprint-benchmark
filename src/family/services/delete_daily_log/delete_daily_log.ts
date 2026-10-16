import { ref, remove } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createDeleteDailyLog(userId: string | null) {
  return async (childId: string, logId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const logRef = ref(database, `childRecords/${childId}/dailyLogs/${logId}`);

    await remove(logRef);
  };
}
