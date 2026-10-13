import { ref, set } from 'firebase/database';
import { removeUndefined } from '~app/domain/firebaseData';
import { database } from '../firebase';

export function upsertPrenatalRecordOperation(userId: string | null) {
  const upsertPrenatalRecord = async (
    childId: string,
    templateId: string,
    record: { completedDate: string; clinicName?: string; notes?: string },
  ) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const recordRef = ref(
      database,
      `children/${childId}/prenatalProgress/${templateId}`,
    );

    await set(recordRef, removeUndefined(record));
  };

  return upsertPrenatalRecord;
}
