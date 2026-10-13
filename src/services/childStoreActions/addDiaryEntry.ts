import type { DiaryEntry } from '~app/domain/records';
import type { ActionContext } from './types';

export function addDiaryEntryAction({
  user,
  currentChild,
  firebaseChildren,
}: ActionContext) {
  const addDiaryEntry = async (
    entry: Omit<DiaryEntry, 'id' | 'childId' | 'createdAt'>,
  ) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      return await firebaseChildren.addDiaryEntry(currentChild.id, {
        ...entry,
        childId: currentChild.id,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('新增日記失敗:', error);

      throw error;
    }
  };

  return addDiaryEntry;
}
