import { set } from 'firebase/database';

import type { DiaryEntry } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';

import { newRecordRef } from '../record_helpers';

export function createAddDiaryEntry(userId: string | null) {
  return async (childId: string, entry: Omit<DiaryEntry, 'id'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { recordRef, id } = newRecordRef(`childRecords/${childId}/diaryEntries`);
    const newEntry: DiaryEntry = { ...entry, id };

    await set(recordRef, removeUndefined(newEntry));

    return id;
  };
}
