import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { User } from 'firebase/auth';
import type { ChildProfile } from '../../domain/familyRecords/index';
import { CHILD_LIMIT_MESSAGE } from '../../domain/childLimits/index';
import { useChildStore } from './index';

// Login is mandatory, so the store is Firebase-only. Mock the Firebase-backed
// hooks it composes and assert it delegates to them correctly.
const h = vi.hoisted(() => ({
  userChildren: {
    children: [] as ChildProfile[],
    currentChildId: null as string | null,
    loading: false,
    childCount: 0,
  },
  firebaseChildren: {
    addChild: vi.fn().mockResolvedValue(undefined),
    joinChild: vi.fn().mockResolvedValue(undefined),
    updateChild: vi.fn().mockResolvedValue(undefined),
    deleteChild: vi.fn().mockResolvedValue(undefined),
    revokeOtherMembers: vi.fn().mockResolvedValue(undefined),
    setJoinOpen: vi.fn().mockResolvedValue(undefined),
    setCurrentChild: vi.fn().mockResolvedValue(undefined),
    updateMilestoneProgress: vi.fn().mockResolvedValue(undefined),
    updateVaccineProgress: vi.fn().mockResolvedValue(undefined),
    updateDevelopmentProgress: vi.fn().mockResolvedValue(undefined),
    updateToothProgress: vi.fn().mockResolvedValue(undefined),
    upsertPrenatalRecord: vi.fn().mockResolvedValue(undefined),
    clearPrenatalRecord: vi.fn().mockResolvedValue(undefined),
    recordBirth: vi.fn().mockResolvedValue(undefined),
    upsertCareTaskRecord: vi.fn().mockResolvedValue(undefined),
    addDiaryEntry: vi.fn().mockResolvedValue('diary_1'),
    updateDiaryEntry: vi.fn().mockResolvedValue(undefined),
    deleteDiaryEntry: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../useUserChildren/useUserChildren', () => ({
  useUserChildren: () => h.userChildren,
}));

vi.mock('../../services/child_records/index', () => ({
  createChildRecords: () => h.firebaseChildren,
}));

vi.mock('../../services/telemetry/index', () => ({
  database: {},
  logMilestoneToggle: vi.fn(),
  logVaccineToggle: vi.fn(),
  logChildProfileAction: vi.fn(),
}));

// 每個失敗路徑都會 console.error；測試不需要看那些堆疊，但要能斷言它有記錄。
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

const user = { uid: 'u1' } as User;

const child = (overrides: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'c1',
  name: '小明',
  birthday: '2026-01-01',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2026-01-01T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...overrides,
});

/**
 * useUserChildren 的回傳值。childCount 預設等於 children.length——那是「全部都
 * 載入完了」的情況；要模擬還有孩子在載入中，就把它調高。
 */
const listing = (
  children: ChildProfile[],
  currentChildId: string | null = null,
  childCount = children.length,
) => ({ children, currentChildId, loading: false, childCount });

const bump = () =>
  child({
    id: 'p1',
    name: '寶寶',
    isPregnancy: true,
    pregnancyData: {
      childId: 'p1',
      dueDate: '2026-11-20',
      lastPeriodDate: '2026-02-13',
      status: 'active',
    },
  });

describe('useChildStore (Firebase mode)', () => {
  let alertSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    h.userChildren = listing([]);
    // ToastProvider 不在上層時 useToast 退回 window.alert，所以訊息看得到。
    alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
  });

  it('exposes children and the resolved current child from useUserChildren', () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    expect(result.current.childProfiles).toHaveLength(1);
    expect(result.current.currentChild?.name).toBe('小明');
    expect(result.current.currentChildId).toBe('c1');
  });

  it('delegates addChild to Firebase with the current child count', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addChild({
        name: '小華',
        birthday: '2026-02-02',
        gender: 'female',
      });
    });

    expect(h.firebaseChildren.addChild).toHaveBeenCalledWith({
      name: '小華',
      birthday: '2026-02-02',
      currentChildCount: 1,
      gender: 'female',
      dueDate: undefined,
      gestationalAge: undefined,
    });
  });

  it('傳給資料層的寶寶數是 childCount，不是已經載入的那幾個', async () => {
    // currentChildCount === 0 會讓資料層把新孩子自動設為 currentChildId。
    // 名下已經有一個、只是還沒載入完的時候傳 0，會把選取搶走。
    h.userChildren = listing([], null, 1);
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addChild({ name: '小華', birthday: '2026-02-02' });
      await result.current.joinChild('uuid-1');
    });

    expect(h.firebaseChildren.addChild).toHaveBeenCalledWith({
      name: '小華',
      birthday: '2026-02-02',
      currentChildCount: 1,
      gender: undefined,
      dueDate: undefined,
      gestationalAge: undefined,
    });

    expect(h.firebaseChildren.joinChild).toHaveBeenCalledWith('uuid-1', 1);
  });

  it('enforces the 2-child free-tier limit without calling Firebase', async () => {
    h.userChildren = listing([child(), child({ id: 'c2' })], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addChild({ name: '第三個', birthday: '2026-03-03' });
    });

    expect(h.firebaseChildren.addChild).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(CHILD_LIMIT_MESSAGE);
  });

  it('還有孩子在載入中時，第三個寶寶一樣被擋下來', async () => {
    // childProfiles 濾掉了 listener 還沒回報的孩子。上限若比那個陣列長度，
    // 名下已經有兩個、其中一個還在載入時，第三個就會被放進來。
    h.userChildren = listing([child()], 'c1', 2);
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addChild({ name: '第三個', birthday: '2026-03-03' });
      await result.current.joinChild('uuid-1');
    });

    expect(h.firebaseChildren.addChild).not.toHaveBeenCalled();
    expect(h.firebaseChildren.joinChild).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(CHILD_LIMIT_MESSAGE);
  });

  // 這是 LittleBloom 一直是空殼的根因：dueDate 從 AddChildModal 一路傳來，
  // 但中途兩層都只宣告 3 個參數，於是被靜默丟棄，pregnancyData 永遠寫不進去。
  it('forwards the due date so a pregnancy profile can actually be created', async () => {
    h.userChildren = listing([]);
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addChild({
        name: '小花',
        birthday: '2026-12-01',
        gender: undefined,
        dueDate: '2026-12-01',
      });
    });

    expect(h.firebaseChildren.addChild).toHaveBeenCalledWith({
      name: '小花',
      birthday: '2026-12-01',
      currentChildCount: 0,
      gender: undefined,
      dueDate: '2026-12-01',
      gestationalAge: undefined,
    });
  });

  it('omits the due date for a normal child profile', async () => {
    h.userChildren = listing([]);
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addChild({
        name: '小樹',
        birthday: '2024-08-27',
        gender: 'male',
      });
    });

    expect(h.firebaseChildren.addChild).toHaveBeenCalledWith({
      name: '小樹',
      birthday: '2024-08-27',
      currentChildCount: 0,
      gender: 'male',
      dueDate: undefined,
      gestationalAge: undefined,
    });
  });

  it('產檢紀錄寫向孕期檔案，即使現在選的是另一個寶寶', async () => {
    // 回報的情境：已經有寶寶檔案的家長新增孕期檔案，currentChildId 仍然
    // 指著寶寶。若寫入跟著 currentChild 走，產檢紀錄會落在寶寶的檔案上。
    h.userChildren = listing([child(), bump()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    expect(result.current.pregnancyChild?.id).toBe('p1');

    await act(async () => {
      await result.current.upsertPrenatalRecord('visit-1', {
        completedDate: '2026-03-01',
      });

      await result.current.clearPrenatalRecord('visit-1');
    });

    expect(h.firebaseChildren.upsertPrenatalRecord).toHaveBeenCalledWith(
      'p1',
      'visit-1',
      {
        completedDate: '2026-03-01',
      },
    );

    expect(h.firebaseChildren.clearPrenatalRecord).toHaveBeenCalledWith(
      'p1',
      'visit-1',
    );
  });

  it('改孕期檔案的日期時，pregnancyData 跟著改', async () => {
    // birthday 對孕期檔案來說就是預產期，但週數與 14 次產檢時程算的是
    // lastPeriodDate。只改 birthday 的話，照超音波修正預產期之後，
    // LittleBloom 會永遠停在舊的末次月經上。
    h.userChildren = listing([bump()], 'p1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.updateChild({
        id: 'p1',
        name: '寶寶',
        birthday: '2026-12-01',
      });
    });

    expect(h.firebaseChildren.updateChild).toHaveBeenCalledWith({
      childId: 'p1',
      name: '寶寶',
      birthday: '2026-12-01',
      gender: undefined,
      isPregnancy: true,
      gestationalAge: undefined,
    });
  });

  it('一般寶寶檔案不會被當成孕期檔案改寫', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.updateChild({
        id: 'c1',
        name: '小明',
        birthday: '2026-02-02',
      });
    });

    expect(h.firebaseChildren.updateChild).toHaveBeenCalledWith({
      childId: 'c1',
      name: '小明',
      birthday: '2026-02-02',
      gender: undefined,
      isPregnancy: false,
      gestationalAge: undefined,
    });
  });

  it('刪除當下選取的孩子時，把選取交給還在的那一個', async () => {
    // 少了這一步，currentChildId 會繼續指著已刪除的 id，明明還有另一個
    // 孩子，每一頁卻都顯示「還沒有寶寶資料，請新增」。
    h.userChildren = listing([child(), child({ id: 'c2', name: '小樹' })], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.deleteChild('c1');
    });

    expect(h.firebaseChildren.deleteChild).toHaveBeenCalledWith('c1', ['c1', 'c2']);
  });

  it('選到第二個孩子就給第二個，不是名單第一個', async () => {
    // 沒有這條，「永遠回傳第一個」也會全綠——而那正是切換器存在的理由。
    h.userChildren = listing(
      [child({ id: 'c1', name: '小明' }), child({ id: 'c2', name: '小華' })],
      'c2',
    );

    const { result } = renderHook(() => useChildStore(user));

    expect(result.current.currentChild?.id).toBe('c2');
    expect(result.current.currentChild?.name).toBe('小華');
  });

  it('currentChildId 指向已刪除的孩子時，改用還在的第一個', async () => {
    /**
     * 共享的孩子被建立者刪掉時，另一位家長的 childrenIds 由他自己那端自癒，
     * 但 currentChildId 仍然指著那個不存在的 id。currentChild 於是變成
     * undefined，每一頁都顯示「還沒有選擇寶寶」——即使他還有另一個孩子。
     *
     * 這正是 deleteChild 註解裡描述的情境，之前只在「執行刪除的那一端」修好。
     */
    h.userChildren = listing([child({ id: 'c2', name: '小華' })], 'c1'); // c1 已被建立者刪除

    const { result } = renderHook(() => useChildStore(user));

    expect(result.current.currentChild?.id).toBe('c2');
  });

  it('真的沒有孩子時不硬湊一個', async () => {
    h.userChildren = listing([], 'c1');

    const { result } = renderHook(() => useChildStore(user));

    expect(result.current.currentChild).toBeUndefined();
  });

  it('toggles a milestone, deriving the new achieved state', async () => {
    h.userChildren = listing(
      [child({ milestoneProgress: { m1: { achieved: false } } })],
      'c1',
    );

    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.toggleMilestone('m1');
    });

    expect(h.firebaseChildren.updateMilestoneProgress).toHaveBeenCalledWith(
      'c1',
      'm1',
      true,
    );
  });

  it('記錄一劑疫苗時，administered 與日期都照呼叫端說的寫', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.setVaccineDose({
        vaccineId: 'bcg',
        doseNumber: 1,
        administered: true,
        date: '2026-05-01',
      });
    });

    expect(h.firebaseChildren.updateVaccineProgress).toHaveBeenCalledWith({
      childId: 'c1',
      vaccineId: 'bcg',
      doseNumber: 1,
      administered: true,
      customDate: '2026-05-01',
    });
  });

  it('已接種的那一劑改日期，改的是日期，不是把紀錄清掉', async () => {
    // 這是回報的資料遺失：administered 原本由 store 自己反推，於是家長在
    // 已接種的那一劑上確認新日期，反而把 administered 翻成 false，
    // 資料層接著連 administeredDate 一起刪除。
    h.userChildren = listing(
      [
        child({
          vaccineProgress: {
            bcg: {
              doses: { 1: { administered: true, administeredDate: '2026-05-01' } },
            },
          },
        }),
      ],
      'c1',
    );

    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.setVaccineDose({
        vaccineId: 'bcg',
        doseNumber: 1,
        administered: true,
        date: '2026-06-02',
      });
    });

    expect(h.firebaseChildren.updateVaccineProgress).toHaveBeenCalledWith({
      childId: 'c1',
      vaccineId: 'bcg',
      doseNumber: 1,
      administered: true,
      customDate: '2026-06-02',
    });
  });

  it('取消接種記錄才會把 administered 寫成 false', async () => {
    h.userChildren = listing(
      [
        child({
          vaccineProgress: {
            bcg: {
              doses: { 1: { administered: true, administeredDate: '2026-05-01' } },
            },
          },
        }),
      ],
      'c1',
    );

    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.setVaccineDose({
        vaccineId: 'bcg',
        doseNumber: 1,
        administered: false,
      });
    });

    expect(h.firebaseChildren.updateVaccineProgress).toHaveBeenCalledWith({
      childId: 'c1',
      vaccineId: 'bcg',
      doseNumber: 1,
      administered: false,
      customDate: undefined,
    });
  });

  it('delegates delete and switch to Firebase', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.setCurrentChild('c1');
      await result.current.deleteChild('c1');
    });

    expect(h.firebaseChildren.setCurrentChild).toHaveBeenCalledWith('c1');
    // 第二個參數是刪除當下還存在的 id 清單，資料層據此把 currentChildId
    // 交給還在的孩子。
    expect(h.firebaseChildren.deleteChild).toHaveBeenCalledWith('c1', ['c1']);
  });

  it('toggles a development check, deriving the new achieved state', async () => {
    h.userChildren = listing(
      [child({ developmentProgress: { 'check-12-15-language': { achieved: true } } })],
      'c1',
    );

    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.toggleDevelopmentCheck('check-12-15-language');
    });

    expect(h.firebaseChildren.updateDevelopmentProgress).toHaveBeenCalledWith(
      'c1',
      'check-12-15-language',
      false,
    );
  });

  it('treats an unseen development check as not yet achieved', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.toggleDevelopmentCheck('check-30-36-social');
    });

    expect(h.firebaseChildren.updateDevelopmentProgress).toHaveBeenCalledWith(
      'c1',
      'check-30-36-social',
      true,
    );
  });

  it('stamps diary entries with the current child id and a creation time', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.addDiaryEntry({
        date: '2026-08-27',
        content: '今天自己穿鞋',
      });
    });

    const [childId, entry] = h.firebaseChildren.addDiaryEntry.mock.calls[0];

    expect(childId).toBe('c1');
    expect(entry.childId).toBe('c1');
    expect(entry.content).toBe('今天自己穿鞋');
    expect(Date.parse(entry.createdAt)).not.toBeNaN();
  });

  it('delegates care-task, diary update and diary delete to Firebase', async () => {
    h.userChildren = listing([child()], 'c1');
    const { result } = renderHook(() => useChildStore(user));
    const record = { taskId: 'fluoride-18m', completedDate: '2026-08-27' };

    await act(async () => {
      await result.current.upsertCareTaskRecord(record);
      await result.current.updateDiaryEntry('diary_1', { content: '改過的內容' });
      await result.current.deleteDiaryEntry('diary_1');
    });

    expect(h.firebaseChildren.upsertCareTaskRecord).toHaveBeenCalledWith('c1', record);

    expect(h.firebaseChildren.updateDiaryEntry).toHaveBeenCalledWith('c1', 'diary_1', {
      content: '改過的內容',
    });

    expect(h.firebaseChildren.deleteDiaryEntry).toHaveBeenCalledWith('c1', 'diary_1');
  });

  it('收回共享與分享開關直接轉給資料層，帶著分享視窗指定的那個孩子', async () => {
    // 收回的對象是分享視窗裡的那個孩子，不一定是當前選取的那一個。
    h.userChildren = listing([child(), child({ id: 'c2', name: '小樹' })], 'c1');
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.revokeOtherMembers('c2');
      await result.current.setJoinOpen('c2', true);
    });

    expect(h.firebaseChildren.revokeOtherMembers).toHaveBeenCalledWith('c2');
    expect(h.firebaseChildren.setJoinOpen).toHaveBeenCalledWith('c2', true);
  });

  it('no-ops LittleExplorer mutators when no child is selected', async () => {
    h.userChildren = listing([]);
    const { result } = renderHook(() => useChildStore(user));

    await act(async () => {
      await result.current.toggleDevelopmentCheck('check-12-15-language');
      await result.current.addDiaryEntry({ date: '2026-08-27', content: 'x' });
    });

    expect(h.firebaseChildren.updateDevelopmentProgress).not.toHaveBeenCalled();
    expect(h.firebaseChildren.addDiaryEntry).not.toHaveBeenCalled();
  });

  it('is a no-op for every mutator when there is no user', async () => {
    const { result } = renderHook(() => useChildStore(null));

    await act(async () => {
      await result.current.addChild({ name: 'X', birthday: '2026-01-01' });
      await result.current.setCurrentChild('c1');
    });

    expect(h.firebaseChildren.addChild).not.toHaveBeenCalled();
    expect(h.firebaseChildren.setCurrentChild).not.toHaveBeenCalled();
  });
});

/**
 * 寫入失敗的分工。
 *
 * 樂觀更新是 Firebase 的 listener 給的：寫入被拒（共享被收回、規則不符、離線）
 * 時畫面自己回捲，家長只看到剛勾的東西彈回去。原本 16 個 catch 有 12 個只
 * console.error，於是「存不進去」在畫面上完全沒有痕跡。
 *
 * 分兩組：背後沒有表單的（toggle 與帳號動作）由 store 出訊息並吞掉例外；
 * 從表單寫出去的一律往上丟且不出訊息——表單自己留著家長打的字並在原地說明，
 * store 再跳一則就變成同一次失敗講兩次。
 */
describe('useChildStore 寫入失敗', () => {
  let alertSpy: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    h.userChildren = listing([child()], 'c1');
    alertSpy = vi.fn();
    vi.stubGlobal('alert', alertSpy);
  });

  it('toggle 與帳號動作：跳訊息並吞掉例外，呼叫端沒有要接', async () => {
    h.userChildren = listing([child(), child({ id: 'c2' })], 'c1');
    const { result } = renderHook(() => useChildStore(user));
    const boom = new Error('PERMISSION_DENIED');

    for (const method of [
      'updateMilestoneProgress',
      'updateVaccineProgress',
      'updateDevelopmentProgress',
      'updateToothProgress',
      'setCurrentChild',
      'updateChild',
      'deleteChild',
    ] as const) {
      h.firebaseChildren[method].mockRejectedValueOnce(boom);
    }

    await act(async () => {
      await expect(result.current.toggleMilestone('m1')).resolves.toBeUndefined();

      await expect(
        result.current.setVaccineDose({
          vaccineId: 'bcg',
          doseNumber: 1,
          administered: true,
          date: '2026-05-01',
        }),
      ).resolves.toBeUndefined();

      await expect(
        result.current.toggleDevelopmentCheck('check-12-15-language'),
      ).resolves.toBeUndefined();

      await expect(
        result.current.toggleTooth('lower-central-left'),
      ).resolves.toBeUndefined();

      await expect(result.current.setCurrentChild('c2')).resolves.toBeUndefined();

      await expect(
        result.current.updateChild({ id: 'c1', name: '小明', birthday: '2026-01-01' }),
      ).resolves.toBeUndefined();

      await expect(result.current.deleteChild('c2')).resolves.toBeUndefined();
    });

    expect(alertSpy).toHaveBeenCalledTimes(7);
    expect(alertSpy).toHaveBeenCalledWith('PERMISSION_DENIED');
    expect(errorSpy).toHaveBeenCalledTimes(7);
  });

  it('toggle 與帳號動作：錯誤沒有可讀的訊息時，退回自己那一句中文', async () => {
    // Firebase 的例外不一定帶 message；那時候「更新失敗」也得說得出是什麼失敗。
    const { result } = renderHook(() => useChildStore(user));

    h.firebaseChildren.updateVaccineProgress.mockRejectedValueOnce(new Error(''));

    await act(async () => {
      await result.current.setVaccineDose({
        vaccineId: 'bcg',
        doseNumber: 1,
        administered: true,
        date: '2026-05-01',
      });
    });

    expect(alertSpy).toHaveBeenCalledWith('疫苗記錄更新失敗，請稍後再試');
  });

  it('表單那一組：往上丟且不跳訊息——訊息由表單出，家長打的字要留著', async () => {
    // 分享視窗跟表單同一組：收回共享失敗時它要在原地說明，store 再跳一則就
    // 變成同一次失敗講兩次。
    // 只放孕期檔案：currentChild 與 pregnancyChild 都是它，childCount 也還
    // 沒到上限，addChild／joinChild 才會真的走到寫入而不是被上限攔下來。
    h.userChildren = listing([bump()], 'p1');
    const { result } = renderHook(() => useChildStore(user));
    const boom = new Error('PERMISSION_DENIED');

    for (const method of [
      'addChild',
      'joinChild',
      'upsertPrenatalRecord',
      'clearPrenatalRecord',
      'recordBirth',
      'upsertCareTaskRecord',
      'addDiaryEntry',
      'updateDiaryEntry',
      'deleteDiaryEntry',
      'revokeOtherMembers',
      'setJoinOpen',
    ] as const) {
      h.firebaseChildren[method].mockRejectedValueOnce(boom);
    }

    await act(async () => {
      await expect(
        result.current.addChild({ name: '小華', birthday: '2026-02-02' }),
      ).rejects.toThrow(boom);

      await expect(result.current.joinChild('uuid-1')).rejects.toThrow(boom);

      await expect(
        result.current.upsertPrenatalRecord('visit-1', { completedDate: '2026-03-01' }),
      ).rejects.toThrow(boom);

      await expect(result.current.clearPrenatalRecord('visit-1')).rejects.toThrow(boom);
      await expect(result.current.recordBirth('2026-11-20')).rejects.toThrow(boom);

      await expect(
        result.current.upsertCareTaskRecord({
          taskId: 'fluoride-18m',
          completedDate: '2026-08-27',
        }),
      ).rejects.toThrow(boom);

      await expect(
        result.current.addDiaryEntry({ date: '2026-08-27', content: '今天自己穿鞋' }),
      ).rejects.toThrow(boom);

      await expect(
        result.current.updateDiaryEntry('diary_1', { content: 'x' }),
      ).rejects.toThrow(boom);

      await expect(result.current.deleteDiaryEntry('diary_1')).rejects.toThrow(boom);
      await expect(result.current.revokeOtherMembers('p1')).rejects.toThrow(boom);
      await expect(result.current.setJoinOpen('p1', true)).rejects.toThrow(boom);
    });

    expect(alertSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledTimes(11);
  });
});
