import type { DiaryEntry } from '~app/domain/records';
import type { ActionContext } from './types';

export function updateDiaryEntryAction({
  user,
  currentChild,
  firebaseChildren,
}: ActionContext) {
  const updateDiaryEntry = async (entryId: string, updates: Partial<DiaryEntry>) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      await firebaseChildren.updateDiaryEntry(currentChild.id, entryId, updates);
    } catch (error) {
      console.error('更新日記失敗:', error);

      throw error;
    }
  };

  return updateDiaryEntry;
}
