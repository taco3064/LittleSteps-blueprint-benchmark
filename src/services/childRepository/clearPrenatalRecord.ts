import { ref, remove } from 'firebase/database';
import { database } from '../firebase';

export function clearPrenatalRecordOperation(userId: string | null) {
  const clearPrenatalRecord = async (childId: string, templateId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const recordRef = ref(
      database,
      `children/${childId}/prenatalProgress/${templateId}`,
    );

    await remove(recordRef);
  };

  return clearPrenatalRecord;
}
