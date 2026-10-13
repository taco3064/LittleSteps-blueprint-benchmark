import { act, renderHook } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserChildren } from './useUserChildren';

/**
 * 這個 hook 用兩層 onValue：先聽 users/{uid} 拿到 childrenIds，再對每個孩子
 * 各開一個 onValue。
 *
 * 陷阱是內層的訂閱原本寫在外層 callback 裡 return 一個清理函式——但 onValue
 * 的 callback 回傳值 Firebase 不看，那個清理永遠不會被呼叫。每次 users/{uid}
 * 有任何變動（換孩子、新增、刪除都會寫這個節點）就再疊一整組 listener 上去，
 * 舊的那組還活著，而且各自握著自己那份過期的 loadedChildren。
 *
 * 後果不只是洩漏：舊 closure 被觸發時會用它自己那份舊名單去 setChildren，
 * 於是剛新增的孩子可能從畫面上消失，或剛刪掉的又跑回來。
 */

type Listener = (snapshot: { exists: () => boolean; val: () => unknown }) => void;
type Cancel = (error: Error) => void;

const listeners = new Map<string, Set<{ next: Listener; cancel?: Cancel }>>();
/** Firebase 訂閱時會立刻用目前的值回呼一次，mock 必須照做，否則測不到
    「先拿到 childrenIds、再訂閱每個孩子」這個真實順序。 */
const values = new Map<string, unknown>();

const snapshot = (value: unknown) => ({
  exists: () => value !== null && value !== undefined,
  val: () => value,
});

/** 觸發某個路徑上所有還活著的 listener，就像 Firebase 那樣。 */
const emit = (path: string, value: unknown) => {
  values.set(path, value);

  for (const listener of listeners.get(path) ?? []) {
    listener.next(snapshot(value));
  }
};

/** 讀取被拒或斷線：Firebase 走的是第三個參數，而不是回一份空快照。 */
const fail = (path: string) => {
  for (const listener of listeners.get(path) ?? []) {
    listener.cancel?.(new Error('permission_denied'));
  }
};

const listenerCount = (path: string) => listeners.get(path)?.size ?? 0;

// vi.mock 的 factory 在 import 期就跑，所以這兩個 mock 必須一起提前。
const { removeMock, setMock } = vi.hoisted(() => ({
  removeMock: vi.fn().mockResolvedValue(undefined),
  // 補 childIndex 用的；缺這一個，listener 一跑就整組炸掉。
  setMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('firebase/database', () => ({
  ref: (_db: unknown, path: string) => path,
  onValue: (path: string, next: Listener, cancel?: Cancel) => {
    if (!listeners.has(path)) {
      listeners.set(path, new Set());
    }

    const entry = { next, cancel };

    listeners.get(path)!.add(entry);

    if (values.has(path)) {
      next(snapshot(values.get(path)));
    }

    return () => listeners.get(path)!.delete(entry);
  },
  remove: removeMock,
  set: setMock,
}));

vi.mock('~app/services/firebase', () => ({ database: {} }));

const user = { uid: 'u1' } as User;
const child = (id: string, name: string) => ({ id, name, birthday: '2025-01-01' });

beforeEach(() => {
  listeners.clear();
  values.clear();
  removeMock.mockClear();
  setMock.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useUserChildren', () => {
  it('users 節點再次變動時，不會把每個孩子的 listener 疊第二層', () => {
    renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
    });

    expect(listenerCount('children/A')).toBe(1);

    // 換一個當前孩子、或新增一個孩子，都會再寫一次 users/u1。
    act(() => {
      emit('users/u1', { childrenIds: { A: true, B: true }, currentChildId: 'B' });
    });

    // A 只應該有一個 listener。原本的寫法會變成兩個，而且舊的那個握著
    // 只有 A 的名單，之後任何對 A 的寫入都會把 B 從畫面上抹掉。
    expect(listenerCount('children/A')).toBe(1);
  });

  it('新增第二個孩子之後，對第一個孩子的寫入不會讓第二個消失', () => {
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
    });

    expect(result.current.children).toHaveLength(1);

    act(() => {
      emit('users/u1', { childrenIds: { A: true, B: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
      emit('children/B', child('B', '小樹'));
    });

    expect(result.current.children).toHaveLength(2);

    // 勾一個里程碑就會寫 children/A。
    act(() => {
      emit('children/A', child('A', '小豆'));
    });

    expect(result.current.children.map((c) => c.id).sort()).toEqual(['A', 'B']);
  });

  it('孩子被移除後就從名單消失，不會因為舊 listener 又冒出來', () => {
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true, B: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
      emit('children/B', child('B', '小樹'));
    });

    expect(result.current.children).toHaveLength(2);

    act(() => {
      emit('users/u1', { childrenIds: { A: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
    });

    expect(result.current.children.map((c) => c.id)).toEqual(['A']);
  });

  it('childCount 數的是名單上的 id，不是已經載入的孩子', () => {
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true, B: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
    });

    // B 還沒回報：畫面上只有一個孩子，名額卻已經用掉兩個。用 children.length
    // 檢查上限的話，這一刻新增第三個孩子會過關。
    expect(result.current.children).toHaveLength(1);
    expect(result.current.childCount).toBe(2);
    expect(result.current.loading).toBe(true);
  });

  it('讀不到名單時不會永遠停在載入中，而且說得出是讀取失敗', () => {
    const { result } = renderHook(() => useUserChildren(user));

    expect(result.current.loading).toBe(true);

    act(() => fail('users/u1'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(true);
    expect(result.current.children).toEqual([]);
  });

  it('某個孩子讀不到時載入照樣結束，但不會把它從自己的名單裡退掉', () => {
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true, B: true }, currentChildId: 'B' });
      emit('children/A', child('A', '小豆'));
    });

    expect(result.current.loading).toBe(true);

    act(() => fail('children/B'));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(true);
    expect(result.current.childCount).toBe(2);
    // 讀不到不等於不存在。當成不存在的話，這裡會順手刪掉 childrenIds/B 與
    // currentChildId——一次斷線就把孩子退掉了。共享被收回時收到的也是同一種
    // permission_denied，退掉的話家長只會看到孩子無聲消失。
    expect(removeMock).not.toHaveBeenCalled();
    expect(result.current.currentChildId).toBe('B');
  });

  it('孩子節點沒有 members 時補一個空物件', () => {
    // 分享視窗直接數 Object.keys(members).length；搬遷之前建立的孩子沒有這個
    // 節點，少了這層補齊，那份檔案一打開分享視窗就是一片白畫面。
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
    });

    expect(result.current.children[0].members).toEqual({});
  });

  it('有 members 就原樣帶出來，數得出實際有幾個人在共享', () => {
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true }, currentChildId: 'A' });
      emit('children/A', { ...child('A', '小豆'), members: { u1: true, u2: true } });
    });

    expect(result.current.children[0].members).toEqual({ u1: true, u2: true });
  });

  it('名單重新到齊之後，先前的讀取失敗不會一直掛著', () => {
    const { result } = renderHook(() => useUserChildren(user));

    act(() => {
      emit('users/u1', { childrenIds: { A: true, B: true }, currentChildId: 'A' });
      emit('children/A', child('A', '小豆'));
    });

    act(() => fail('children/B'));
    expect(result.current.error).toBe(true);

    act(() => {
      emit('users/u1', { childrenIds: { A: true }, currentChildId: 'A' });
    });

    expect(result.current.error).toBe(false);
    expect(result.current.childCount).toBe(1);
  });
});
