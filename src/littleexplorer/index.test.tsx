import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CareTaskRecord,
  ChildProfile,
  DiaryEntry,
} from '../family/domain/familyRecords/index';
import {
  CARE_TASK_LOCATION_LIMIT,
  CARE_TASK_NOTES_LIMIT,
  DIARY_CONTENT_LIMIT,
} from '../family/domain/recordLimits/index';
import { careTaskTemplates } from '../knowledge/domain/careTasks/index';
import type { ResolvedCareTask } from '../knowledge/domain/referenceModels/index';
import { resolveCareTasks } from './domain/careSchedule/index';
import { developmentCheckItems } from './domain/developmentChecks/index';
import DevelopmentPage from './DevelopmentPage';
import DiaryPage from './DiaryPage';
import RemindersPage from './RemindersPage';
import ToddlerWikiPage from './ToddlerWikiPage';

/**
 * Mount smoke tests for the four LittleExplorer tabs.
 *
 * The repo otherwise has no page-level tests, and these deliberately stay
 * shallow: they exist because a page that throws on mount is invisible to the
 * pure-function suites, and because two behaviours are load-bearing product
 * invariants that a refactor could silently break —
 *   1. vaccine tasks must never offer a "mark complete" button, and
 *   2. the growth tab must open on the child's actual age band.
 */

const NOW = new Date(2026, 7, 27, 12); // 2026-08-27, local noon

/** 生日 2024-08-27 → 恰好 24 個月，落在 24-30 段。 */
const TWO_YEAR_OLD = '2024-08-27';

const child = (overrides: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'c1',
  name: '小樹',
  birthday: TWO_YEAR_OLD,
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2024-08-27T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...overrides,
});

const noop = async () => {};

const noopAddChild = async () => {};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ExplorerShell 與 tab bar', () => {
  it('每個分頁都渲染四個 tab，並標記自己為作用中', () => {
    render(<ToddlerWikiPage currentChild={child()} reminderBadge={0} />);

    const nav = screen.getByRole('navigation');

    for (const label of ['成長', '提醒', '日記', '百科']) {
      expect(within(nav).getByText(label)).toBeInTheDocument();
    }

    expect(within(nav).getByRole('button', { current: 'page' })).toHaveTextContent(
      '百科',
    );
  });

  it('提醒 tab 在有待辦時顯示紅點，數量超過 9 顯示 9+', () => {
    render(<ToddlerWikiPage currentChild={child()} reminderBadge={12} />);
    expect(screen.getByLabelText('12 項待處理')).toHaveTextContent('9+');
  });

  it('沒有待辦時不顯示紅點', () => {
    render(<ToddlerWikiPage currentChild={child()} reminderBadge={0} />);
    expect(screen.queryByLabelText(/項待處理/)).not.toBeInTheDocument();
  });

  // 導覽有兩級：tab bar 通往本服務的首頁（成長分頁即 #/littleexplorer），
  // 頁首的「所有服務」再往上一級回到 app 進入點。兩者不可互相取代。
  it('tab bar 通往本服務首頁', async () => {
    const user = userEvent.setup();

    window.history.replaceState(null, '', '/littleexplorer/wiki');

    render(<ToddlerWikiPage currentChild={child()} />);
    await user.click(within(screen.getByRole('navigation')).getByText('成長'));

    expect(window.location.pathname).toBe('/littleexplorer');
  });

  it('頁首通往所有服務的進入點', async () => {
    const user = userEvent.setup();

    window.history.replaceState(null, '', '/littleexplorer/wiki');

    render(<ToddlerWikiPage currentChild={child()} />);
    await user.click(screen.getByRole('button', { name: '所有服務' }));

    expect(window.location.pathname).toBe('/');
  });
});

describe('DevelopmentPage', () => {
  const renderPage = (overrides: Partial<ChildProfile> = {}) =>
    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={child(overrides)}
        progress={{}}
        toothProgress={{}}
        onToggleTooth={noop}
        onToggleCheck={noop}
        onQuickDiary={noop}
      />,
    );

  it('預設選中孩子目前月齡所屬的年齡段，而非第一段', () => {
    renderPage();

    // 24 個月 → 2 歲-2 歲 6 個月
    expect(
      screen.getByRole('button', { name: '2 歲-2 歲 6 個月', pressed: true }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: '1 歲-1 歲 3 個月', pressed: false }),
    ).toBeInTheDocument();
  });

  // 早產兒的預設年齡段跟著矯正年齡走，並且說出來——一個 30 週出生、實際
  // 24 個月大的孩子，該對照的是 1 歲 6 個月那一段。
  it('早產寶寶預設落在矯正年齡的年齡段，並標明已矯正', () => {
    renderPage({ gestationalAgeWeeks: 30 });

    expect(
      screen.getByRole('button', { name: '1 歲 6 個月-2 歲', pressed: true }),
    ).toBeInTheDocument();

    expect(screen.getByText(/已依早產矯正/)).toBeInTheDocument();
  });

  it('足月寶寶看不到矯正說明', () => {
    renderPage();
    expect(screen.queryByText(/已依早產矯正/)).not.toBeInTheDocument();
  });

  it('顯示該年齡段的 6 個項目與已完成計數', () => {
    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={child()}
        toothProgress={{}}
        onToggleTooth={noop}
        progress={{
          [developmentCheckItems.find((i) => i.ageBand === '24-30')!.id]: {
            achieved: true,
          },
        }}
        onToggleCheck={noop}
        onQuickDiary={noop}
      />,
    );

    expect(screen.getByText('這個階段的 6 件事')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('未滿 1 歲顯示引導卡，不渲染檢核清單', () => {
    renderPage({ birthday: '2026-03-01' }); // 約 5 個月
    expect(screen.getByText('寶寶還不到 1 歲')).toBeInTheDocument();
    expect(screen.queryByText(/這個階段的/)).not.toBeInTheDocument();
  });

  it('沒有寶寶時顯示引導卡', () => {
    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={null}
        progress={{}}
        toothProgress={{}}
        onToggleCheck={noop}
        onToggleTooth={noop}
        onQuickDiary={noop}
      />,
    );

    expect(screen.getByText('還沒有寶寶資料')).toBeInTheDocument();
  });

  it('乳牙記錄收合時仍顯示已長顆數', () => {
    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={child()}
        progress={{}}
        toothProgress={{
          'lower-right-1': { erupted: true },
          'lower-left-1': { erupted: true },
        }}
        onToggleCheck={noop}
        onToggleTooth={noop}
        onQuickDiary={noop}
      />,
    );

    expect(screen.getByText('已長 2／20 顆')).toBeInTheDocument();
  });

  it('展開乳牙記錄後，點牙位會回報該牙的 id', async () => {
    const user = userEvent.setup();
    const onToggleTooth = vi.fn(async (_id: string) => {});

    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={child()}
        progress={{}}
        toothProgress={{}}
        onToggleCheck={noop}
        onToggleTooth={onToggleTooth}
        onQuickDiary={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: /乳牙萌發/ }));

    // 牙位的 aria-label 形如「上正中門齒，約 4 至 8 個月」；年齡段 chip 也以
    // 「個月」結尾，故必須比對完整的區間格式才不會誤抓。
    const teeth = screen.getAllByRole('button', {
      name: /約 \d+ 至 \d+ 個月$/,
    });

    expect(teeth).toHaveLength(20);

    await user.click(teeth[0]);
    expect(onToggleTooth).toHaveBeenCalledTimes(1);

    expect(onToggleTooth.mock.calls[0][0]).toMatch(
      /^(upper|lower)-(left|right)-[1-5]$/,
    );
  });

  it('滿 3 歲顯示畢業卡但仍可瀏覽', () => {
    renderPage({ birthday: '2023-01-01' }); // 逾 3 歲
    expect(screen.getByText('已經滿 3 歲了')).toBeInTheDocument();
    expect(screen.getByText('這個階段的 6 件事')).toBeInTheDocument();
  });

  it('紅旗警訊預設收合，展開後才顯示轉介建議', async () => {
    const user = userEvent.setup();

    renderPage();

    expect(screen.queryByText(/早期療育通報轉介中心/)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /什麼時候該諮詢醫師/ }));

    expect(screen.getByText(/早期療育通報轉介中心/)).toBeInTheDocument();
  });

  it('勾選項目後就地展開日記輸入框，送出後回呼帶著項目 id', async () => {
    const user = userEvent.setup();
    const onQuickDiary = vi.fn(async () => {});
    const item = developmentCheckItems.find((i) => i.ageBand === '24-30')!;

    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={child()}
        progress={{}}
        toothProgress={{}}
        onToggleTooth={noop}
        onToggleCheck={noop}
        onQuickDiary={onQuickDiary}
      />,
    );

    await user.click(screen.getByRole('button', { name: `標記：${item.title}` }));

    const input = screen.getByPlaceholderText('要記一筆嗎？（選填）');

    await user.type(input, '今天做到了');
    await user.click(screen.getByRole('button', { name: '記下來' }));

    expect(onQuickDiary).toHaveBeenCalledWith('今天做到了', item.id);
  });

  it('取消日記輸入框不會建立日記', async () => {
    const user = userEvent.setup();
    const onQuickDiary = vi.fn(async () => {});
    const item = developmentCheckItems.find((i) => i.ageBand === '24-30')!;

    render(
      <DevelopmentPage
        onAddChild={noopAddChild}
        currentChild={child()}
        progress={{}}
        toothProgress={{}}
        onToggleTooth={noop}
        onToggleCheck={noop}
        onQuickDiary={onQuickDiary}
      />,
    );

    await user.click(screen.getByRole('button', { name: `標記：${item.title}` }));

    await user.click(screen.getByRole('button', { name: '關閉' }));

    expect(
      screen.queryByPlaceholderText('要記一筆嗎？（選填）'),
    ).not.toBeInTheDocument();

    expect(onQuickDiary).not.toHaveBeenCalled();
  });
});

describe('RemindersPage', () => {
  const tasks = () =>
    resolveCareTasks({
      birthday: TWO_YEAR_OLD,
      templates: careTaskTemplates,
      careProgress: {},
      vaccineProgress: {},
      today: NOW,
    });

  it('疫苗任務不提供標記完成，只深連結回疫苗追蹤', () => {
    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks()}
        onCompleteTask={noop}
      />,
    );

    const vaccineRows = screen.getAllByText('疫苗接種');

    expect(vaccineRows.length).toBeGreaterThan(0);

    for (const badge of vaccineRows) {
      const row = badge.closest('li')!;

      expect(
        within(row).queryByRole('button', { name: '標記完成' }),
      ).not.toBeInTheDocument();

      expect(
        within(row).getByRole('button', { name: '到疫苗追蹤勾選' }),
      ).toBeInTheDocument();
    }
  });

  it('非疫苗任務提供標記完成，展開後可送出記錄', async () => {
    const user = userEvent.setup();
    const onCompleteTask = vi.fn(async (_record: CareTaskRecord) => {});

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks()}
        onCompleteTask={onCompleteTask}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);
    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(onCompleteTask).toHaveBeenCalledTimes(1);
    const [record] = onCompleteTask.mock.calls[0];

    expect(record.taskId).toBeTruthy();
    expect(record.completedDate).toBe('2026-08-27');
  });

  it('顯示這個月齡的四類注意事項', () => {
    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks()}
        onCompleteTask={noop}
      />,
    );

    for (const label of ['安全', '飲食', '行為與情緒', '健康照護']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('注意事項不提供勾選', () => {
    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks()}
        onCompleteTask={noop}
      />,
    );

    const safety = screen.getByText('安全').closest('article')!;

    expect(within(safety).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(safety).queryByRole('button')).not.toBeInTheDocument();
  });

  it('未滿 1 歲顯示引導卡', () => {
    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child({ birthday: '2026-03-01' })}
        tasks={[]}
        onCompleteTask={noop}
      />,
    );

    expect(screen.getByText('寶寶還不到 1 歲')).toBeInTheDocument();
  });

  /** 手捏逾期任務：要同時擺出「建檔前到期」與「建檔後到期」兩筆才比得出待遇差別。 */
  const overdueTask = (id: string, dueDate: string): ResolvedCareTask => ({
    template: {
      id,
      kind: 'health-check',
      title: `健檢 ${id}`,
      description: '說明',
      dueMonth: 18,
      fromMonth: 18,
      toMonth: 24,
      source: '國民健康署',
    },
    dueDate,
    windowEnd: dueDate,
    status: 'overdue',
    daysUntilDue: -400,
  });

  it('替兩歲寶寶當天建檔：一項都不算真的逾期，全部收進建檔前的區塊', () => {
    // 390px 稽核抓到的畫面：開場一整面「已逾期 425 天」。那些是 app 沒有的
    // 歷史，不是家長漏掉的預約，所以「已經逾期」一項都不該有。
    const all = tasks();
    const overdue = all.filter((task) => task.status === 'overdue');
    const overdueCount = overdue.length;

    expect(overdueCount).toBeGreaterThan(0);

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child({ createdAt: '2026-08-27T09:00:00.000Z' })}
        tasks={all}
        onCompleteTask={noop}
      />,
    );

    expect(screen.queryByText('已經逾期')).not.toBeInTheDocument();
    expect(screen.getByText('開始使用前就到期的項目')).toBeInTheDocument();
    expect(screen.getByText(`${overdueCount} 項`)).toBeInTheDocument();

    // 預設收合：件數看得到，425 天的卡片一張都沒攤開。
    expect(screen.queryByText(overdue[0].template.title)).not.toBeInTheDocument();
  });

  it('建檔後才到期的仍是已經逾期，建檔前的收起來且不喊逾期天數', async () => {
    const user = userEvent.setup();

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child({ createdAt: '2026-06-01T00:00:00.000Z' })}
        tasks={[overdueTask('old', '2025-09-01'), overdueTask('new', '2026-06-15')]}
        onCompleteTask={noop}
      />,
    );

    // 建檔後才到期的那筆留在原本的顯眼分區，連逾期天數都照舊。
    const overdueSection = screen.getByText('已經逾期').closest('section')!;

    expect(within(overdueSection).getByText('健檢 new')).toBeInTheDocument();

    expect(within(overdueSection).getByText(/已逾期 400 天/)).toBeInTheDocument();

    expect(within(overdueSection).queryByText('健檢 old')).not.toBeInTheDocument();

    // 建檔前那筆收合著，只露出件數。
    expect(screen.getByText('1 項')).toBeInTheDocument();
    expect(screen.queryByText('健檢 old')).not.toBeInTheDocument();

    await user.click(screen.getByText('開始使用前就到期的項目'));

    // 展開後只給建議日期：對建檔前的項目講「已逾期 400 天」是在責怪家長。
    expect(screen.getByText('健檢 old')).toBeInTheDocument();
    expect(screen.getByText('建議日期 2025年9月1日')).toBeInTheDocument();
    expect(screen.queryByText(/健檢 old[\s\S]*已逾期/)).not.toBeInTheDocument();
  });

  it('收合區塊用鍵盤也打得開', async () => {
    // 這一列是 div 不是 button（裡面有標題），沒有 pressable() 就只有滑鼠進得去。
    const user = userEvent.setup();

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child({ createdAt: '2026-06-01T00:00:00.000Z' })}
        tasks={[overdueTask('old', '2025-09-01')]}
        onCompleteTask={noop}
      />,
    );

    const toggle = screen
      .getByText('開始使用前就到期的項目')
      .closest('[role="button"]') as HTMLElement;

    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    toggle.focus();
    await user.keyboard('{Enter}');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('健檢 old')).toBeInTheDocument();
  });

  /** 把一筆非疫苗的任務標成完成——疫苗是在疫苗追蹤那邊勾的，不走這個流程。 */
  const withOneDone = () => {
    const all = tasks();
    const target = all.find((task) => !task.template.vaccineId)!;

    return {
      target,
      rows: all.map((task) =>
        task.template.id === target.template.id
          ? { ...task, status: 'done' as const, completedDate: '2026-08-01' }
          : task,
      ),
    };
  };

  it('完成的項目收進已完成區，並且可以取消完成', async () => {
    // 原本 done 直接被濾掉：一按下標記完成那一列就從畫面上消失，日期填錯也
    // 沒有任何入口改回來。
    const user = userEvent.setup();
    const onUndoTask = vi.fn(async (_taskId: string) => {});
    const { target, rows } = withOneDone();

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={rows}
        onCompleteTask={noop}
        onUndoTask={onUndoTask}
      />,
    );

    const doneSection = screen
      .getByRole('heading', { name: /已完成/ })
      .closest('section')!;

    expect(within(doneSection).getByText(target.template.title)).toBeInTheDocument();

    expect(
      within(doneSection).getByText('已於 2026年8月1日 完成'),
    ).toBeInTheDocument();

    await user.click(within(doneSection).getByRole('button', { name: '取消完成' }));

    expect(onUndoTask).toHaveBeenCalledWith(target.template.id);
  });

  it('沒有取消回呼時，已完成的項目仍然看得到，只是沒有取消鍵', () => {
    const { target, rows } = withOneDone();

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={rows}
        onCompleteTask={noop}
      />,
    );

    const doneSection = screen
      .getByRole('heading', { name: /已完成/ })
      .closest('section')!;

    expect(within(doneSection).getByText(target.template.title)).toBeInTheDocument();

    expect(
      within(doneSection).queryByRole('button', { name: '取消完成' }),
    ).not.toBeInTheDocument();
  });

  it('儲存失敗時表單留著，剛填的內容還在，只說一次', async () => {
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onCompleteTask = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks()}
        onCompleteTask={onCompleteTask}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);
    await user.type(screen.getByPlaceholderText('院所（選填）'), '仁愛小兒科');
    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(onCompleteTask).toHaveBeenCalledTimes(1);

    expect(screen.getByPlaceholderText('院所（選填）')).toHaveValue('仁愛小兒科');

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('儲存失敗');
  });

  it('完成日期清空時不能送出', async () => {
    // 空字串會被 resolveScheduleStatus 當成「完成了但沒記日期」，於是那一列
    // 變成已完成，而完成日期一片空白。
    const user = userEvent.setup();
    const onCompleteTask = vi.fn(async () => {});

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks()}
        onCompleteTask={onCompleteTask}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);

    fireEvent.change(screen.getByLabelText(/完成日期/), {
      target: { value: '' },
    });

    expect(screen.getByRole('button', { name: '儲存' })).toBeDisabled();
    expect(onCompleteTask).not.toHaveBeenCalled();
  });
});

describe('DiaryPage', () => {
  const entry = (overrides: Partial<DiaryEntry> = {}): DiaryEntry => ({
    id: 'd1',
    childId: 'c1',
    date: '2026-08-20',
    content: '第一次自己穿鞋',
    createdAt: '2026-08-20T10:00:00.000Z',
    ...overrides,
  });

  const renderPage = (entries: DiaryEntry[]) =>
    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={child()}
        entries={entries}
        onAdd={async () => 'd2'}
        onUpdate={noop}
        onDelete={noop}
      />,
    );

  it('無紀錄時顯示引導文案而非空白畫面', () => {
    renderPage([]);
    expect(screen.getByText('還沒有任何紀錄')).toBeInTheDocument();
  });

  it('依月份分組，最新月份在前', () => {
    renderPage([
      entry({ id: 'old', date: '2026-06-10', content: '六月的事' }),
      entry({ id: 'new', date: '2026-08-20', content: '八月的事' }),
    ]);

    const headings = screen.getAllByRole('heading', { level: 2 });

    expect(headings.map((h) => h.textContent)).toEqual([
      '2026 年 8 月',
      '2026 年 6 月',
    ]);
  });

  it('帶成長連結的條目顯示該項目標題', () => {
    const item = developmentCheckItems[0];

    renderPage([entry({ linkedCheckItemId: item.id })]);
    expect(screen.getByText(item.title)).toBeInTheDocument();
  });

  it('連結到已不存在的項目時不渲染空標籤', () => {
    renderPage([entry({ linkedCheckItemId: 'check-removed-long-ago' })]);
    expect(screen.getByText('第一次自己穿鞋')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('刪除需二次確認，取消則不呼叫', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn(async () => {});
    // happy-dom 不提供 window.confirm，需自行注入才能觀察二次確認。
    const confirmStub = vi.fn(() => false);

    vi.stubGlobal('confirm', confirmStub);

    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={child()}
        entries={[entry()]}
        onAdd={async () => 'd2'}
        onUpdate={noop}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: '刪除' }));
    expect(confirmStub).toHaveBeenCalled();
    expect(onDelete).not.toHaveBeenCalled();

    confirmStub.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: '刪除' }));
    expect(onDelete).toHaveBeenCalledWith('d1');

    vi.unstubAllGlobals();
  });

  it('沒有寶寶時顯示引導卡', () => {
    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={null}
        entries={[]}
        onAdd={async () => undefined}
        onUpdate={noop}
        onDelete={noop}
      />,
    );

    expect(screen.getByText('還沒有寶寶資料')).toBeInTheDocument();
  });

  it('儲存失敗時不清掉剛寫的內容，並說明失敗', async () => {
    // 家長剛寫的那段話沒有別的地方存著，清掉就永遠沒了。
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onAdd = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={child()}
        entries={[]}
        onAdd={onAdd}
        onUpdate={noop}
        onDelete={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: /今天發生了什麼/ }));

    await user.type(
      screen.getByPlaceholderText('今天發生了什麼？'),
      '第一次自己穿鞋',
    );

    await user.click(screen.getByRole('button', { name: '記下來' }));

    expect(onAdd).toHaveBeenCalledTimes(1);

    expect(screen.getByPlaceholderText('今天發生了什麼？')).toHaveValue(
      '第一次自己穿鞋',
    );

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('儲存失敗');
  });

  it('刪除失敗時說明失敗，那一則還在', async () => {
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.stubGlobal(
      'confirm',
      vi.fn(() => true),
    );

    const onDelete = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={child()}
        entries={[entry()]}
        onAdd={async () => 'd2'}
        onUpdate={noop}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole('button', { name: '刪除' }));

    expect(screen.getByText('第一次自己穿鞋')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('刪除失敗');

    vi.unstubAllGlobals();
  });

  it('日期清空時不能送出', async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn(async () => 'd2');

    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={child()}
        entries={[]}
        onAdd={onAdd}
        onUpdate={noop}
        onDelete={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: /今天發生了什麼/ }));

    await user.type(screen.getByPlaceholderText('今天發生了什麼？'), '今天去公園');

    fireEvent.change(screen.getByLabelText('日期'), { target: { value: '' } });

    expect(screen.getByRole('button', { name: '記下來' })).toBeDisabled();
    expect(onAdd).not.toHaveBeenCalled();
  });
});

describe('ToddlerWikiPage', () => {
  it('搜尋與分類為 AND 關係', async () => {
    const user = userEvent.setup();

    render(<ToddlerWikiPage currentChild={child()} />);

    await user.click(
      screen.getByRole('button', { name: '如廁訓練', pressed: false }),
    );

    const beforeSearch = screen.getAllByRole('heading', { level: 3 }).length;

    expect(beforeSearch).toBeGreaterThan(0);

    await user.type(screen.getByRole('searchbox'), 'zzzz-不可能命中的字串');
    expect(screen.getByText('找不到相關文章')).toBeInTheDocument();
  });

  it('不做年齡守門，沒有寶寶也能查', () => {
    render(<ToddlerWikiPage currentChild={null} />);
    expect(screen.queryByText('還沒有寶寶資料')).not.toBeInTheDocument();

    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThan(0);
  });

  it('年齡段裡沒有文章的分類就不畫籌碼', async () => {
    // 12-18 段沒有如廁訓練與入園與社交的文章。原本籌碼照整份 CATEGORY_ORDER
    // 畫出來，一按就是 0 篇，而空狀態只會叫家長換關鍵字——把年齡篩選的結果
    // 算到關鍵字頭上。
    const user = userEvent.setup();

    render(<ToddlerWikiPage currentChild={child({ birthday: '2025-06-27' })} />);

    expect(
      screen.getByRole('button', { name: /1 歲-1 歲半/, pressed: true }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: '如廁訓練' }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: '入園與社交' }),
    ).not.toBeInTheDocument();

    const stageRow = screen.getByRole('heading', {
      name: '依年齡看',
    }).parentElement!;

    await user.click(within(stageRow).getByRole('button', { name: '全部' }));

    expect(screen.getByRole('button', { name: '如廁訓練' })).toBeInTheDocument();
  });
});

describe('欄位上限', () => {
  // 規則對日記內容、照護記錄的院所與備註各有長度上限；超過時回來的是
  // PERMISSION_DENIED，而這兩頁把它講成「請確認網路」。欄位本身不能超過規則，
  // 那句話才是真的。
  it('日記內容的上限就是規則的上限', async () => {
    const user = userEvent.setup();

    render(
      <DiaryPage
        onAddChild={noopAddChild}
        currentChild={child()}
        entries={[]}
        onAdd={async () => 'd2'}
        onUpdate={noop}
        onDelete={noop}
      />,
    );

    await user.click(screen.getByRole('button', { name: '今天發生了什麼？' }));

    expect(screen.getByPlaceholderText('今天發生了什麼？')).toHaveAttribute(
      'maxlength',
      String(DIARY_CONTENT_LIMIT),
    );
  });

  it('照護記錄的院所與備註的上限就是規則的上限', async () => {
    const user = userEvent.setup();

    const tasks = resolveCareTasks({
      birthday: TWO_YEAR_OLD,
      templates: careTaskTemplates,
      careProgress: {},
      vaccineProgress: {},
      today: NOW,
    });

    render(
      <RemindersPage
        onAddChild={noopAddChild}
        currentChild={child()}
        tasks={tasks}
        onCompleteTask={noop}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);

    expect(screen.getByPlaceholderText('院所（選填）')).toHaveAttribute(
      'maxlength',
      String(CARE_TASK_LOCATION_LIMIT),
    );

    expect(screen.getByPlaceholderText('備註（選填）')).toHaveAttribute(
      'maxlength',
      String(CARE_TASK_NOTES_LIMIT),
    );
  });
});
