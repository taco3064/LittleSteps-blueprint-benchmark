import { ref, update } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createSetCurrentChild(userId: string | null) {
  return async (childId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const userRef = ref(database, `users/${userId}`);

    await update(userRef, {
      currentChildId: childId,
    });
  };
}
