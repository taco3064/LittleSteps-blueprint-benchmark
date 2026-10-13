import type { User } from '~app/domain/authUser';
import { DailyLog } from '~app/domain/records';
import { useFirebaseCollection } from '../useFirebaseCollection';

/**
 * Realtime listener for a child's daily logs (Firebase). Writes go through
 * useFirebaseChildren in the calling component.
 */
export function useDailyLogs(childId: string | null, user: User | null) {
  const {
    data: logs,
    loading,
    error,
  } = useFirebaseCollection<DailyLog[]>(childId, user, {
    firebasePath: `childRecords/${childId}/dailyLogs`,
    empty: [],
    fromFirebase: (data) => (data ? (Object.values(data) as DailyLog[]) : []),
    errorLabel: 'Error fetching daily logs:',
  });

  return { logs, loading, error };
}
