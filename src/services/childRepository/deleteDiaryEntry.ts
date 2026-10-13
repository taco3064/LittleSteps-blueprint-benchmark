import { ref, remove } from 'firebase/database';
import { database } from '../firebase';

export function deleteDiaryEntryOperation(userId: string | null) {
  const deleteDiaryEntry = async (childId: string, entryId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const entryRef = ref(
      database,
      `childRecords/${childId}/diaryEntries/${entryId}`,
    );

    await remove(entryRef);
  };

  return deleteDiaryEntry;
}
