import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { buildClinicSummaryText } from '~app/domain/clinicSummary';
import { toLocalDateKey } from '~app/domain/dateHelpers';
import type { ChildProfile, DailyLog, FeedingData } from '~app/domain/records';
import { vaccineSchedules } from '~app/domain/vaccines';
import { useClinicSummary } from './useClinicSummary';

/**
 * 回歸測試：看診摘要在真實資料下會整頁白掉。
 *
 * Firebase Realtime Database 不儲存空物件——addChild 寫進去的
 * `vaccineProgress: {}` 讀回來是 undefined。所以任何還沒勾過任何一劑疫苗的
 * 孩子（也就是每一個剛建立的檔案），這一頁在 render 期間就丟 TypeError。
 * 這個 app 沒有任何 ErrorBoundary，一丟就是整個畫面空白。
 *
 * 型別看不出來：ChildProfile 把這些欄位宣告成必填，但那是寫入端的形狀，
 * 不是讀回來的形狀。
 */

const childWithoutProgressMaps = (): ChildProfile =>
  ({
    id: 'c1',
    name: '小豆',
    birthday: '2025-12-28',
    createdAt: '2025-12-28T00:00:00.000Z',
    createdBy: 'u1',
    // milestoneProgress / vaccineProgress 故意不給：這就是 Firebase 回來的樣子。
  }) as unknown as ChildProfile;

describe('useClinicSummary', () => {
  /*
    這一頁是交到小兒科醫師手上的那一份。把擠出來的量當成寶寶喝進去的量，
    是 #14 要防的最壞結果：六次瓶餵加六次擠奶會變成十二餐、兩倍奶量，
    而讀的人沒有任何辦法看出來。
  */
  it('把擠奶排除在交給醫師的攝取量之外', () => {
    const today = new Date();

    const at = (hour: number) => {
      const d = new Date(today);

      d.setHours(hour, 0, 0, 0);

      return d.toISOString();
    };

    const log = (id: string, data: FeedingData, hour: number): DailyLog => ({
      id,
      childId: 'c1',
      type: 'feeding',
      timestamp: at(hour),
      data,
      createdAt: at(hour),
    });

    const logs = [
      log('b1', { feedingType: 'breast_milk_bottle', amount: 100 }, 6),
      log('b2', { feedingType: 'breast_milk_bottle', amount: 100 }, 10),
      log('p1', { feedingType: 'pumping', amount: 150, duration: 20 }, 7),
      log('p2', { feedingType: 'pumping', amount: 150, duration: 20 }, 11),
    ];

    const { result } = renderHook(() =>
      useClinicSummary(childWithoutProgressMaps(), logs, null),
    );

    expect(result.current.data?.weekSummary.avgFeedingCount).toBe(2);
    expect(result.current.data?.weekSummary.avgFeedingAmount).toBe(200);
  });

  it('只擠了奶的一天不算「有記餵奶」，因為寶寶喝了多少仍然不知道', () => {
    const at = (hour: number) => {
      const d = new Date();

      d.setHours(hour, 0, 0, 0);

      return d.toISOString();
    };

    const logs: DailyLog[] = [
      {
        id: 'p1',
        childId: 'c1',
        type: 'feeding',
        timestamp: at(7),
        data: { feedingType: 'pumping', amount: 150 },
        createdAt: at(7),
      },
    ];

    const { result } = renderHook(() =>
      useClinicSummary(childWithoutProgressMaps(), logs, null),
    );

    expect(result.current.data?.weekSummary.feedingDays).toBe(0);
    expect(result.current.data?.weekSummary.avgFeedingAmount).toBe(0);
  });

  it('孩子還沒勾過任何疫苗時不會炸掉', () => {
    const { result } = renderHook(() =>
      useClinicSummary(childWithoutProgressMaps(), [], null),
    );

    expect(result.current.data).toBeTruthy();
    expect(result.current.data?.administeredVaccines).toEqual([]);
  });

  it('沒有性別因而算不出百分位時，仍然給得出最新測量', () => {
    // 由 LittleBloom 登記出生轉過來的孩子一律沒有性別：recordBirth 只改
    // birthday 與 isPregnancy，不會補 gender。
    // growthRecords 由 useGrowthTracking 從 Firebase 取得；測試環境下是空的，
    // 所以這一條驗的是「沒有測量紀錄時也不炸」，百分位缺失的情況由
    // ClinicSummaryPage 的 ?. 守住。
    const { result } = renderHook(() =>
      useClinicSummary(childWithoutProgressMaps(), [], null),
    );

    expect(result.current.data?.latestGrowth).toBeUndefined();
  });

  // 這一頁的百分位是用矯正年齡算的。年齡欄位若只給實際年齡，醫師手上就是
  // 兩個對不起來的數字，而且看不出哪一個對應哪一個。
  it('早產寶寶的摘要同時給出生週數與矯正年齡', () => {
    const preterm = {
      ...childWithoutProgressMaps(),
      birthday: '2026-02-01',
      gestationalAgeWeeks: 32,
      gestationalAgeDays: 3,
    } as ChildProfile;

    const { result } = renderHook(() => useClinicSummary(preterm, [], null));

    expect(result.current.data?.gestationalAge).toBe('出生 32 週 3 天');
    expect(result.current.data?.correctedAgeDisplay).toMatch(/個月$/);
  });

  it('足月寶寶的摘要不多出矯正年齡欄位', () => {
    const { result } = renderHook(() =>
      useClinicSummary(childWithoutProgressMaps(), [], null),
    );

    expect(result.current.data?.gestationalAge).toBeUndefined();
    expect(result.current.data?.correctedAgeDisplay).toBeUndefined();
  });

  // 下一劑只認公費，也不再回答已經被年齡拋在後面的劑次，所以「沒有下一劑」
  // 變成常見的情形。這一段若就這樣少一行，醫師讀到的是「沒事要談」。
  describe('沒有下一劑時', () => {
    // 公費常規劑次：帶 eligibility 的那種只給名單上的孩子，不是家長欠的。
    const NATIONAL_DOSES = vaccineSchedules.filter(
      (v) => v.funding === 'national' && !v.eligibility,
    ).length;

    /** 相對於今天推算，測試才不會隨時間過期。 */
    const yearsAgo = (years: number): string => {
      const date = new Date();

      date.setFullYear(date.getFullYear() - years);

      return toLocalDateKey(date);
    };

    const schoolAgeChild = (): ChildProfile =>
      ({ ...childWithoutProgressMaps(), birthday: yearsAgo(7) }) as ChildProfile;

    it('改為說出還有幾劑公費疫苗沒有記錄', () => {
      const { result } = renderHook(() =>
        useClinicSummary(schoolAgeChild(), [], null),
      );

      expect(result.current.data?.nextVaccine).toBeUndefined();
      expect(result.current.data?.unrecordedNationalDoses).toBe(NATIONAL_DOSES);
    });

    it('這句話也要進得了可複製的文字版——那才是真的貼給診所的東西', () => {
      const { result } = renderHook(() =>
        useClinicSummary(schoolAgeChild(), [], null),
      );

      const text = buildClinicSummaryText(result.current.data!, '');

      expect(text).toContain(`尚有 ${NATIONAL_DOSES} 劑公費疫苗沒有記錄`);
      expect(text).not.toContain('下一劑：');
    });

    it('有下一劑時不加這一行，改回報下一劑', () => {
      // 新生兒：出生那一劑就是下一劑。
      const newborn = {
        ...childWithoutProgressMaps(),
        birthday: yearsAgo(0),
      } as ChildProfile;

      const { result } = renderHook(() => useClinicSummary(newborn, [], null));
      const text = buildClinicSummaryText(result.current.data!, '');

      expect(result.current.data?.nextVaccine).toBeDefined();
      expect(result.current.data?.unrecordedNationalDoses).toBeUndefined();
      expect(text).toContain('下一劑：');
      expect(text).not.toContain('沒有記錄不代表沒打');
    });
  });
});
