import { ref, remove } from 'firebase/database';
import { database } from '../firebase';

export function clearCareTaskRecordOperation(userId: string | null) {
  const clearCareTaskRecord = async (childId: string, taskId: string) => {
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const taskRef = ref(database, `children/${childId}/careTaskProgress/${taskId}`);

    await remove(taskRef);
  };

  return clearCareTaskRecord;
}
