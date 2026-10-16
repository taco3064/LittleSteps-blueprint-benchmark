import { useMemo } from 'react';
import type { User } from 'firebase/auth';
import { useFirebaseCollection } from '~app/family/hooks/useFirebaseCollection';
import { DailyLog } from '~app/family/domain/familyRecords';

/**
 * Realtime listener for a child's daily logs (Firebase). Writes go through
 * createChildRecords in the calling component.
 */
export function useDailyLogs(childId: string | null, user: User | null) {
  const { data, loading, error } = useFirebaseCollection<Record<
    string,
    DailyLog
  > | null>(childId, user, {
    firebasePath: `childRecords/${childId}/dailyLogs`,
    empty: null,
    fromFirebase: (data) => data as Record<string, DailyLog> | null,
    errorLabel: 'Error fetching daily logs:',
  });

  const logs = useMemo(() => (data ? Object.values(data) : []), [data]);

  return { logs, loading, error };
}
