import { ref, set } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createSetJoinOpen(userId: string | null) {
  return async (childId: string, open: boolean) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await set(ref(database, `children/${childId}/joinOpen`), open);
  };
}
