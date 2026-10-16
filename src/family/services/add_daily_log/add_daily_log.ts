import { set } from 'firebase/database';

import type { DailyLog } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';

import { newRecordRef } from '../record_helpers';

export function createAddDailyLog(userId: string | null) {
  return async (childId: string, log: Omit<DailyLog, 'id'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { recordRef, id } = newRecordRef(`childRecords/${childId}/dailyLogs`);
    const newLog: DailyLog = { ...log, id };

    await set(recordRef, removeUndefined(newLog));

    return id;
  };
}
