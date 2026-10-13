import { ref, set } from 'firebase/database';
import { database } from '../firebase';

export function setJoinOpenOperation(userId: string | null) {
  const setJoinOpen = async (childId: string, open: boolean) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    await set(ref(database, `children/${childId}/joinOpen`), open);
  };

  return setJoinOpen;
}
