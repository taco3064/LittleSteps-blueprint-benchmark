import { ref, remove } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createDeleteDiaryEntry(userId: string | null) {
  return async (childId: string, entryId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const entryRef = ref(database, `childRecords/${childId}/diaryEntries/${entryId}`);

    await remove(entryRef);
  };
}
