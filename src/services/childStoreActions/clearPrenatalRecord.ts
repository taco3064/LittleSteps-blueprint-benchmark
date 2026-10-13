import type { ActionContext } from './types';

export function clearPrenatalRecordAction({
  user,
  pregnancyChild,
  firebaseChildren,
}: ActionContext) {
  const clearPrenatalRecord = async (templateId: string) => {
    if (!user || !pregnancyChild) {
      return;
    }

    try {
      await firebaseChildren.clearPrenatalRecord(pregnancyChild.id, templateId);
    } catch (error) {
      console.error('取消產檢記錄失敗:', error);

      throw error;
    }
  };

  return clearPrenatalRecord;
}
