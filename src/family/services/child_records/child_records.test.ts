import { createSubmitFeedback } from '../../../feedback/services/submit_feedback/index';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { User } from 'firebase/auth';
import type {
  DailyLog,
  FeedingData,
  FoodTrialInput,
  FoodTrialRecord,
} from '../../domain/familyRecords/index';
import { createChildRecords } from './index';
import { applyUpdatePaths } from '../../../../test-support/rtdb';
import {
  trialDatePatch,
  trialDateSet,
  trialDatesOf,
} from '../../../littlesteps/domain/foodTrialDates/index';
// 補丁是在頁面那一端算出來的，合不合併要連著它一起驗才算數。
import { dailyLogChanges } from '../../../littlesteps/domain/logHelpers/index';
import { foodTrialChanges } from '../../../littlesteps/domain/foodTrialEdit/index';
// 讀與寫必須指向同一個子樹，所以那兩個 listener 一起在這裡驗。
import { useDailyLogs } from '../../../littlesteps/hooks/useDailyLogs/useDailyLogs';
import { useDiary } from '../../../littleexplorer/hooks/useDiary/useDiary';

/**
 * 三種會靜靜吃掉資料的寫入方式：
 *
 * 1. 建檔曾經是三筆循序 set。孩子本體與自己的名單索引沒有一起落地，就會留下
 *    一份讀得到卻沒有任何入口指得到的檔案——名單、切換器上都沒有它。
 * 2. 新紀錄的 key 曾經是 Date.now()。共享的孩子有兩個家長，同一毫秒各寫一筆，
 *    後到的那筆直接蓋掉對方的。
 * 3. 刪除曾經是一連串 remove。規則裡的 root 是寫入前的資料庫，而
 *    childRecords/{childId} 的授權要去 children/{childId}/members 查成員，
 *    所以先刪本體的話後面幾筆會被拒——一份沒有人讀得到也刪不掉的健康紀錄。
 */

interface FakeRef {
  path: string;
}

const writes: { path: string; value: unknown }[] = [];
const updates: { path: string; value: Record<string, unknown> }[] = [];
const removals: string[] = [];
/** listener 訂閱過的路徑。 */
const subscriptions: string[] = [];
/** get() 讀過的路徑，依序。一次性讀取靠它證明自己只讀了該讀的那幾條。 */
const reads: string[] = [];
/** get() 讀得到什麼由每個測試自己擺；沒擺的路徑就是不存在。 */
const stored = new Map<string, unknown>();
/** 被規則拒絕的寫入路徑，用來模擬「對方沒有開放加入」。 */
const denied = new Set<string>();
/** 讀不到的路徑：成員資格被收回之後，讀本體就是這個樣子。 */
const unreadable = new Set<string>();
/** 有值時下一筆 update() 就用它拒絕；模擬規則擋下 root fan-out 的樣子。 */
let updateFailure: Error | null = null;
let pushSeq = 0;

vi.mock('firebase/database', () => ({
  ref: (_db: unknown, path = '') => ({ path }),
  // push() 的 key 由客戶端產生，含隨機位元；序號足以模擬「同一毫秒也不撞」。
  push: (parent: FakeRef) => {
    const key = `-Push${++pushSeq}`;

    return { path: `${parent.path}/${key}`, key };
  },
  onValue: (target: FakeRef) => {
    subscriptions.push(target.path);

    return () => {};
  },
  set: (target: FakeRef, value: unknown) => {
    if (denied.has(target.path)) {
      return Promise.reject(new Error('PERMISSION_DENIED'));
    }

    writes.push({ path: target.path, value });

    return Promise.resolve();
  },
  update: (target: FakeRef, value: Record<string, unknown>) => {
    if (updateFailure) {
      return Promise.reject(updateFailure);
    }

    updates.push({ path: target.path, value });

    return Promise.resolve();
  },
  serverTimestamp: () => ({ '.sv': 'timestamp' }),
  remove: (target: FakeRef) => {
    if (denied.has(target.path)) {
      return Promise.reject(new Error('PERMISSION_DENIED'));
    }

    removals.push(target.path);

    return Promise.resolve();
  },
  get: (target: FakeRef) => {
    reads.push(target.path);

    if (unreadable.has(target.path)) {
      return Promise.reject(new Error('PERMISSION_DENIED'));
    }

    const value = stored.get(target.path);

    return Promise.resolve({
      exists: () => value !== undefined,
      val: () => value ?? null,
    });
  },
}));

vi.mock('../../../platform/services/firebase/firebase', () => ({ database: {} }));

const feeding = (): Omit<DailyLog, 'id'> => ({
  childId: 'c1',
  type: 'feeding',
  timestamp: '2026-01-01T08:00:00.000Z',
  data: { feedingType: 'formula', amount: 120 },
  createdAt: '2026-01-01T08:00:00.000Z',
});

/** 表單送出的一筆新食物：嘗試日期是日期集合，不再是陣列（#89）。 */
const riceTrial = () => ({
  foodName: '米糊',
  firstTriedDate: '2026-01-01',
  trialDates: { '2026-01-01': true as const },
  hasAllergy: false,
});

/** 資料庫裡的一份孩子檔案，只放這組測試在意的欄位。 */
const storeChild = (members: string[], createdBy = 'u1') =>
  stored.set('children/c1', {
    id: 'c1',
    name: '小豆',
    createdBy,
    members: Object.fromEntries(members.map((uid) => [uid, true])),
    joinOpen: true,
  });

/** 值裡任何一層（含陣列元素）出現 undefined 的路徑；SDK 就是照這樣拒絕的。 */
const undefinedPaths = (value: unknown, path = ''): string[] => {
  if (value === undefined) {
    return [path];
  }

  if (value === null || typeof value !== 'object') {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) =>
    undefinedPaths(child, path ? `${path}.${key}` : key),
  );
};

const rootUpdate = () => {
  const root = updates.find((entry) => entry.path === '');

  if (!root) {
    throw new Error('沒有 root fan-out');
  }

  return root.value;
};

/**
 * 把最後一筆 update() 套到紀錄上，語意跟 Realtime Database 一樣：收到的每一
 * 個 key 就是一條路徑，那條路徑指到的節點整個換掉，沒有列到的節點不動。
 */
const applyLastUpdate = <T extends object>(record: T): T =>
  applyUpdatePaths(record, updates[updates.length - 1].value);

beforeEach(() => {
  writes.length = 0;
  updates.length = 0;
  removals.length = 0;
  subscriptions.length = 0;
  reads.length = 0;
  stored.clear();
  denied.clear();
  unreadable.clear();
  updateFailure = null;
  pushSeq = 0;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('addChild', () => {
  it('孩子本體與成員資格是同一筆原子寫入', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const childId = await result.current.addChild({
      name: '小豆',
      birthday: '2025-01-01',
      currentChildCount: 0,
    });

    expect(updates).toHaveLength(1);
    expect(updates[0].path).toBe('');

    expect(Object.keys(updates[0].value).sort()).toEqual(
      [
        `children/${childId}`,
        `users/u1/childrenIds/${childId}`,
        'users/u1/currentChildId',
      ].sort(),
    );

    expect(updates[0].value[`users/u1/childrenIds/${childId}`]).toBe(true);
    expect(updates[0].value['users/u1/currentChildId']).toBe(childId);
  });

  it('建立者在同一筆裡就是成員，否則連他自己都讀不回這個孩子', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const childId = await result.current.addChild({
      name: '小豆',
      birthday: '2025-01-01',
      currentChildCount: 0,
    });

    const profile = updates[0].value[`children/${childId}`] as Record<string, unknown>;

    expect(profile.members).toEqual({ u1: true });
    expect(profile.createdBy).toBe('u1');
  });

  it('joinOpen 一律寫成 false，不是留空', async () => {
    // 規則驗的是 isBoolean；欄位缺著的話分享視窗讀到 undefined，
    // 切換開關時會以為自己在改一個本來就存在的設定。
    const { result } = renderHook(() => createChildRecords('u1'));

    const childId = await result.current.addChild({
      name: '小豆',
      birthday: '2025-01-01',
      currentChildCount: 0,
    });

    const profile = updates[0].value[`children/${childId}`] as Record<string, unknown>;

    expect(profile.joinOpen).toBe(false);
  });

  it('孩子本體不再單獨 set；只有公開索引排在授權之後', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const childId = await result.current.addChild({
      name: '小豆',
      birthday: '2025-01-01',
      currentChildCount: 0,
    });

    expect(writes.map((write) => write.path)).toEqual([`childIndex/${childId}`]);
  });

  it('第二個孩子不會被搶去當前選取', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.addChild({
      name: '小樹',
      birthday: '2026-01-01',
      currentChildCount: 1,
    });

    expect(Object.keys(updates[0].value)).not.toContain('users/u1/currentChildId');
  });

  it('超過上限就不寫任何東西', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    await expect(
      result.current.addChild({
        name: '小三',
        birthday: '2026-01-01',
        currentChildCount: 2,
      }),
    ).rejects.toThrow(/最多/);

    expect(updates).toHaveLength(0);
    expect(writes).toHaveLength(0);
  });

  it('寶寶代碼是不可猜的 UUID', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const first = await result.current.addChild({
      name: '小豆',
      birthday: '2025-01-01',
      currentChildCount: 0,
    });

    const second = await result.current.addChild({
      name: '小樹',
      birthday: '2026-01-01',
      currentChildCount: 1,
    });

    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    expect(second).not.toBe(first);
  });
});

describe('joinChild', () => {
  beforeEach(() => {
    stored.set('childIndex/c1', true);
  });

  it('成員資格先落地，才寫自己的名單', async () => {
    // 反過來的話，第二筆掉了就是在名單上留一個永遠讀不到的 id；這個順序
    // 至少還剩一位成員，另一端的 listener 補得回索引。
    const { result } = renderHook(() => createChildRecords('u2'));

    await result.current.joinChild('c1', 0);

    expect(writes.map((write) => write.path)).toEqual([
      'children/c1/members/u2',
      'users/u2/childrenIds/c1',
    ]);

    expect(writes[0].value).toBe(true);
  });

  it('成員資格被拒時說的是「未開放加入」，不是「找不到代碼」', async () => {
    // 兩件事講成同一句話，家長會一直去核對一組沒有錯的代碼，
    // 而真正該做的是請對方把共享打開。
    denied.add('children/c1/members/u2');
    const { result } = renderHook(() => createChildRecords('u2'));

    await expect(result.current.joinChild('c1', 0)).rejects.toThrow(/未開放加入/);
  });

  it('成員資格被拒就不會在自己的名單上留下這個 id', async () => {
    denied.add('children/c1/members/u2');
    const { result } = renderHook(() => createChildRecords('u2'));

    await expect(result.current.joinChild('c1', 0)).rejects.toThrow();

    expect(writes).toHaveLength(0);
    expect(updates).toHaveLength(0);
  });

  it('代碼不存在時什麼都不寫', async () => {
    stored.delete('childIndex/c1');
    const { result } = renderHook(() => createChildRecords('u2'));

    await expect(result.current.joinChild('c1', 0)).rejects.toThrow(/找不到此寶寶代碼/);
    expect(writes).toHaveLength(0);
  });

  it('已經加入過就不再寫一次成員資格', async () => {
    stored.set('users/u2/childrenIds/c1', true);
    const { result } = renderHook(() => createChildRecords('u2'));

    await expect(result.current.joinChild('c1', 0)).rejects.toThrow(/已經加入/);
    expect(writes).toHaveLength(0);
  });
});

describe('deleteChild', () => {
  it('建立者刪除：本體、紀錄、索引、名單都在同一筆 fan-out 裡', async () => {
    // 規則裡的 root 是寫入前的資料庫。分成幾筆循序 remove 的話，本體一沒了
    // 就沒有人是成員，childRecords 與 childIndex 那兩筆會被拒——紀錄留在
    // 資料庫裡，而且再也沒有任何人讀得到或刪得掉。
    storeChild(['u1', 'u2']);
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.deleteChild('c1', ['c1', 'c2']);

    expect(updates).toHaveLength(1);
    expect(updates[0].path).toBe('');

    expect(rootUpdate()).toEqual({
      'children/c1': null,
      'childRecords/c1': null,
      'childIndex/c1': null,
      'users/u1/childrenIds/c1': null,
      'users/u1/currentChildId': 'c2',
    });

    expect(removals).toEqual([]);
  });

  it('其他成員刪除：交回成員資格，不動孩子本體', async () => {
    // 只清掉自己的 childrenIds 的話，那只是從自己的名單上藏起來，
    // 讀寫這份健康紀錄的權限還在。
    storeChild(['u1', 'u2']);
    const { result } = renderHook(() => createChildRecords('u2'));

    await result.current.deleteChild('c1', ['c1']);

    expect(rootUpdate()).toEqual({
      'children/c1/members/u2': null,
      'users/u2/childrenIds/c1': null,
      'users/u2/currentChildId': null,
    });
  });

  it('最後一位成員即使不是建立者，也要整份刪掉', async () => {
    // 建立者現在走得掉（規則只要求成員數不歸零），所以名單上最後一位可能不是他。
    // 這時只交回自己的成員資格的話，名單會歸零——留下一份沒有任何人是成員、
    // 再也讀不到也刪不掉的健康紀錄。
    storeChild(['u2'], 'u1');
    const { result } = renderHook(() => createChildRecords('u2'));

    await result.current.deleteChild('c1', ['c1']);

    expect(rootUpdate()).toEqual({
      'children/c1': null,
      'childRecords/c1': null,
      'childIndex/c1': null,
      'users/u2/childrenIds/c1': null,
      'users/u2/currentChildId': null,
    });
  });

  it('讀不到本體時仍然清得掉自己的名單', async () => {
    // 成員資格被別人收回之後就讀不到本體了。這時候還不能清名單的話，
    // 那位家長會永遠卡著一個讀不到、又刪不掉的項目。
    unreadable.add('children/c1');
    const { result } = renderHook(() => createChildRecords('u2'));

    await result.current.deleteChild('c1', ['c1', 'c3']);

    expect(rootUpdate()).toEqual({
      'users/u2/childrenIds/c1': null,
      'users/u2/currentChildId': 'c3',
    });
  });
});

/**
 * 匯出讀的是「這一刻的全部」，不是「接下來的每一次變動」。掛成 listener 的話，
 * 家長按一次匯出就替整段歷史開一條持續同步的訂閱，而那份資料只會被用一次。
 */
describe('readChildExport', () => {
  const storeRecords = () => {
    stored.set('childRecords/c1/dailyLogs', {
      '-A': {
        id: '-A',
        childId: 'c1',
        type: 'feeding',
        timestamp: '2026-01-01T08:00:00.000Z',
      },
      '-B': {
        id: '-B',
        childId: 'c1',
        type: 'diaper',
        timestamp: '2026-01-03T08:00:00.000Z',
      },
    });

    stored.set('childRecords/c1/diaryEntries', {
      '-C': {
        id: '-C',
        date: '2026-01-02',
        content: '翻身',
        createdAt: '2026-01-02T10:00:00.000Z',
      },
      '-D': {
        id: '-D',
        date: '2026-01-05',
        content: '長牙',
        createdAt: '2026-01-05T10:00:00.000Z',
      },
    });

    stored.set('childRecords/c1/growthRecords', {
      '-E': { id: '-E', childId: 'c1', date: '2026-01-04', weight: 6.4 },
      '-F': { id: '-F', childId: 'c1', date: '2026-01-06', weight: 6.6 },
    });
  };

  it('四條路徑各讀一次，而且沒有掛上任何 listener', async () => {
    storeChild(['u1']);
    storeRecords();
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.readChildExport('c1');

    expect(reads).toEqual([
      'children/c1',
      'childRecords/c1/dailyLogs',
      'childRecords/c1/diaryEntries',
      'childRecords/c1/growthRecords',
    ]);

    expect(subscriptions).toEqual([]);
  });

  it('三份紀錄照畫面上的順序給：新的在前', async () => {
    // 資料庫給的是 push key 的順序，那對打開檔案的家長沒有任何意義。
    storeChild(['u1']);
    storeRecords();
    const { result } = renderHook(() => createChildRecords('u1'));

    const source = await result.current.readChildExport('c1');

    expect(source.dailyLogs.map((log) => log.id)).toEqual(['-B', '-A']);
    expect(source.diaryEntries.map((entry) => entry.id)).toEqual(['-D', '-C']);
    expect(source.growthRecords.map((record) => record.id)).toEqual(['-F', '-E']);
  });

  it('一筆紀錄都沒有的孩子拿到三個空陣列', async () => {
    // 缺 key 的檔案，讀的人分不出「沒有紀錄」與「這個版本沒有這個欄位」。
    storeChild(['u1']);
    const { result } = renderHook(() => createChildRecords('u1'));

    const source = await result.current.readChildExport('c1');

    expect(source).toMatchObject({
      dailyLogs: [],
      diaryEntries: [],
      growthRecords: [],
    });

    expect(source.child.name).toBe('小豆');
  });

  it('讀不到孩子本體就失敗，不會匯出一個沒有孩子的檔案', async () => {
    // 空殼檔案要等到家長真的需要它的時候才會被發現，那時已經來不及。
    const { result } = renderHook(() => createChildRecords('u1'));

    await expect(result.current.readChildExport('c1')).rejects.toThrow(
      '找不到這個寶寶的資料',
    );
  });

  it('沒登入就不讀，一條路徑都不碰', async () => {
    const { result } = renderHook(() => createChildRecords(null));

    await expect(result.current.readChildExport('c1')).rejects.toThrow(
      'User not authenticated',
    );

    expect(reads).toEqual([]);
  });
});

/**
 * 刪帳號的資料端。三種孩子必須在同一筆 fan-out 裡處理完：規則驗的是寫入前的
 * root，分成幾筆的話，先落地的那幾筆會把後面的授權抽掉。
 */
describe('deleteAccountData', () => {
  const storeAccount = () => {
    stored.set('users/u1/childrenIds', { c1: true, c2: true, c3: true });

    // 只有我一個成員。
    stored.set('children/c1', {
      id: 'c1',
      name: '小豆',
      createdBy: 'u1',
      members: { u1: true },
    });

    // 別人建的、還有別人在用。
    stored.set('children/c2', {
      id: 'c2',
      name: '小樹',
      createdBy: 'u9',
      members: { u9: true, u1: true },
    });

    // 我建的，但還有別人在用。
    stored.set('children/c3', {
      id: 'c3',
      name: '小果',
      createdBy: 'u1',
      members: { u1: true, u2: true },
    });
  };

  it('三種孩子一起處理，全部收在同一筆 root fan-out 裡', async () => {
    storeAccount();
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.deleteAccountData();

    expect(updates).toHaveLength(1);
    expect(updates[0].path).toBe('');

    expect(rootUpdate()).toEqual({
      // 名單上只有我：整份消失，紀錄與索引跟著走。
      'children/c1': null,
      'childRecords/c1': null,
      'childIndex/c1': null,
      // 還有別人：只交回我的成員資格，孩子留給他們——我是不是建立者都一樣。
      'children/c2/members/u1': null,
      'children/c3/members/u1': null,
      'users/u1/childrenIds': null,
      'users/u1/currentChildId': null,
    });
  });

  it('刪完之後 users/{uid} 底下什麼都不剩', async () => {
    stored.set('users/u1/childrenIds', { c1: true });

    stored.set('children/c1', {
      id: 'c1',
      name: '小豆',
      createdBy: 'u1',
      members: { u1: true },
    });

    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.deleteAccountData();

    // 節流戳記進不了上面那一筆（規則只在它過期之後才允許刪），所以它是第二步。
    expect(removals).toEqual(['users/u1/lastFeedbackAt']);

    const before = {
      users: {
        u1: {
          childrenIds: { c1: true },
          currentChildId: 'c1',
          lastFeedbackAt: 1757000000000,
        },
        u2: { currentChildId: 'c9' },
      },
    };

    const after = applyUpdatePaths(before, {
      ...rootUpdate(),
      ...Object.fromEntries(removals.map((path) => [path, null])),
    });

    // 沒有子節點的節點就不存在了，所以整個 users/u1 消失；別人的帳號不動。
    expect(after).toEqual({ users: { u2: { currentChildId: 'c9' } } });
  });

  it('清不掉節流戳記時，帳號還是刪得掉', async () => {
    // 剛送出回饋的一分鐘內，規則不允許刪那個戳記。防灌水比清掉一個整數重要，
    // 所以這一步失敗只記 log——不能讓整個刪帳號跟著失敗。
    stored.set('users/u1/childrenIds', {});
    denied.add('users/u1/lastFeedbackAt');
    const { result } = renderHook(() => createChildRecords('u1'));

    await expect(result.current.deleteAccountData()).resolves.toBeUndefined();

    expect(rootUpdate()).toEqual({
      'users/u1/childrenIds': null,
      'users/u1/currentChildId': null,
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('讀不回來的孩子跳過，不會把整筆拖下水', async () => {
    // 成員資格已經被別人收回了：那一端沒有東西要清，而名單上那個殘留的 id
    // 反正整個 childrenIds 一起刪。混進去的話整筆會被規則拒絕，一個節點都清不掉。
    stored.set('users/u1/childrenIds', { c1: true });
    unreadable.add('children/c1');
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.deleteAccountData();

    expect(rootUpdate()).toEqual({
      'users/u1/childrenIds': null,
      'users/u1/currentChildId': null,
    });
  });
});

describe('revokeOtherMembers', () => {
  it('移除其他成員並關掉加入，自己留著', async () => {
    // 代碼已經在對方手上，所以收回不是換代碼而是刪成員；joinOpen 沒有一起關掉，
    // 對方下一秒就用手上的同一組代碼加回來。
    storeChild(['u1', 'u2', 'u3']);
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.revokeOtherMembers('c1');

    expect(updates).toHaveLength(1);
    expect(updates[0].path).toBe('children/c1');

    expect(updates[0].value).toEqual({
      joinOpen: false,
      'members/u2': null,
      'members/u3': null,
    });
  });

  it('建立者留在名單上，共同照顧者收回的是自己分享出去的人', async () => {
    // 規則現在允許移除任何一位成員（只要名單不歸零），所以留下建立者是產品上的
    // 決定：「收回分享」是把我分享出去的人請出去，不是把當初建檔的人趕走。
    storeChild(['u1', 'u2', 'u3']);
    const { result } = renderHook(() => createChildRecords('u2'));

    await result.current.revokeOtherMembers('c1');

    expect(updates[0].value).toEqual({ joinOpen: false, 'members/u3': null });
  });

  it('孩子已經不在了就說得出原因，而不是靜靜成功', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    await expect(result.current.revokeOtherMembers('c1')).rejects.toThrow(
      /找不到這個寶寶/,
    );

    expect(updates).toHaveLength(0);
  });
});

describe('setJoinOpen', () => {
  it('只寫 joinOpen 這一個欄位', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    await result.current.setJoinOpen('c1', true);

    expect(writes).toEqual([{ path: 'children/c1/joinOpen', value: true }]);
  });
});

describe('只增不減的三份紀錄住在 childRecords 底下', () => {
  it('日誌的新增、修改、刪除都走 childRecords', async () => {
    // 留在孩子本體裡的話，每一次換尿布都會把整段歷史重新推送給每一位家長。
    const { result } = renderHook(() => createChildRecords('u1'));

    const logId = await result.current.addDailyLog('c1', feeding());

    await result.current.updateDailyLog('c1', logId, {
      timestamp: '2026-01-01T09:00:00.000Z',
    });

    await result.current.deleteDailyLog('c1', logId);

    expect(writes[0].path).toBe(`childRecords/c1/dailyLogs/${logId}`);
    expect(updates[0].path).toBe(`childRecords/c1/dailyLogs/${logId}`);
    expect(removals).toEqual([`childRecords/c1/dailyLogs/${logId}`]);
  });

  it('日記的新增、修改、刪除都走 childRecords', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const entryId = await result.current.addDiaryEntry('c1', {
      childId: 'c1',
      date: '2026-01-01',
      content: '第一次翻身',
      createdAt: '2026-01-01T08:00:00.000Z',
    });

    await result.current.updateDiaryEntry('c1', entryId, { content: '改過的內容' });
    await result.current.deleteDiaryEntry('c1', entryId);

    expect(writes[0].path).toBe(`childRecords/c1/diaryEntries/${entryId}`);
    expect(updates[0].path).toBe(`childRecords/c1/diaryEntries/${entryId}`);
    expect(removals).toEqual([`childRecords/c1/diaryEntries/${entryId}`]);
  });

  it('食物嘗試留在孩子本體裡：那份有固定的食物清單當上限', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const foodId = await result.current.addFoodTrial('c1', riceTrial());

    expect(writes[0].path).toBe(`children/c1/foodTrackingProgress/${foodId}`);
  });

  it('過敏反應沒填補充說明時，寫出去的資料裡任何一層都沒有 undefined', async () => {
    // #91：表單把空白的補充說明送成 description: undefined，而 SDK 在陣列元素裡
    // 看到 undefined 會拒絕整筆寫入。任何一個家長第一次記過敏都會撞到。
    const { result } = renderHook(() => createChildRecords('u1'));

    const reaction = {
      type: 'rash' as const,
      severity: 'mild' as const,
      description: undefined,
      date: '2026-01-01',
    };

    const foodId = await result.current.addFoodTrial('c1', {
      ...riceTrial(),
      hasAllergy: true,
      allergyReactions: [reaction],
    });

    await result.current.updateFoodTrial('c1', foodId, {
      allergyReactions: [reaction],
    });

    expect(undefinedPaths(writes[0].value)).toEqual([]);
    expect(undefinedPaths(updates[0].value)).toEqual([]);
    // 反應本身要留著，而且還是陣列——它是整個寫成一個節點的。
    expect(updates[0].value.allergyReactions as unknown[]).toHaveLength(1);
  });

  it('日誌與日記的 listener 讀的就是寫進去的那條路徑', async () => {
    // 一邊搬了、另一邊沒搬的話，家長按下記錄之後畫面上什麼都沒有出現，
    // 而那筆資料其實好好地存在另一個地方——最難看出來的一種資料遺失。
    const user = { uid: 'u1' } as User;
    const { result } = renderHook(() => createChildRecords('u1'));

    const logId = await result.current.addDailyLog('c1', feeding());

    const entryId = await result.current.addDiaryEntry('c1', {
      childId: 'c1',
      date: '2026-01-01',
      content: '第一次翻身',
      createdAt: '2026-01-01T08:00:00.000Z',
    });

    renderHook(() => useDailyLogs('c1', user));
    renderHook(() => useDiary('c1', user));

    expect(subscriptions).toEqual([
      'childRecords/c1/dailyLogs',
      'childRecords/c1/diaryEntries',
    ]);

    expect(writes.map((write) => write.path)).toEqual([
      `childRecords/c1/dailyLogs/${logId}`,
      `childRecords/c1/diaryEntries/${entryId}`,
    ]);
  });
});

describe('submitFeedback', () => {
  // feedbacks 是唯一任何登入者都寫得進去的節點，規則靠 users/$uid/lastFeedbackAt
  // 限制每個帳號一分鐘一則，而那個戳記必須跟回饋在同一筆寫入裡。
  const feedback = () => ({
    title: '很好用',
    content: '謝謝',
    userId: 'u1',
    userEmail: 'a@example.com',
    userName: '小豆媽',
  });

  /** SDK 真的丟出來的樣子：message 以代碼開頭，code 是大寫的同一個代碼。 */
  const sdkError = (code: string) =>
    Object.assign(new Error(`${code}: Permission denied`), { code });

  it('回饋與自己的 lastFeedbackAt 是同一筆 root 更新，戳記交給伺服器', async () => {
    const { result } = renderHook(() => ({
      submitFeedback: createSubmitFeedback('u1'),
    }));

    const id = await result.current.submitFeedback(feedback());

    const root = rootUpdate();

    expect(root[`feedbacks/${id}`]).toMatchObject({
      id,
      title: '很好用',
      userId: 'u1',
    });

    expect(root['users/u1/lastFeedbackAt']).toEqual({ '.sv': 'timestamp' });
    expect(writes).toHaveLength(0);
  });

  it('被規則擋下時說的是「剛剛才送出過」，不是通用的失敗', async () => {
    updateFailure = sdkError('PERMISSION_DENIED');

    const { result } = renderHook(() => ({
      submitFeedback: createSubmitFeedback('u1'),
    }));

    await expect(result.current.submitFeedback(feedback())).rejects.toThrow(
      '剛剛才送出過一次，請稍後再試',
    );
  });

  it('其他錯誤給通用的一句，不把 SDK 的訊息丟給家長看', async () => {
    updateFailure = sdkError('NETWORK_ERROR');

    const { result } = renderHook(() => ({
      submitFeedback: createSubmitFeedback('u1'),
    }));

    await expect(result.current.submitFeedback(feedback())).rejects.toThrow(
      '提交失敗，請稍後再試',
    );
  });
});

describe('新紀錄的 key', () => {
  beforeEach(() => {
    // 兩個家長在同一毫秒各按一次「記錄」。
    vi.spyOn(Date, 'now').mockReturnValue(1_767_225_600_000);
  });

  it('同一毫秒的兩筆日誌各自存起來，不會互相覆蓋', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const first = await result.current.addDailyLog('c1', feeding());
    const second = await result.current.addDailyLog('c1', feeding());

    expect(first).not.toBe(second);

    expect(writes.map((write) => write.path)).toEqual([
      `childRecords/c1/dailyLogs/${first}`,
      `childRecords/c1/dailyLogs/${second}`,
    ]);
  });

  it('紀錄裡的 id 就是它的 key，之後才改得動、刪得掉', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const logId = await result.current.addDailyLog('c1', feeding());

    expect((writes[0].value as DailyLog).id).toBe(logId);
    expect(writes[0].path).toBe(`childRecords/c1/dailyLogs/${logId}`);
  });

  it('日記與食物嘗試同樣不會撞 key', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const entries = [
      await result.current.addDiaryEntry('c1', {
        childId: 'c1',
        date: '2026-01-01',
        content: '第一次翻身',
        createdAt: '2026-01-01T08:00:00.000Z',
      }),
      await result.current.addDiaryEntry('c1', {
        childId: 'c1',
        date: '2026-01-01',
        content: '第一次笑',
        createdAt: '2026-01-01T08:00:00.000Z',
      }),
    ];

    const foods = [
      await result.current.addFoodTrial('c1', riceTrial()),
      await result.current.addFoodTrial('c1', riceTrial()),
    ];

    expect(new Set([...entries, ...foods]).size).toBe(4);
  });
});

/**
 * 共享的孩子有兩位照顧者，兩個人同時開著同一筆紀錄本來就是這個 app 預期會發生
 * 的事（見 joinChild 與 members）。整筆寫回去的話，後送出的那一筆會連著他當初
 * 讀到的舊值一起蓋過去，對方剛改的欄位就這樣不見了，而且兩邊都不會收到任何
 * 提示——紀錄只是自己變回去而已。
 */
describe('兩位照顧者同時改同一筆日誌', () => {
  const START = '2026-01-01T20:00:00.000Z';
  const END = '2026-01-01T21:20:00.000Z';

  /** 資料庫上那一筆睡眠：已經開始，還沒結束。 */
  const openSleep = (): DailyLog => ({
    id: 'log1',
    childId: 'c1',
    type: 'sleep',
    timestamp: START,
    data: { startTime: START },
    createdAt: START,
  });

  /** 資料庫上那一筆餵奶，備註還在。 */
  const feedingWithNote = (): DailyLog => ({
    id: 'log2',
    childId: 'c1',
    type: 'feeding',
    timestamp: START,
    data: { feedingType: 'formula', amount: 120, notes: '吐了一點' },
    createdAt: START,
  });

  it('各改各的欄位時，兩個人的修改都留得住', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    let record = openSleep();

    // 媽媽按下「醒了」，寫的是結束時間與時長。
    await result.current.updateDailyLog('c1', 'log1', {
      data: { endTime: END, duration: 80 },
    });

    record = applyLastUpdate(record);

    // 爸爸畫面上還是關掉之前的那一版，他補的是備註。
    const onHisScreen = openSleep();

    const hisEdit = {
      ...onHisScreen,
      data: { startTime: START, notes: '哭了很久才睡' },
    };

    await result.current.updateDailyLog(
      'c1',
      'log1',
      dailyLogChanges(onHisScreen, hisEdit),
    );

    record = applyLastUpdate(record);

    expect(record.data).toEqual({
      startTime: START,
      endTime: END,
      duration: 80,
      notes: '哭了很久才睡',
    });
  });

  it('編輯不會把另一位照顧者剛清掉的欄位救回來', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    // 媽媽已經把備註刪掉了：資料庫上這一筆沒有 notes。
    let record: DailyLog = {
      ...feedingWithNote(),
      data: { feedingType: 'formula', amount: 120 },
    };

    // 爸爸的表單是備註還在的時候打開的，他只改了奶量。
    const onHisScreen = feedingWithNote();

    const hisEdit = {
      ...onHisScreen,
      data: { feedingType: 'formula' as const, amount: 150, notes: '吐了一點' },
    };

    await result.current.updateDailyLog(
      'c1',
      'log2',
      dailyLogChanges(onHisScreen, hisEdit),
    );

    record = applyLastUpdate(record);

    expect(record.data).toEqual({ feedingType: 'formula', amount: 150 });
  });

  it('家長把備註清掉就是真的清掉，不是留著舊值', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    let record = feedingWithNote();

    const hers = feedingWithNote();

    const herEdit = {
      ...hers,
      data: { feedingType: 'formula' as const, amount: 120, notes: undefined },
    };

    await result.current.updateDailyLog('c1', 'log2', dailyLogChanges(hers, herEdit));
    record = applyLastUpdate(record);

    expect((record.data as FeedingData).notes).toBeUndefined();
  });

  it('什麼都沒改就不寫，連 updatedAt 都不動', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    const unchanged = feedingWithNote();

    await result.current.updateDailyLog(
      'c1',
      'log2',
      dailyLogChanges(unchanged, { ...unchanged }),
    );

    expect(updates).toHaveLength(0);
  });
});

/**
 * #89：同一種食物、同一天，兩位照顧者各按一次「記錄今天嘗試」。嘗試日期原本
 * 是整個陣列重寫，後到的那筆連著自己手上的舊清單把對方那一天蓋掉。改成以日期
 * 為 key 的集合、一天一條 leaf 之後，update() 逐條合併。
 *
 * 舊紀錄不搬：陣列在資料庫裡本來就是 0、1、… 為 key 的物件，多記一天之後兩種
 * key 並存在同一個節點上，讀的那一端靠 trialDatesOf 整理。
 */
describe('兩位照顧者同一天各記一次嘗試', () => {
  const ISO = '2026-09-01T08:00:00.000Z';

  /** 資料庫上一筆舊形狀的紀錄：嘗試日期還是陣列。 */
  const legacyRice = (): FoodTrialRecord => ({
    id: 'f1',
    foodName: '米糊',
    firstTriedDate: '2026-09-01',
    trialDates: ['2026-09-01', '2026-09-02'],
    hasAllergy: false,
    createdAt: ISO,
  });

  it('各記一天，兩天都留得住，舊的索引也還在', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    let record = legacyRice();

    // 媽媽記今天。
    await result.current.updateFoodTrial('c1', 'f1', {
      trialDates: { '2026-09-06': true },
    });

    record = applyLastUpdate(record);

    // 爸爸的畫面還是媽媽存之前的那一版，他補記的是昨天。
    await result.current.updateFoodTrial('c1', 'f1', {
      trialDates: { '2026-09-05': true },
    });

    record = applyLastUpdate(record);

    expect(record.trialDates).toEqual({
      0: '2026-09-01',
      1: '2026-09-02',
      '2026-09-05': true,
      '2026-09-06': true,
    });

    expect(trialDatesOf(record)).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-05',
      '2026-09-06',
    ]);
  });

  it('同一天各按一次，是同一條 leaf，只算一天', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    let record = legacyRice();

    await result.current.updateFoodTrial('c1', 'f1', {
      trialDates: { '2026-09-06': true },
    });

    record = applyLastUpdate(record);

    await result.current.updateFoodTrial('c1', 'f1', {
      trialDates: { '2026-09-06': true },
    });

    record = applyLastUpdate(record);

    expect(trialDatesOf(record)).toEqual(['2026-09-01', '2026-09-02', '2026-09-06']);

    for (const entry of updates) {
      expect(Object.keys(entry.value).sort()).toEqual([
        'trialDates/2026-09-06',
        'updatedAt',
      ]);
    }
  });

  it('編輯表單從舊版存下去，不會洗掉對方剛記的那一天', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    let record = legacyRice();

    // 媽媽記了今天。
    await result.current.updateFoodTrial('c1', 'f1', {
      trialDates: { '2026-09-06': true },
    });

    record = applyLastUpdate(record);

    // 爸爸的表單是媽媽存之前開的，他把 9/1 拿掉、順手改了備註。
    const onHisScreen = legacyRice();

    await result.current.updateFoodTrial('c1', 'f1', {
      notes: '有點軟便',
      trialDates: trialDatePatch(onHisScreen.trialDates, ['2026-09-02']),
    });

    record = applyLastUpdate(record);

    expect(trialDatesOf(record)).toEqual(['2026-09-02', '2026-09-06']);
    expect(record.notes).toBe('有點軟便');
    // 拿掉的是舊的索引 key，留下的索引沒有被重寫。
    expect(record.trialDates).toEqual({ 1: '2026-09-02', '2026-09-06': true });
  });
});

/**
 * #104：同一筆食物紀錄，兩位照顧者各改各的欄位。編輯以前是把表單上的整筆送
 * 出去，後到的那筆連著自己開表單時讀到的舊值一起蓋回去；而被清空的欄位送出
 * 來是 undefined，寫入前被 removeUndefined 濾掉，舊值就這樣原封不動留著。
 * 補丁改成跟「打開表單當下那一版」比出來的差集之後，沒改到的欄位不寫，被清
 * 掉的欄位寫 null。
 *
 * 驗的是資料庫最後會長什麼樣：補丁本身在 littlesteps/utils/foodTrialEdit 那
 * 邊逐條驗過，這裡把它套回紀錄上，看兩個人的修改有沒有真的都留下來。
 */
describe('兩位照顧者同時改同一筆食物紀錄', () => {
  const ISO = '2026-09-01T08:00:00.000Z';

  /** 資料庫上那一版，也是兩個人各自打開表單時看到的那一版。 */
  const rice = (): FoodTrialRecord => ({
    id: 'f1',
    foodName: '米糊',
    category: '穀類',
    firstTriedDate: '2026-09-01',
    trialDates: { '2026-09-01': true },
    hasAllergy: false,
    preference: 'like',
    notes: '吃得很快',
    createdAt: ISO,
  });

  /** 表單送出的形狀：嘗試日期是集合，其餘欄位照著螢幕上那一版原封送回。 */
  const asSubmitted = (
    onScreen: FoodTrialRecord,
    edits: Partial<FoodTrialInput> = {},
  ): FoodTrialInput => ({
    foodName: onScreen.foodName,
    category: onScreen.category,
    firstTriedDate: onScreen.firstTriedDate,
    trialDates: trialDateSet(trialDatesOf(onScreen)),
    hasAllergy: onScreen.hasAllergy,
    allergyReactions: onScreen.allergyReactions,
    preference: onScreen.preference,
    notes: onScreen.notes,
    updatedAt: '2026-09-07T09:00:00.000Z',
    ...edits,
  });

  it('一個人清掉備註、一個人改喜好度，兩邊都算數', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));
    let record = rice();

    // 媽媽把備註刪掉。
    const onHerScreen = rice();

    await result.current.updateFoodTrial(
      'c1',
      'f1',
      foodTrialChanges(onHerScreen, asSubmitted(onHerScreen, { notes: undefined })),
    );

    record = applyLastUpdate(record);

    // 爸爸的表單是媽媽存之前開的，備註在他螢幕上還在，他只改了喜好度。
    const onHisScreen = rice();

    await result.current.updateFoodTrial(
      'c1',
      'f1',
      foodTrialChanges(onHisScreen, asSubmitted(onHisScreen, { preference: 'love' })),
    );

    record = applyLastUpdate(record);

    expect(record.preference).toBe('love');
    expect(record.notes).toBeUndefined();
  });

  it('清掉的備註是寫 null，不是整個欄位不送', async () => {
    // 不送等於不碰：舊值留在資料庫裡，下次打開表單那句備註又回來了。
    const { result } = renderHook(() => createChildRecords('u1'));
    const onScreen = rice();

    await result.current.updateFoodTrial(
      'c1',
      'f1',
      foodTrialChanges(onScreen, asSubmitted(onScreen, { notes: undefined })),
    );

    expect(Object.keys(updates[0].value).sort()).toEqual(['notes', 'updatedAt']);
    expect(updates[0].value.notes).toBeNull();
  });

  it('關掉過敏，存著的過敏反應真的跟著不見', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const onScreen: FoodTrialRecord = {
      ...rice(),
      hasAllergy: true,
      allergyReactions: [{ type: 'rash', severity: 'mild', date: '2026-09-02' }],
    };

    await result.current.updateFoodTrial(
      'c1',
      'f1',
      foodTrialChanges(
        onScreen,
        asSubmitted(onScreen, { hasAllergy: false, allergyReactions: undefined }),
      ),
    );

    const record = applyLastUpdate(onScreen);

    expect(record.hasAllergy).toBe(false);
    expect(record.allergyReactions).toBeUndefined();
  });

  it('把唯一一筆過敏反應移掉，開關留著，紀錄上也不會剩一份空清單', async () => {
    // 空陣列在 Realtime Database 裡就是「沒有這個節點」，跟 null 同一件事。
    const { result } = renderHook(() => createChildRecords('u1'));

    const onScreen: FoodTrialRecord = {
      ...rice(),
      hasAllergy: true,
      allergyReactions: [{ type: 'rash', severity: 'mild', date: '2026-09-02' }],
    };

    await result.current.updateFoodTrial(
      'c1',
      'f1',
      foodTrialChanges(onScreen, asSubmitted(onScreen, { allergyReactions: [] })),
    );

    const record = applyLastUpdate(onScreen);

    expect(record.hasAllergy).toBe(true);
    expect(record.allergyReactions).toBeUndefined();
  });

  it('對方剛加的過敏反應，不會被一張沒動到清單的表單洗掉', async () => {
    const { result } = renderHook(() => createChildRecords('u1'));

    const reaction = {
      type: 'rash' as const,
      severity: 'mild' as const,
      date: '2026-09-02',
    };

    let record: FoodTrialRecord = {
      ...rice(),
      hasAllergy: true,
      allergyReactions: [reaction],
    };

    // 媽媽補了第二筆反應。
    const added = {
      type: 'cough' as const,
      severity: 'moderate' as const,
      date: '2026-09-06',
    };

    await result.current.updateFoodTrial('c1', 'f1', {
      allergyReactions: [reaction, added],
    });

    record = applyLastUpdate(record);

    // 爸爸的表單只有第一筆，他改的是分類——清單整個是一條 leaf，重送就蓋掉。
    const onHisScreen: FoodTrialRecord = {
      ...rice(),
      hasAllergy: true,
      allergyReactions: [{ ...reaction }],
    };

    await result.current.updateFoodTrial(
      'c1',
      'f1',
      foodTrialChanges(onHisScreen, asSubmitted(onHisScreen, { category: '蛋白質' })),
    );

    record = applyLastUpdate(record);

    expect(record.allergyReactions).toEqual([reaction, added]);
    expect(record.category).toBe('蛋白質');
  });
});
