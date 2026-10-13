import { useEffect, useRef, useState } from 'react';
import type { User } from '~app/domain/authUser';
import { subscribeChildCollection } from '~app/services/childCollection';

export interface FirebaseCollectionOptions<T> {
  /** Realtime Database path, e.g. `childRecords/${childId}/dailyLogs`. */
  firebasePath: string;
  /** Value used when there is no child, no data, or no authenticated user. */
  empty: T;
  /** Transform a raw Realtime Database snapshot value into the collection shape. */
  fromFirebase: (data: unknown) => T;
  /** Label used in console error messages. */
  errorLabel?: string;
}

/**
 * Read-only realtime listener for a child-scoped Firebase collection. Login is
 * mandatory, so there is no LocalStorage fallback: without a user or childId it
 * yields the empty value. Writes go through useFirebaseChildren directly.
 */
export function useFirebaseCollection<T>(
  childId: string | null,
  user: User | null,
  options: FirebaseCollectionOptions<T>,
): { data: T; loading: boolean; error: boolean } {
  const [data, setData] = useState<T>(options.empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Options are derived from childId each render; read the latest via a ref so
  // the effect only re-subscribes on childId/user changes.
  const optionsRef = useRef(options);

  optionsRef.current = options;

  useEffect(() => {
    const { firebasePath, empty, fromFirebase, errorLabel } = optionsRef.current;

    if (!childId || !user) {
      setData(empty);
      setError(false);
      setLoading(false);

      return;
    }

    // 換孩子時必須連 data 一起清掉。只設 loading 的話，新孩子的快照抵達之前
    // 畫面還掛著上一個孩子的餵奶、尿布與睡眠——標題已經是新孩子的名字了。
    setData(empty);
    setError(false);
    setLoading(true);

    const unsubscribe = subscribeChildCollection(
      firebasePath,
      (data) => {
        setData(fromFirebase(data));
        setLoading(false);
      },
      (err) => {
        // 讀取被拒或斷線不是「今天還沒有記錄」。data 維持上一個成功的值，
        // 由 error 讓頁面說得出實話。
        console.error(errorLabel || `Error fetching ${firebasePath}:`, err);
        setError(true);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [childId, user]);

  return { data, loading, error };
}
