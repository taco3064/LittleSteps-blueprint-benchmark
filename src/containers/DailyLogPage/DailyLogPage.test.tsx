import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  ChildProfile,
  DailyLog,
  DailyLogPatch,
  FeedingData,
  SleepData,
} from '~app/domain/records';
import { ToastProvider } from '../Toast';
import DailyLogPage from './DailyLogPage';
import { getFeedingTypeLabel } from '~app/domain/logHelpers';

/**
 * 這一頁以前把 addDailyLog 的失敗接住變成一則 toast，於是 LogEntryModal 收到的
 * 是一個成功的 promise：表單關掉、家長剛打的內容消失、表單自己的錯誤框永遠沒
 * 機會出現。訊息屬於那張表，這一頁只負責把失敗原封不動往上丟。
 */

const { addDailyLog, updateDailyLog, deleteDailyLog, readState } = vi.hoisted(
  () => ({
    addDailyLog: vi.fn(),
    updateDailyLog: vi.fn(),
    deleteDailyLog: vi.fn(),
    readState: { error: false, logs: [] as DailyLog[] },
  }),
);

vi.mock('~app/hooks/useDailyLogs', () => ({
  // 每個孩子只看得到自己的紀錄，就像真的 Firebase 監聽器一樣。
  useDailyLogs: (childId: string | null) => ({
    logs: readState.logs.filter((log) => log.childId === childId),
    loading: false,
    error: readState.error,
  }),
}));

vi.mock('~app/services/childRepository', () => ({
  createChildRepository: () => ({
    addDailyLog,
    updateDailyLog,
    deleteDailyLog,
  }),
}));

const child: ChildProfile = {
  id: 'c1',
  name: '小豆',
  birthday: '2026-02-01',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2026-02-01T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
};

/** 開餵奶那張表，並填一個奶量，方便驗「失敗後值還在不在」。 */
const openFeedingSheet = async () => {
  const user = userEvent.setup();

  render(<DailyLogPage currentChild={child} user={null} />);

  await user.click(screen.getByRole('button', { name: '餵奶' }));
  await screen.findByRole('heading', { name: '新增餵奶記錄' });
  await user.type(screen.getByLabelText('奶量（ml）'), '120');

  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  readState.error = false;
  readState.logs = [];
});

describe('記錄一筆餵奶', () => {
  it('寫入失敗時表單不關，錯誤顯示在表單裡，奶量還在', async () => {
    addDailyLog.mockRejectedValue(new Error('權限不足，無法寫入'));
    const user = await openFeedingSheet();

    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '權限不足，無法寫入',
    );

    expect(
      screen.getByRole('heading', { name: '新增餵奶記錄' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('奶量（ml）')).toHaveValue(120);
  });

  it('寫入成功才關表', async () => {
    addDailyLog.mockResolvedValue(undefined);
    const user = await openFeedingSheet();

    await user.click(screen.getByRole('button', { name: '儲存' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: '新增餵奶記錄' }),
      ).toBeNull(),
    );

    expect(addDailyLog).toHaveBeenCalledTimes(1);
  });
});

describe('讀不到記錄時', () => {
  it('說讀不到，而不是說今天還沒記', () => {
    readState.error = true;
    render(<DailyLogPage currentChild={child} user={null} />);

    expect(
      screen.getByText('讀不到日常記錄，請確認網路後重新載入'),
    ).toBeInTheDocument();

    expect(screen.queryByText(/還沒有記錄/)).toBeNull();
  });
});

/*
  日檢視上那個「餵奶」數字是媽媽真正會看的那一個。它跟摘要卡必須說同一件事，
  否則同一個畫面上兩個數字互相矛盾——而擠奶被算進去的話，全擠奶的媽媽每天
  看到的是實際餐數的兩倍。
*/
describe('日檢視的餵奶次數', () => {
  it('六次瓶餵加六次擠奶顯示 6，不是 12', () => {
    const at = (hour: number) => {
      const d = new Date();

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

    readState.logs = [
      ...[1, 4, 7, 10, 13, 16].map((h) =>
        log(
          `bottle-${h}`,
          { feedingType: 'breast_milk_bottle', amount: 100 },
          h,
        ),
      ),
      ...[2, 5, 8, 11, 14, 17].map((h) =>
        log(
          `pump-${h}`,
          { feedingType: 'pumping', amount: 150, duration: 20 },
          h,
        ),
      ),
    ];

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    const statsCard = screen.getByRole('heading', {
      name: '今日統計',
    }).parentElement!;

    expect(
      within(statsCard).getByText('餵奶').previousElementSibling,
    ).toHaveTextContent('6');
  });
});

/*
  表單每次都從 breast_left 和空白奶量開始，所以一位餵配方奶的家長一天要重打
  同樣的 120 八次。記憶要跟著孩子走：一位有兩個孩子的家長，一個喝配方奶一個
  親餵，用帳號記住上一次只會讓兩張表都填錯。
*/
describe('沿用上一筆', () => {
  const childB: ChildProfile = { ...child, id: 'c2', name: '小米' };

  const feedingLog = (
    id: string,
    childId: string,
    data: FeedingData,
  ): DailyLog => ({
    id,
    childId,
    type: 'feeding',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    data,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  });

  beforeEach(() => {
    readState.logs = [
      feedingLog('a', 'c1', { feedingType: 'formula', amount: 120 }),
      feedingLog('b', 'c2', { feedingType: 'breast_both', duration: 15 }),
    ];

    addDailyLog.mockResolvedValue('new-log');
  });

  it('開餵奶表單時帶出這個孩子上次的值', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '餵奶' }));

    expect(await screen.findByLabelText('類型 *')).toHaveValue('formula');
    expect(screen.getByLabelText('奶量（ml）')).toHaveValue(120);
  });

  it('換一個孩子，帶出的是那個孩子的值', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={childB} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '餵奶' }));

    expect(await screen.findByLabelText('類型 *')).toHaveValue('breast_both');
    expect(screen.getByLabelText('奶量（ml）')).toHaveValue(null);
    expect(screen.getByLabelText('時長（分鐘）')).toHaveValue(15);
  });

  it('一鍵重複：內容照抄上一筆，時間是現在，不開表單', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    await user.click(
      screen.getByRole('button', { name: '餵奶 · 配方奶 120 ml' }),
    );

    expect(addDailyLog).toHaveBeenCalledTimes(1);
    const [, written] = addDailyLog.mock.calls[0];

    expect(written.type).toBe('feeding');

    expect(written.data).toMatchObject({
      feedingType: 'formula',
      amount: 120,
    });

    expect(Date.now() - Date.parse(written.timestamp)).toBeLessThan(1000);

    expect(
      screen.queryByRole('heading', { name: '新增餵奶記錄' }),
    ).toBeNull();
  });

  /*
    一鍵重複是唯一不開表單就寫進去的路徑：家長看不到存了什麼，所以寫錯孩子
    不會有任何跡象。孩子綁定在這裡比在表單裡更要緊。
  */
  it('一鍵重複寫的是目前這個孩子', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={childB} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^餵奶 · / }));

    expect(addDailyLog).toHaveBeenCalledTimes(1);
    const [childId, written] = addDailyLog.mock.calls[0];

    expect(childId).toBe('c2');
    expect(written.childId).toBe('c2');

    expect(written.data).toMatchObject({
      feedingType: 'breast_both',
      duration: 15,
    });
  });

  it('一鍵重複不把上一次的備註抄過來', async () => {
    readState.logs = [
      {
        ...feedingLog('with-note', 'c1', {
          feedingType: 'formula',
          amount: 120,
        }),
        data: {
          feedingType: 'formula',
          amount: 120,
          notes: '喝得很急',
        } as FeedingData,
      },
    ];

    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^餵奶 · / }));

    const [, written] = addDailyLog.mock.calls[0];

    expect((written.data as FeedingData).notes).toBeUndefined();
  });

  /*
    「母乳（瓶餵）」自己就帶括號，所以用括號把內容包起來的拼法會寫出
    「餵奶（母乳（瓶餵） 120 ml）」——一顆 chip 上兩層全形括號，在 320px 上
    讀起來是一團符號，而這顆按鈕的整段文字就是它會存什麼的唯一說明。
  */
  it('帶括號的餵奶類型不會讓按鈕再包一層括號', () => {
    readState.logs = [
      feedingLog('bottle', 'c1', {
        feedingType: 'breast_milk_bottle',
        amount: 120,
      }),
    ];

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    expect(
      screen.getByRole('button', {
        name: `餵奶 · ${getFeedingTypeLabel('breast_milk_bottle')} 120 ml`,
      }),
    ).toBeInTheDocument();
  });

  it('尿布表單也帶出這個孩子上次的類型與性狀', async () => {
    const at = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    readState.logs = [
      {
        id: 'd1',
        childId: 'c1',
        type: 'diaper',
        timestamp: at,
        data: { type: 'both', consistency: 'soft' },
        createdAt: at,
      },
    ];

    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '尿布' }));

    expect(await screen.findByLabelText('類型 *')).toHaveValue('both');
    expect(screen.getByLabelText('性狀')).toHaveValue('soft');
  });

  /*
    擠奶是這個孩子最新的一筆 feeding 型別紀錄，但它不是一餐。把它當成「上次的
    餵奶」有兩個錯：按鈕會寫成「餵奶 · 擠奶 90 ml」，而剛擠完奶的媽媽從此
    再也叫不出「再餵一次上次那餐」。
  */
  it('最近一筆是擠奶時，餵奶與擠奶各有各的按鈕', async () => {
    const ago = (minutes: number) =>
      new Date(Date.now() - minutes * 60_000).toISOString();

    readState.logs = [
      {
        id: 'feed',
        childId: 'c1',
        type: 'feeding',
        timestamp: ago(180),
        data: { feedingType: 'formula', amount: 120 },
        createdAt: ago(180),
      },
      {
        id: 'pump',
        childId: 'c1',
        type: 'feeding',
        timestamp: ago(30),
        data: { feedingType: 'pumping', amount: 90 },
        createdAt: ago(30),
      },
    ];

    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    expect(screen.queryByRole('button', { name: /^餵奶 · 擠奶/ })).toBeNull();

    expect(
      screen.getByRole('button', { name: '餵奶 · 配方奶 120 ml' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '擠奶 · 90 ml' }));

    const [, written] = addDailyLog.mock.calls[0];

    expect((written.data as FeedingData).feedingType).toBe('pumping');
  });

  it('還沒有任何紀錄的孩子沒有重複鍵，表單也回到原本的預設值', async () => {
    readState.logs = [];
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    expect(screen.queryByText('再記一次上次的')).toBeNull();

    await user.click(screen.getByRole('button', { name: '餵奶' }));
    expect(await screen.findByLabelText('類型 *')).toHaveValue('breast_left');
    expect(screen.getByLabelText('奶量（ml）')).toHaveValue(null);
  });
});

/*
  睡眠的另一半。開始一段睡眠一直都是一鍵，結束卻要在時間軸裡找到那一筆、
  點開、拉日期時間選擇器、存檔——所以真正被使用的只有事後補記，而那正是
  「不填結束時間」這個設計要避免的。
*/
/*
  改一筆既有的紀錄。整份檔案原本沒有任何一個案例打開過編輯表單——20 個案例都
  是新增、沿用上一筆或睡眠流程——所以 handleSave 那條路（editingLog →
  dailyLogChanges → 補丁）完全沒有被走過。review 用一次 mutation 證明了代價：
  把 dailyLogChanges 裡比對 timestamp 的那一行整個刪掉，1667 個測試照樣全過，
  而那等於「改時間沒有作用」——畫面還會跳到新的那一天，家長於是站在一個空白
  的日子上，紀錄留在舊的那天。
*/
describe('編輯既有的紀錄', () => {
  const HOUR_AGO = new Date('2026-06-15T21:00:00+08:00');

  const existing: DailyLog = {
    id: 'feed-1',
    childId: 'c1',
    type: 'feeding',
    timestamp: HOUR_AGO.toISOString(),
    data: {
      feedingType: 'formula',
      amount: 120,
      notes: '喝得很順',
    } as FeedingData,
    createdAt: HOUR_AGO.toISOString(),
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date('2026-06-15T22:00:00+08:00'));
    readState.logs = [existing];
    updateDailyLog.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('只送這次真的改到的欄位，改到的時間也要送', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '編輯' }));
    await screen.findByRole('heading', { name: '編輯餵奶記錄' });

    const amount = screen.getByLabelText('奶量（ml）');

    await user.clear(amount);
    await user.type(amount, '150');

    const time = screen.getByLabelText('時間 *');

    await user.clear(time);
    await user.type(time, '2026-06-15T20:30');

    await user.click(screen.getByRole('button', { name: '更新' }));

    await waitFor(() => expect(updateDailyLog).toHaveBeenCalledTimes(1));

    const [, logId, patch] = updateDailyLog.mock.calls[0] as [
      string,
      string,
      DailyLogPatch,
    ];

    expect(logId).toBe('feed-1');

    // 改到的兩個欄位都在，而且只有它們。備註沒有動就不該出現在補丁裡——它一
    // 出現，另一位照顧者在這段時間內改的備註就會被我開表單那一刻讀到的舊值
    // 蓋掉，這正是 #42。
    expect(patch.timestamp).toBeDefined();
    expect(patch.data).toEqual({ amount: 150 });

    expect(Object.keys(patch)).toEqual(
      expect.arrayContaining(['timestamp', 'data']),
    );

    expect(Object.keys(patch)).toHaveLength(2);
  });

  it('什麼都沒改就按儲存，一個字都不寫', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '編輯' }));
    await screen.findByRole('heading', { name: '編輯餵奶記錄' });
    await user.click(screen.getByRole('button', { name: '更新' }));

    await waitFor(() => expect(updateDailyLog).toHaveBeenCalledTimes(1));

    const [, , patch] = updateDailyLog.mock.calls[0] as [
      string,
      string,
      DailyLogPatch,
    ];

    expect(patch).toEqual({});
  });
});

describe('進行中的睡眠', () => {
  /** 本地時間晚上 11 點：早上 8 點開始的睡眠已經超過門檻，而且還在同一個日曆日。 */
  const LATE_EVENING = new Date('2026-06-15T23:00:00+08:00');

  const openSleepLog = (startedMinutesAgo: number): DailyLog => {
    const startTime = new Date(
      Date.now() - startedMinutesAgo * 60_000,
    ).toISOString();

    return {
      id: 'sleep-1',
      childId: 'c1',
      type: 'sleep',
      timestamp: startTime,
      data: { startTime } as SleepData,
      createdAt: startTime,
    };
  };

  const renderPage = () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <ToastProvider>
        <DailyLogPage currentChild={child} user={null} />
      </ToastProvider>,
    );

    return user;
  };

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(LATE_EVENING);

    // 寫入成功後把結果放回 logs，模擬 Firebase 監聽器把新值送回畫面。補丁是
    // 欄位級的，所以 data 這裡要用合併的，跟資料庫端一樣只動送上去的欄位。
    //
    // 這個仿製品比 useFirebaseChildren.test.ts 裡那個鬆：它不處理 null 代表
    // 刪除，所以 `{ data: { notes: null } }` 在這裡會留下 notes === null 而不
    // 是拿掉它。目前沒有任何案例從畫面走到那條路；真要加「清空備註」的頁面測
    // 試，得先把這裡補齊，否則它會因為錯的理由通過。
    updateDailyLog.mockImplementation(
      async (_childId: string, logId: string, patch: DailyLogPatch) => {
        readState.logs = readState.logs.map((log) =>
          log.id === logId
            ? {
                ...log,
                ...patch,
                data: { ...log.data, ...patch.data } as DailyLog['data'],
              }
            : log,
        );
      },
    );

    addDailyLog.mockResolvedValue('new-log');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('一鍵開始睡：寫進去的是一筆沒有結束時間的睡眠', async () => {
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: '開始睡' }));

    expect(addDailyLog).toHaveBeenCalledTimes(1);
    const [, written] = addDailyLog.mock.calls[0];

    expect(written.type).toBe('sleep');

    expect((written.data as SleepData).startTime).toBe(
      LATE_EVENING.toISOString(),
    );

    expect((written.data as SleepData).endTime).toBeUndefined();
  });

  it('日檢視上直接看得到睡了多久，不用點開任何東西', () => {
    readState.logs = [openSleepLog(80)];
    renderPage();

    expect(screen.getByText('1小時20分鐘')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '醒了' })).toBeInTheDocument();
  });

  it('「醒了」一鍵結束，結束時間是現在，時長跟著對上', async () => {
    readState.logs = [openSleepLog(80)];
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: '醒了' }));

    expect(updateDailyLog).toHaveBeenCalledTimes(1);
    const [, logId, patch] = updateDailyLog.mock.calls[0];

    expect(logId).toBe('sleep-1');
    const closed = patch.data as SleepData;

    expect(Date.now() - Date.parse(closed.endTime!)).toBeLessThan(1000);
    expect(closed.duration).toBe(80);

    // 送上去的就只有這兩個欄位。這一行不是重複上面那兩句：把整個 data 寫回去
    // 也會讓它們成立，而「醒了」是日檢視上一鍵就會按到的動作，多半由當下抱著
    // 孩子的那一位按——另一位很可能正開著同一筆在補備註。整筆重放就把他剛打
    // 的字連同他改過的任何欄位一起蓋掉，兩邊都不會看到任何提示。
    expect(patch).toEqual({
      data: { endTime: expect.any(String), duration: 80 },
    });
  });

  it('已經在睡的時候再按一次，說清楚原因而不是默默蓋掉', async () => {
    readState.logs = [openSleepLog(80)];
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: '睡眠中' }));

    expect(
      await screen.findByText(/先按「醒了」結束這一段/),
    ).toBeInTheDocument();

    expect(addDailyLog).not.toHaveBeenCalled();
  });

  it('開了 15 小時的睡眠改成待補結束時間，不算進當天統計', () => {
    readState.logs = [openSleepLog(15 * 60)];
    renderPage();

    expect(screen.getByText('這段睡眠還沒有結束時間')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '醒了' })).toBeNull();

    const statsCard = screen.getByRole('heading', {
      name: '今日統計',
    }).parentElement!;

    expect(
      within(statsCard).getByText('睡眠').previousElementSibling,
    ).toHaveTextContent('0');
  });

  /*
    夜醒次數只有在剛醒的那一刻問得準，但「醒了」不能因此變成一張表單。
    問題留在關掉之後：想回答的人多按一下，走開的人什麼也沒記。
  */
  it('結束之後才問夜醒次數，答了才寫進去', async () => {
    readState.logs = [openSleepLog(80)];
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: '醒了' }));

    await user.click(
      await screen.findByRole('button', { name: '夜醒 2 次' }),
    );

    expect(updateDailyLog).toHaveBeenCalledTimes(2);
    const [, , patch] = updateDailyLog.mock.calls[1];

    expect((patch.data as SleepData).nightWakings).toBe(2);
  });

  /*
    夜醒次數只寫 nightWakings 這一個欄位，別的什麼都不帶。帶著整個 data 的話
    送上去的會是這一端手上那一版：監聽器還沒把關掉後的值送回來，於是剛結束的
    睡眠被寫回進行中；另一位照顧者同時補的備註也會一起被蓋掉。
  */
  it('補夜醒次數時只寫夜醒次數，不重放手上那一版的睡眠', async () => {
    readState.logs = [openSleepLog(80)];
    // 監聽器還沒把關掉後的值送回來：logs 裡仍然是沒有結束時間的那一版。
    updateDailyLog.mockResolvedValue(undefined);
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: '醒了' }));

    await user.click(
      await screen.findByRole('button', { name: '夜醒 1 次' }),
    );

    const [, , patch] = updateDailyLog.mock.calls[1];

    expect(patch).toEqual({ data: { nightWakings: 1 } });
  });

  it('沒有回答夜醒次數就什麼都不寫', async () => {
    readState.logs = [openSleepLog(80)];
    const user = renderPage();

    await user.click(screen.getByRole('button', { name: '醒了' }));

    await user.click(
      await screen.findByRole('button', { name: '不記夜醒次數' }),
    );

    expect(updateDailyLog).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('這一段中間醒來幾次？')).toBeNull();
  });
});
