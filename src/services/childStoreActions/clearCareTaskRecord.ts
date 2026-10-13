import type { ActionContext } from './types';

export function clearCareTaskRecordAction({
  user,
  currentChild,
  firebaseChildren,
}: ActionContext) {
  const clearCareTaskRecord = async (taskId: string) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      await firebaseChildren.clearCareTaskRecord(currentChild.id, taskId);
    } catch (error) {
      console.error('取消照護記錄失敗:', error);

      throw error;
    }
  };

  return clearCareTaskRecord;
}
