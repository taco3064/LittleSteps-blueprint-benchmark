import { useMemo } from 'react';
import type { User } from '~app/domain/authUser';
import { FoodTrackingProgress } from '~app/domain/records';
import { useFirebaseCollection } from '../useFirebaseCollection';

/** 食物嘗試的統計；追蹤頁與主頁概況共用同一份形狀。 */
export interface FoodStats {
  total: number;
  withAllergy: number;
  loved: number;
  disliked: number;
  noAllergy: number;
}

/**
 * Realtime listener + derived views for a child's complementary-food tracking
 * (Firebase). Writes go through useFirebaseChildren in the calling component.
 */
export function useFoodTracking(childId: string | null, user: User | null) {
  const {
    data: foodProgress,
    loading,
    error,
  } = useFirebaseCollection<FoodTrackingProgress>(childId, user, {
    firebasePath: `children/${childId}/foodTrackingProgress`,
    empty: {},
    fromFirebase: (data) => (data ? (data as FoodTrackingProgress) : {}),
    errorLabel: 'Error fetching food tracking data:',
  });

  // Sort by first-tried date, newest first.
  const foodTrials = useMemo(
    () =>
      Object.values(foodProgress).sort(
        (a, b) =>
          new Date(b.firstTriedDate).getTime()
            - new Date(a.firstTriedDate).getTime(),
      ),
    [foodProgress],
  );

  const stats = useMemo<FoodStats>(() => {
    const total = foodTrials.length;
    const withAllergy = foodTrials.filter((f) => f.hasAllergy).length;

    const loved = foodTrials.filter(
      (f) => f.preference === 'love' || f.preference === 'like',
    ).length;

    const disliked = foodTrials.filter(
      (f) => f.preference === 'dislike' || f.preference === 'refuse',
    ).length;

    return { total, withAllergy, loved, disliked, noAllergy: total - withAllergy };
  }, [foodTrials]);

  // 「同一種食物間隔 3 天才能再試」的第二份實作原本在這裡，沒有任何人匯入，
  // 而 FourByThreeTracker 自己算了一份——而且那份與 complementaryFood.ts 的
  // 階段模型互相矛盾。留一份就好，留在畫面旁邊那一份。
  return { foodProgress, foodTrials, loading, error, stats };
}
