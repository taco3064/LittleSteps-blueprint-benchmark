import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { useFirebaseCollection } from './index';

/**
 * 兩件會被家長看見的事：
 *
 * 1. 換孩子時只設 loading、不清 data，新孩子的快照抵達之前，畫面上是上一個
 *    孩子的餵奶、尿布與睡眠，標題卻已經換成新孩子的名字。
 * 2. 讀取被拒或斷線時把錯誤解析成空集合，畫面就說「今天還沒有記錄」——把
 *    一次失敗講成一個事實。
 */

type Next = (snapshot: { val: () => unknown }) => void;
type Cancel = (error: Error) => void;

const subscriptions = new Map<string, { next: Next; cancel: Cancel }>();

vi.mock('firebase/database', () => ({
  ref: (_db: unknown, path: string) => path,
  onValue: (path: string, next: Next, cancel: Cancel) => {
    subscriptions.set(path, { next, cancel });

    return () => subscriptions.delete(path);
  },
}));

vi.mock('../../../platform/services/firebase/firebase', () => ({ database: {} }));

const user = { uid: 'u1' } as User;

const logsOf = (childId: string | null) => ({
  firebasePath: `childRecords/${childId}/dailyLogs`,
  empty: [] as string[],
  fromFirebase: (data: unknown) =>
    data ? (Object.values(data as object) as string[]) : [],
});

const subscription = (childId: string) => {
  const entry = subscriptions.get(`childRecords/${childId}/dailyLogs`);

  if (!entry) {
    throw new Error(`沒有訂閱 ${childId}`);
  }

  return entry;
};

beforeEach(() => {
  subscriptions.clear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useFirebaseCollection', () => {
  it('換孩子時先清空 data，不會把上一個孩子的紀錄掛在新孩子名下', () => {
    const { result, rerender } = renderHook(
      ({ childId }: { childId: string }) =>
        useFirebaseCollection(childId, user, logsOf(childId)),
      { initialProps: { childId: 'A' } },
    );

    act(() => subscription('A').next({ val: () => ({ k1: '小豆的餵奶' }) }));
    expect(result.current.data).toEqual(['小豆的餵奶']);

    rerender({ childId: 'B' });

    expect(result.current.data).toEqual([]);
    expect(result.current.loading).toBe(true);

    act(() => subscription('B').next({ val: () => ({ k1: '小樹的餵奶' }) }));
    expect(result.current.data).toEqual(['小樹的餵奶']);
  });

  it('讀取失敗時回報 error，不會把失敗當成空集合', () => {
    const { result } = renderHook(() => useFirebaseCollection('A', user, logsOf('A')));

    act(() => subscription('A').cancel(new Error('permission_denied')));

    expect(result.current.error).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it('已經讀到的紀錄不會因為後來的失敗被抹掉', () => {
    const { result } = renderHook(() => useFirebaseCollection('A', user, logsOf('A')));

    act(() => subscription('A').next({ val: () => ({ k1: '一筆記錄' }) }));
    expect(result.current.error).toBe(false);

    act(() => subscription('A').cancel(new Error('permission_denied')));

    expect(result.current.error).toBe(true);
    expect(result.current.data).toEqual(['一筆記錄']);
  });

  it('沒有孩子時不訂閱，也不停在載入中', () => {
    const { result } = renderHook(() =>
      useFirebaseCollection(null, user, logsOf(null)),
    );

    expect(subscriptions.size).toBe(0);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(false);
    expect(result.current.data).toEqual([]);
  });
});
