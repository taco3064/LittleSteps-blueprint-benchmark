import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { growthAgeMonths } from '~app/domain/correctedAge';
import {
  calculatePercentile,
  calculateZScore,
} from '~app/domain/growthCalculator';
import type { GrowthRecord } from '~app/domain/records';
import { applyUpdatePaths } from '../../../test/rtdb';
import { useGrowthTracking } from './useGrowthTracking';

/**
 * 成長紀錄是掛在孩子身上的測量值，換孩子時沒清掉的話，新孩子的快照抵達之前，
 * 畫面上的體重、身高與百分位都是上一個孩子的——而標題已經換成新名字了。
 *
 * 另一半：讀取被拒或斷線時原本連 cancel callback 都沒有，loading 永遠停在
 * true；補上之後也不能把失敗解析成一份空紀錄，否則畫面會說「還沒量過」。
 *
 * 紀錄住在 childRecords/{childId}/growthRecords：測量筆數沒有上限，跟著孩子
 * 檔案走的話，每一次勾里程碑都會把整份成長史再推送一次給每一位家長。
 */

type Next = (snapshot: { val: () => unknown }) => void;
type Cancel = (error: Error) => void;

/**
 * 每條路徑上所有還掛著的 listener。正式環境裡每個開著的畫面都訂著同一條
 * 路徑，一筆快照抵達時大家都收到——兩位照顧者的測試就靠這個廣播。
 */
const subscriptions = new Map<string, { next: Next; cancel: Cancel }[]>();
/** 這個 hook 只會寫成長紀錄，所以在 mock 這個邊界收斂成該型別一次。 */
const writes: { path: string; value: Partial<GrowthRecord> }[] = [];
/** 修改走 update()：每個 key 都是一條路徑，模擬器與正式環境都是逐條合併。 */
const updates: { path: string; value: Record<string, unknown> }[] = [];
/** set() 與 update() 依發生順序的流水帳，重播時才分得出「整筆換掉」與「逐條合併」。 */
const journal: { kind: 'set' | 'update'; path: string; value: unknown }[] = [];
const removals: string[] = [];

vi.mock('firebase/database', () => ({
  ref: (_db: unknown, path: string) => path,
  onValue: (path: string, next: Next, cancel: Cancel) => {
    const entry = { next, cancel };

    subscriptions.set(path, [...(subscriptions.get(path) ?? []), entry]);

    return () =>
      subscriptions.set(
        path,
        (subscriptions.get(path) ?? []).filter(
          (listener) => listener !== entry,
        ),
      );
  },
  set: (path: string, value: unknown) => {
    writes.push({ path, value: value as Partial<GrowthRecord> });
    journal.push({ kind: 'set', path, value });

    return Promise.resolve();
  },
  update: (path: string, value: Record<string, unknown>) => {
    updates.push({ path, value });
    journal.push({ kind: 'update', path, value });

    return Promise.resolve();
  },
  remove: (path: string) => {
    removals.push(path);

    return Promise.resolve();
  },
}));

vi.mock('~app/services/firebase', () => ({ database: {} }));

const user = { uid: 'u1' };

/** 對這個孩子的每一個 listener 廣播。 */
const subscription = (childId: string) => {
  const entries
    = subscriptions.get(`childRecords/${childId}/growthRecords`) ?? [];

  if (entries.length === 0) {
    throw new Error(`沒有訂閱 ${childId}`);
  }

  return {
    next: (snapshot: { val: () => unknown }) =>
      entries.forEach((entry) => entry.next(snapshot)),
    cancel: (error: Error) => entries.forEach((entry) => entry.cancel(error)),
  };
};

const weight = (id: string, kg: number) => ({
  [id]: { id, childId: 'c1', date: '2026-08-01', weight: kg },
});

beforeEach(() => {
  subscriptions.clear();
  writes.length = 0;
  updates.length = 0;
  journal.length = 0;
  removals.length = 0;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useGrowthTracking', () => {
  it('換孩子時先清空紀錄，不會把上一個孩子的測量掛在新孩子名下', () => {
    const { result, rerender } = renderHook(
      ({ childId }: { childId: string }) => useGrowthTracking(childId, user),
      { initialProps: { childId: 'A' } },
    );

    act(() => subscription('A').next({ val: () => weight('g1', 7.4) }));
    expect(result.current.records).toHaveLength(1);

    rerender({ childId: 'B' });

    expect(result.current.records).toEqual([]);
    expect(result.current.loading).toBe(true);

    act(() => subscription('B').next({ val: () => weight('g2', 9.1) }));

    expect(result.current.records.map((record) => record.weight)).toEqual([
      9.1,
    ]);
  });

  it('讀取失敗時回報 error，而不是一份「還沒量過」的空紀錄', () => {
    const { result } = renderHook(() => useGrowthTracking('A', user));

    act(() => subscription('A').cancel(new Error('permission_denied')));

    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('已經讀到的紀錄不會因為後來的失敗被抹掉', () => {
    const { result } = renderHook(() => useGrowthTracking('A', user));

    act(() => subscription('A').next({ val: () => weight('g1', 7.4) }));
    expect(result.current.error).toBe(false);

    act(() => subscription('A').cancel(new Error('permission_denied')));

    expect(result.current.error).toBe(true);
    expect(result.current.records).toHaveLength(1);
  });

  it('沒有登入時不訂閱，也不停在載入中', () => {
    const { result } = renderHook(() => useGrowthTracking('A', null));

    expect([...subscriptions.values()].flat()).toHaveLength(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(result.current.records).toEqual([]);
  });

  it('新增、修改與刪除都寫在 childRecords 底下，不在孩子檔案裡', async () => {
    const { result } = renderHook(() => useGrowthTracking('A', user));

    act(() => subscription('A').next({ val: () => weight('g1', 7.4) }));

    await act(async () => {
      await result.current.addRecord({
        childId: 'A',
        date: '2026-08-02',
        weight: 7.6,
        percentile: {},
      });

      await result.current.updateRecord(
        'g1',
        { weight: 7.5 },
        weight('g1', 7.4).g1,
      );

      await result.current.deleteRecord('g1');
    });

    expect(writes[0].path).toMatch(/^childRecords\/A\/growthRecords\/[^/]+$/);
    expect(updates[0].path).toBe('childRecords/A/growthRecords/g1');
    expect(removals).toEqual(['childRecords/A/growthRecords/g1']);
  });

  /**
   * 早產矯正的實際效果都在這幾條。
   *
   * 百分位原本是寫入當下算好存進資料庫的，所以矯正機制上線之前寫下的每一筆
   * 都是用實際月齡算的。只改寫入端的話，那些紀錄會永遠停在偏低的百分位——
   * 而那正是家長最在意、最會拿去問醫師的幾筆。
   */
  it('讀取時重算百分位，資料庫裡存錯的那一份不會留在畫面上', () => {
    const stored = {
      g1: {
        id: 'g1',
        childId: 'c1',
        date: '2026-08-01',
        weight: 7.5,
        // 早產矯正之前寫下的值：用實際月齡算出來的偏低百分位。
        percentile: { weight: 3 },
      },
    };

    const { result } = renderHook(() =>
      useGrowthTracking('A', user, {
        gender: 'male',
        birthday: '2026-02-01',
        gestationalAgeWeeks: 32,
      }),
    );

    act(() => subscription('A').next({ val: () => stored }));

    expect(result.current.records[0].percentile?.weight).not.toBe(3);
  });

  it('同樣的體重，早產寶寶的百分位比足月寶寶高', () => {
    // 一個 32 週出生、實際 6 個月大的寶寶，發育進度只該用 4 個月來看。拿實際
    // 月齡去查 WHO 標準，一個完全正常的體重會被說成落後。
    const stored = {
      g1: {
        id: 'g1',
        childId: 'c1',
        date: '2026-08-01',
        weight: 6.4,
        percentile: {},
      },
    };

    const term = renderHook(() =>
      useGrowthTracking('A', user, { gender: 'male', birthday: '2026-02-01' }),
    );

    act(() => subscription('A').next({ val: () => stored }));
    const termPercentile = term.result.current.records[0].percentile?.weight;

    subscriptions.clear();

    const preterm = renderHook(() =>
      useGrowthTracking('A', user, {
        gender: 'male',
        birthday: '2026-02-01',
        gestationalAgeWeeks: 32,
      }),
    );

    act(() => subscription('A').next({ val: () => stored }));

    const pretermPercentile
      = preterm.result.current.records[0].percentile?.weight;

    expect(termPercentile).toBeDefined();
    expect(pretermPercentile).toBeDefined();

    expect(pretermPercentile as number).toBeGreaterThan(
      termPercentile as number,
    );
  });

  it('缺性別或生日時保留存著的百分位，不會把畫面上的數字清成空白', () => {
    const stored = {
      g1: {
        id: 'g1',
        childId: 'c1',
        date: '2026-08-01',
        weight: 7.5,
        percentile: { weight: 45 },
      },
    };

    const { result } = renderHook(() =>
      useGrowthTracking('A', user, { birthday: '2026-02-01' }),
    );

    act(() => subscription('A').next({ val: () => stored }));

    expect(result.current.records[0].percentile?.weight).toBe(45);
  });
});

/**
 * 共享的孩子有兩位照顧者，同一筆測量同時開著是常態。修改原本是拿「手上那
 * 一版 + 這次改的欄位」重算百分位再 set 整筆：媽媽補身高、爸爸補頭圍，後到
 * 的那一筆連著他手上沒有身高的舊版蓋回去，媽媽剛量的身高就沒了，而且存進
 * 去的百分位對的是他手上那一版，不是資料庫裡真的那一筆。
 *
 * 正式環境的配置是這樣的：GrowthChartsPage 在點下「編輯」那一刻留下
 * editingRecord，表單從它帶入每個欄位、送出時每個欄位都送（沒填的是
 * undefined）；同時 listener 一直在跑，對方存的合併結果會在表單還開著的時候
 * 抵達畫面。所以比對的基準只能是「表單打開時的那一版」——拿 listener 最新的
 * 那一版當基準，對方剛補的那一項在表單裡是空白，存下去就變成把它清掉。
 * 跟 DailyLogPage 拿 editingLog 給 dailyLogChanges 是同一件事。
 *
 * 百分位讀取時本來就會重算（見上面早產矯正那幾條），所以存那一份沒有任何
 * 讀取端在用。不存了、只寫真的改到的欄位，兩個人的測量就會合併，畫面上的
 * 百分位永遠對得上存著的數字。
 */
describe('兩位照顧者各補一項測量', () => {
  const child = { gender: 'male' as const, birthday: '2026-02-01' };

  /** 資料庫上那一筆：只量了體重。 */
  const weightOnly = () => ({
    id: 'g1',
    childId: 'c1',
    date: '2026-08-01',
    weight: 7.4,
  });

  /**
   * AddGrowthRecordModal 送出的形狀：每個欄位都送（連 childId），沒填的是
   * undefined，percentile 固定是 {}——「會由 hook 算」。
   */
  const submitted = (
    fields: Partial<GrowthRecord>,
  ): Omit<GrowthRecord, 'id'> => ({
    childId: 'c1',
    date: '2026-08-01',
    weight: undefined,
    height: undefined,
    headCircumference: undefined,
    notes: undefined,
    percentile: {},
    ...fields,
  });

  /** 開一個畫面，讀到 stored 這一份快照（其他開著的畫面也一起收到）。 */
  const openWith = (stored: Record<string, Partial<GrowthRecord>>) => {
    const { result } = renderHook(() => useGrowthTracking('A', user, child));

    act(() => subscription('A').next({ val: () => stored }));

    return result;
  };

  /** 把每一筆寫入依序套到資料庫上那一筆：set 整筆換掉，update 逐條合併。 */
  const stored = () =>
    journal
      .filter((entry) => entry.path === 'childRecords/A/growthRecords/g1')
      .reduce<Partial<GrowthRecord>>((row, entry) => {
        if (entry.kind === 'set') {
          return entry.value as Partial<GrowthRecord>;
        }

        return applyUpdatePaths(row, entry.value as Record<string, unknown>);
      }, weightOnly());

  /** 媽媽的表單開在只有體重的那一版上；爸爸補了身高，合併結果已經推到她畫面上。 */
  const dadAddedHeightWhileMumEdits = async () => {
    const mum = openWith({ g1: weightOnly() });
    const mumOpened = weightOnly();

    const dad = openWith({ g1: weightOnly() });

    await act(async () => {
      await dad.current.updateRecord(
        'g1',
        submitted({ weight: 7.4, height: 68 }),
        weightOnly(),
      );
    });

    expect(stored()).toEqual({ ...weightOnly(), height: 68 });

    // listener 把合併後的那一筆推給每個開著的畫面，媽媽的表單還開著。
    act(() => subscription('A').next({ val: () => ({ g1: stored() }) }));
    // 這一行是整組測試的前提：爸爸的身高已經在媽媽的畫面上，而她的表單沒有。
    // 廣播若退化成一條路徑一個 listener，新舊程式都什麼都不寫，下面三條就沒有牙齒。
    expect(mum.current.records[0].height).toBe(68);

    return { mum, mumOpened };
  };

  it('對方刪掉這一筆之後，從還開著的表單存下去要被擋掉，不會把它寫回來', async () => {
    // 比對的基準是表單打開時那一版，但「這一筆還在不在」只有畫面上最新的那一版
    // 知道。沒有這道檢查，PATCH 打在已經不存在的節點上會被規則收下（合併後有
    // date 就夠），寫回來的那一筆沒有 id——列表以 undefined 當 key，刪除鍵指向
    // growthRecords/undefined，一筆誰都刪不掉的健康紀錄。
    const mum = openWith({ g1: weightOnly() });
    const mumOpened = weightOnly();

    // 爸爸刪掉了 g1；快照推到媽媽畫面上，她的表單還開著。
    act(() => subscription('A').next({ val: () => null }));
    expect(mum.current.records).toEqual([]);

    await expect(
      mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4, date: '2026-08-02' }),
        mumOpened,
      ),
    ).rejects.toThrow('Record not found');

    expect(journal).toHaveLength(0);
  });

  it('表單開在舊版上、畫面已經收到對方的合併結果：原封不動存下去，什麼都不寫', async () => {
    const { mum, mumOpened } = await dadAddedHeightWhileMumEdits();

    await act(async () => {
      await mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4 }),
        mumOpened,
      );
    });

    expect(journal).toHaveLength(1);
    expect(stored()).toEqual({ ...weightOnly(), height: 68 });
  });

  it('從同一張舊表單補頭圍，只寫頭圍，兩項都留得住', async () => {
    const { mum, mumOpened } = await dadAddedHeightWhileMumEdits();

    await act(async () => {
      await mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4, headCircumference: 43 }),
        mumOpened,
      );
    });

    expect(updates[1].value).toEqual({ headCircumference: 43 });

    expect(stored()).toEqual({
      id: 'g1',
      childId: 'c1',
      date: '2026-08-01',
      weight: 7.4,
      height: 68,
      headCircumference: 43,
    });
  });

  it('畫面上的百分位是照存進去的那一筆算的，不是寫入者手上那一版', async () => {
    const { mum, mumOpened } = await dadAddedHeightWhileMumEdits();

    await act(async () => {
      await mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4, headCircumference: 43 }),
        mumOpened,
      );
    });

    // 兩筆寫入都不帶百分位：存那一份沒有讀取端在用，而它只會對得上寫入者手上那一版。
    for (const entry of journal) {
      expect(entry.value).not.toHaveProperty('percentile');

      expect(
        Object.keys(entry.value as object).some((path) =>
          path.startsWith('percentile'),
        ),
      ).toBe(false);
    }

    const row = stored();
    const viewer = openWith({ g1: row });

    const ageMonths = growthAgeMonths(
      { birthday: child.birthday },
      new Date(row.date as string),
    );

    const expected = (
      value: number,
      type: 'weight' | 'height' | 'headCircumference',
    ) =>
      calculatePercentile(
        calculateZScore({
          measurement: value,
          ageMonths: ageMonths,
          measurementType: type,
          gender: child.gender,
        }),
      );

    expect(viewer.current.records[0].percentile).toEqual({
      weight: expected(7.4, 'weight'),
      height: expected(68, 'height'),
      headCircumference: expected(43, 'headCircumference'),
    });
  });

  it('舊紀錄帶著存好的百分位：只改備註時，補丁裡完全沒有 percentile', async () => {
    // 寫入端不存百分位，不等於把舊紀錄存著的那一份清掉。
    const legacy = { ...weightOnly(), percentile: { weight: 45.3 } };
    const mum = openWith({ g1: legacy });

    await act(async () => {
      await mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4, notes: '門診量的' }),
        legacy,
      );
    });

    expect(updates[0].value).toEqual({ notes: '門診量的' });

    expect(applyUpdatePaths(legacy, updates[0].value).percentile).toEqual({
      weight: 45.3,
    });
  });

  it('清掉備註就是清掉：寫 null，不是留著舊值', async () => {
    const withNote = { ...weightOnly(), notes: '在家量的' };
    const mum = openWith({ g1: withNote });

    await act(async () => {
      await mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4, notes: undefined }),
        withNote,
      );
    });

    expect(updates[0].value).toEqual({ notes: null });
    expect(applyUpdatePaths(withNote, updates[0].value)).toEqual(weightOnly());
  });

  it('什麼都沒改就不寫', async () => {
    const mum = openWith({ g1: weightOnly() });

    await act(async () => {
      await mum.current.updateRecord(
        'g1',
        submitted({ weight: 7.4 }),
        weightOnly(),
      );
    });

    expect(journal).toHaveLength(0);
  });

  it('新增時不存百分位；讀回來時照孩子檔案算', async () => {
    const mum = openWith({});

    await act(async () => {
      await mum.current.addRecord({
        childId: 'A',
        date: '2026-08-01',
        weight: 6.4,
        percentile: {},
      });
    });

    expect(writes).toHaveLength(1);
    expect(writes[0].value).not.toHaveProperty('percentile');

    const viewer = openWith({
      [writes[0].value.id as string]: writes[0].value,
    });

    expect(viewer.current.records[0].percentile?.weight).toBeDefined();
  });
});
