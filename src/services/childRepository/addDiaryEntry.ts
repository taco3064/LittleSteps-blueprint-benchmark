import { set } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { DiaryEntry } from '~app/domain/records';
import { newRecordRef } from './shared';

export function addDiaryEntryOperation(userId: string | null) {
  const addDiaryEntry = async (childId: string, entry: Omit<DiaryEntry, 'id'>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { recordRef, id } = newRecordRef(`childRecords/${childId}/diaryEntries`);
    const newEntry: DiaryEntry = { ...entry, id };

    await set(recordRef, removeUndefined(newEntry));

    return id;
  };

  return addDiaryEntry;
}
