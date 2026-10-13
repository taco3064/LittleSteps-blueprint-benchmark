import { ref, update } from 'firebase/database';
import { database } from '../firebase';

export function setCurrentChildOperation(userId: string | null) {
  const setCurrentChild = async (childId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const userRef = ref(database, `users/${userId}`);

    await update(userRef, {
      currentChildId: childId,
    });
  };

  return setCurrentChild;
}
