import { ref, remove } from 'firebase/database';
import { database } from '../firebase';

export function deleteDailyLogOperation(userId: string | null) {
  const deleteDailyLog = async (childId: string, logId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const logRef = ref(database, `childRecords/${childId}/dailyLogs/${logId}`);

    await remove(logRef);
  };

  return deleteDailyLog;
}
