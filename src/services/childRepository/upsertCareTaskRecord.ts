import { ref, set } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { CareTaskRecord } from '~app/domain/records';
import { database } from '../firebase';

export function upsertCareTaskRecordOperation(userId: string | null) {
  const upsertCareTaskRecord = async (childId: string, record: CareTaskRecord) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const taskRef = ref(
      database,
      `children/${childId}/careTaskProgress/${record.taskId}`,
    );

    await set(taskRef, removeUndefined(record));
  };

  return upsertCareTaskRecord;
}
