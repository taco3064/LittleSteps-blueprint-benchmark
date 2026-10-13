import type { ActionContext } from './types';

export function upsertPrenatalRecordAction({
  user,
  pregnancyChild,
  firebaseChildren,
}: ActionContext) {
  const upsertPrenatalRecord = async (
    templateId: string,
    record: { completedDate: string; clinicName?: string; notes?: string },
  ) => {
    if (!user || !pregnancyChild) {
      return;
    }

    try {
      await firebaseChildren.upsertPrenatalRecord(
        pregnancyChild.id,
        templateId,
        record,
      );
    } catch (error) {
      console.error('更新產檢記錄失敗:', error);

      throw error;
    }
  };

  return upsertPrenatalRecord;
}
