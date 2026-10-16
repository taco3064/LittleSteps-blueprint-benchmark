import type { User } from 'firebase/auth';
import { useMemo } from 'react';
import { DiaryEntry } from '~app/family/domain/familyRecords';
import { useFirebaseCollection } from '~app/family/hooks/useFirebaseCollection';

/**
 * Realtime listener for a child's growth-diary entries (Firebase). Writes go
 * through useChildStore.
 *
 * 日記與日誌、成長紀錄一樣住在 childRecords/{childId} 而不是孩子本體裡：這三份
 * 只增不減，混在檔案裡的話，任何一次換尿布都會把整段歷史重新推送給每一位家長。
 */
export function useDiary(childId: string | null, user: User | null) {
  const {
    data: entries,
    loading,
    error,
  } = useFirebaseCollection<DiaryEntry[]>(childId, user, {
    firebasePath: `childRecords/${childId}/diaryEntries`,
    empty: [],
    fromFirebase: (data) => (data ? (Object.values(data) as DiaryEntry[]) : []),
    errorLabel: 'Error fetching diary entries:',
  });

  return useMemo(() => ({ entries, loading, error }), [entries, loading, error]);
}
