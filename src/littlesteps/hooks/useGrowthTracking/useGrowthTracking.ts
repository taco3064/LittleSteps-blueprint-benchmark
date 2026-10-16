import {
  withPercentiles as calculateRecordPercentiles,
  type GrowthChild,
} from '~app/littlesteps/domain/growthRecords';
import {
  createGrowthActions,
  subscribeGrowthRecords,
} from '~app/littlesteps/services/growth_records';
import { useEffect, useMemo, useState } from 'react';
import type { GrowthRecord } from '~app/family/domain/familyRecords';

/**
 * 算百分位需要孩子的哪些欄位。整份 ChildProfile 傳進來也可以，型別相容。
 *
 * 早產週數在這裡不是選配：拿實際月齡去查 WHO 標準，一個 32 週出生、體重完全
 * 正常的寶寶會落到第 3 百分位附近，而這張圖正是家長要拿去給醫師看的那一頁。
 */
export type { GrowthChild } from '~app/littlesteps/domain/growthRecords';
interface UseGrowthTrackingResult {
  records: GrowthRecord[];
  loading: boolean;
  /** 讀取被拒或斷線；沒有測量紀錄與讀不到紀錄不是同一件事。 */
  error: boolean;
  addRecord: (record: Omit<GrowthRecord, 'id'>) => Promise<void>;
  /** opened：表單打開時帶入的那一版（GrowthChartsPage 的 editingRecord），比對的基準。 */
  updateRecord: (
    recordId: string,
    updates: Partial<Omit<GrowthRecord, 'id' | 'childId'>>,
    opened: GrowthRecord,
  ) => Promise<void>;
  deleteRecord: (recordId: string) => Promise<void>;
}

/**
 * Hook for managing growth records (weight, height, head circumference)
 * backed by Firebase. Login is mandatory; without a user it yields no records.
 *
 * 紀錄住在 childRecords/{childId}/growthRecords，不在孩子本體裡：測量筆數沒有
 * 上限，跟著檔案走的話，每一次勾里程碑都會把整份成長史再推送一次給每位家長。
 *
 * 百分位在讀取時重算，而不是只信資料庫裡那一份。百分位本來是寫入當下算好存
 * 進去的，所以早產矯正上線之前寫下的每一筆都是用實際月齡算的——只改寫入端的
 * 話，那些紀錄會永遠停在偏低的百分位，而它們正是家長最在意的那幾筆。
 *
 * 寫入端不再存百分位。讀取端一律重算之後，存的那一份沒有任何地方在讀；而它
 * 對得上的只是寫入者手上那一版——共享的孩子有兩位照顧者，媽媽補身高、爸爸補
 * 頭圍，各自從自己的舊版算出來的百分位都對不上資料庫裡真的那一筆。舊紀錄裡
 * 存著的百分位留著不動，規則也照樣收（見 withPercentiles 的第 2 點）。
 */
export function useGrowthTracking(
  childId: string | null,
  user: { uid: string } | null,
  child?: GrowthChild,
): UseGrowthTrackingResult {
  const [storedRecords, setStoredRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { gender: childGender, birthday: childBirthday } = child ?? {};
  const gestationalAgeWeeks = child?.gestationalAgeWeeks;
  const gestationalAgeDays = child?.gestationalAgeDays;

  const records = useMemo(
    () =>
      storedRecords.map((record) =>
        withPercentiles(record, {
          gender: childGender,
          birthday: childBirthday,
          gestationalAgeWeeks,
          gestationalAgeDays,
        }),
      ),
    [
      storedRecords,
      childGender,
      childBirthday,
      gestationalAgeWeeks,
      gestationalAgeDays,
    ],
  );

  // Real-time listener
  useEffect(() => {
    if (!childId || !user) {
      setStoredRecords([]);
      setError(false);
      setLoading(false);

      return;
    }

    // 換孩子時連 records 一起清掉，否則新快照抵達之前，上一個孩子的身高體重
    // 會掛在新孩子的名字與成長曲線上。
    setStoredRecords([]);
    setError(false);
    setLoading(true);

    const unsubscribe = subscribeGrowthRecords(childId, {
      onRecords: (records) => {
        setStoredRecords(records);
        setLoading(false);
      },
      onError: (err) => {
        console.error('讀取成長紀錄失敗:', err);
        setError(true);
        setLoading(false);
      },
    });

    return () => unsubscribe();
  }, [childId, user]);

  return {
    records,
    loading,
    error,
    ...createGrowthActions(childId, storedRecords),
  };
}

function withPercentiles<T extends Omit<GrowthRecord, 'id'>>(
  record: T,
  child?: GrowthChild,
): T {
  try {
    return calculateRecordPercentiles(record, child);
  } catch (error) {
    console.warn('Failed to calculate percentiles:', error);

    return record;
  }
}
