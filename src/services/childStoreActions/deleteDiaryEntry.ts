import type { ActionContext } from './types';

export function deleteDiaryEntryAction({
  user,
  currentChild,
  firebaseChildren,
}: ActionContext) {
  const deleteDiaryEntry = async (entryId: string) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      await firebaseChildren.deleteDiaryEntry(currentChild.id, entryId);
    } catch (error) {
      console.error('刪除日記失敗:', error);

      throw error;
    }
  };

  return deleteDiaryEntry;
}
