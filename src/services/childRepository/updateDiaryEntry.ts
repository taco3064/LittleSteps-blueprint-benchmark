import { ref, update } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { DiaryEntry } from '~app/domain/records';
import { database } from '../firebase';

export function updateDiaryEntryOperation(userId: string | null) {
  const updateDiaryEntry = async (
    childId: string,
    entryId: string,
    updates: Partial<DiaryEntry>,
  ) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const entryRef = ref(
      database,
      `childRecords/${childId}/diaryEntries/${entryId}`,
    );

    await update(
      entryRef,
      removeUndefined({
        ...updates,
        updatedAt: new Date().toISOString(),
      }),
    );
  };

  return updateDiaryEntry;
}
