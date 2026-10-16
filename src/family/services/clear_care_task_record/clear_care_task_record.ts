import { ref, remove } from 'firebase/database';
import { database } from '~app/platform/services/firebase';

export function createClearCareTaskRecord(userId: string | null) {
  return async (childId: string, taskId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const taskRef = ref(database, `children/${childId}/careTaskProgress/${taskId}`);

    await remove(taskRef);
  };
}
