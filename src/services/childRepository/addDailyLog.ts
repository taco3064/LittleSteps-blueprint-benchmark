import { set } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { DailyLog } from '~app/domain/records';
import { newRecordRef } from './shared';

export function addDailyLogOperation(userId: string | null) {
  // Daily Log methods
  const addDailyLog = async (childId: string, log: Omit<DailyLog, 'id'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { recordRef, id } = newRecordRef(`childRecords/${childId}/dailyLogs`);
    const newLog: DailyLog = { ...log, id };

    await set(recordRef, removeUndefined(newLog));

    return id;
  };

  return addDailyLog;
}
