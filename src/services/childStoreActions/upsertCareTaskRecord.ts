import type { CareTaskRecord } from '~app/domain/records';
import type { ActionContext } from './types';

export function upsertCareTaskRecordAction({
  user,
  currentChild,
  firebaseChildren,
}: ActionContext) {
  const upsertCareTaskRecord = async (record: CareTaskRecord) => {
    if (!user || !currentChild) {
      return;
    }

    try {
      await firebaseChildren.upsertCareTaskRecord(currentChild.id, record);
    } catch (error) {
      console.error('更新照護記錄失敗:', error);

      throw error;
    }
  };

  return upsertCareTaskRecord;
}
