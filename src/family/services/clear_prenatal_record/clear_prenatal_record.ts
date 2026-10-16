import { ref, remove } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createClearPrenatalRecord(userId: string | null) {
  return async (childId: string, templateId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const recordRef = ref(
      database,
      `children/${childId}/prenatalProgress/${templateId}`,
    );

    await remove(recordRef);
  };
}
