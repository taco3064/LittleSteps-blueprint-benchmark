import { ref, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';
import type { DiaryEntry } from '~app/family/domain/familyRecords';

import { removeUndefined } from '~app/platform/domain/firebaseData';

export function createUpdateDiaryEntry(userId: string | null) {
  return async (childId: string, entryId: string, updates: Partial<DiaryEntry>) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const entryRef = ref(database, `childRecords/${childId}/diaryEntries/${entryId}`);

    await update(
      entryRef,
      removeUndefined({
        ...updates,
        updatedAt: new Date().toISOString(),
      }),
    );
  };
}
