import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { pregnancyGuides } from '~app/domain/pregnancyGuides';
import { pregnancyWikiArticles } from '~app/domain/pregnancyWiki';
import { prenatalCheckupSchedule } from '~app/domain/prenatalCheckups';
import { dueDateFromLmp, resolvePrenatalItems } from '~app/domain/prenatalSchedule';
import {
  PRENATAL_CLINIC_LIMIT,
  PRENATAL_NOTES_LIMIT,
} from '~app/domain/recordLimits';
import type { ChildProfile, Gender } from '~app/domain/records';
import LittleBloomWikiPage from '../LittleBloomWikiPage';
import PrenatalPage from '../PrenatalPage';
import LittleBloomPage from './LittleBloomPage';

/**
 * LittleBloom shipped as a shell: no code path wrote pregnancyData, so every
 * user saw week 1 forever, the weekly guide only had weeks 1-4, and the
 * prenatal card rendered a hardcoded fake appointment.
 *
 * These tests pin the behaviours that were broken, so a regression is loud.
 */

const NOW = new Date(2026, 7, 27, 12); // 2026-08-27

/** 末次月經 2026-04-06 → 2026-08-27 已滿 20 整週，顯示為第 21 週。 */
const LMP = '2026-04-06';
const DUE = '2027-01-11';
const EXPECTED_WEEK = 21;

const pregnant = (overrides: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'c1',
  name: '小花',
  birthday: DUE,
  milestoneProgress: {},
  vaccineProgress: {},
  isPregnancy: true,
  pregnancyData: {
    childId: 'c1',
    dueDate: DUE,
    lastPeriodDate: LMP,
    status: 'active',
  },
  createdAt: '2026-04-06T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...overrides,
});

const noop = async () => {};

const noopAdd: (name: string, dueDate: string) => Promise<void> = async () => {};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('LittleBloomPage', () => {
  it('依末次月經算出真正的週數，而不是永遠停在第 1 週', () => {
    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    expect(screen.getByText(`第 ${EXPECTED_WEEK} 週`)).toBeInTheDocument();
  });

  it('顯示該週的指南，而不是退回第 1 週的內容', () => {
    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    const guide = pregnancyGuides.find((g) => g.week === EXPECTED_WEEK)!;

    expect(screen.getByRole('heading', { name: guide.title })).toBeInTheDocument();
    expect(screen.queryByText(/懷孕第 1 週/)).not.toBeInTheDocument();
  });

  it('第 20 週以後顯示就醫警訊', () => {
    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    expect(screen.getByText('這些情況請盡快就醫')).toBeInTheDocument();
  });

  it('沒有孕期資料時說明原因，不假裝在第 1 週', () => {
    render(
      <LittleBloomPage
        currentChild={{
          ...pregnant(),
          isPregnancy: undefined,
          pregnancyData: undefined,
        }}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    expect(screen.getByText('還沒有孕期檔案')).toBeInTheDocument();
    expect(screen.queryByText(/第 \d+ 週$/)).not.toBeInTheDocument();
  });

  it('下一項產檢來自真實時程，不是寫死的假資料', () => {
    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    // 舊版寫死「幸福婦產科 2026-04-15」給每一位使用者。
    expect(screen.queryByText('幸福婦產科')).not.toBeInTheDocument();
    expect(screen.getByText('下一項產檢')).toBeInTheDocument();
  });

  it('產檢時程按鈕真的會導航（原本是空的 onClick）', async () => {
    const user = userEvent.setup();

    window.history.replaceState(null, '', '/littlebloom');

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /產檢時程/ }));

    expect(window.location.pathname).toBe('/littlebloom/prenatal');
  });

  // PregnancyData.status 從設計出來就存在，卻沒有任何流程會把它改成
  // archived——孕期檔案永遠停在孕期，寶寶出生後無處可去。
  it('可以登記出生，並把實際出生日期交出去', async () => {
    const user = userEvent.setup();

    const onRecordBirth = vi.fn<
      (birthday: string, gender?: Gender) => Promise<void>
    >(async () => {});

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={onRecordBirth}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /登記出生/ }));
    await user.click(screen.getByRole('button', { name: '確認出生' }));

    // 性別可以留空，之後在編輯寶寶資料補。
    expect(onRecordBirth).toHaveBeenCalledWith('2026-08-27', undefined);
  });

  it('登記出生時填的性別會一起送出——沒有它就算不出成長曲線百分位', async () => {
    const user = userEvent.setup();

    const onRecordBirth = vi.fn<
      (birthday: string, gender?: Gender) => Promise<void>
    >(async () => {});

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={onRecordBirth}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /登記出生/ }));
    await user.selectOptions(screen.getByRole('combobox'), 'female');
    await user.click(screen.getByRole('button', { name: '確認出生' }));

    expect(onRecordBirth).toHaveBeenCalledWith('2026-08-27', 'female');
  });

  it('說明出生後孕期紀錄會保留', () => {
    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    expect(screen.getByText(/孕期與產檢紀錄都會保留/)).toBeInTheDocument();
  });

  /*
   * 空白的出生日期是這四個服務裡唯一無法回復的寫入：檔案被改寫成寶寶檔案、
   * 孕期資料封存，而 calculateAge('') 是 NaN，照護時程從此永遠是空的。
   */
  it('出生日期空白時不能送出', async () => {
    const user = userEvent.setup();

    const onRecordBirth = vi.fn<
      (birthday: string, gender?: Gender) => Promise<void>
    >(async () => {});

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={onRecordBirth}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /登記出生/ }));
    fireEvent.change(screen.getByLabelText(/出生日期/), { target: { value: '' } });

    const submit = screen.getByRole('button', { name: '確認出生' });

    expect(submit).toBeDisabled();
    await user.click(submit);

    expect(onRecordBirth).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('請填入實際出生日期');
  });

  it('出生日期不能是未來的日期', async () => {
    const user = userEvent.setup();

    const onRecordBirth = vi.fn<
      (birthday: string, gender?: Gender) => Promise<void>
    >(async () => {});

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={onRecordBirth}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /登記出生/ }));

    fireEvent.change(screen.getByLabelText(/出生日期/), {
      target: { value: '2026-09-30' },
    });

    expect(screen.getByRole('button', { name: '確認出生' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('未來');
    await user.click(screen.getByRole('button', { name: '確認出生' }));
    expect(onRecordBirth).not.toHaveBeenCalled();
  });

  it('出生日期不能早於末次月經', async () => {
    const user = userEvent.setup();

    const onRecordBirth = vi.fn<
      (birthday: string, gender?: Gender) => Promise<void>
    >(async () => {});

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={onRecordBirth}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /登記出生/ }));

    fireEvent.change(screen.getByLabelText(/出生日期/), {
      target: { value: '2026-03-01' },
    });

    expect(screen.getByRole('button', { name: '確認出生' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('末次月經');
    expect(onRecordBirth).not.toHaveBeenCalled();
  });

  it('登記出生失敗時表單留著，只說一次失敗', async () => {
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onRecordBirth = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={onRecordBirth}
        onAddPregnancy={noopAdd}
      />,
    );

    await user.click(screen.getByRole('button', { name: /登記出生/ }));
    await user.click(screen.getByRole('button', { name: '確認出生' }));

    expect(onRecordBirth).toHaveBeenCalledTimes(1);
    // 表單還開著，而且只有一句話說明失敗。
    expect(screen.getByRole('button', { name: '確認出生' })).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('儲存失敗');
  });

  it('建立孕期檔案失敗時視窗留著，剛打的資料不清空', async () => {
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onAddPregnancy = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <LittleBloomPage
        currentChild={{
          ...pregnant(),
          isPregnancy: undefined,
          pregnancyData: undefined,
        }}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={onAddPregnancy}
      />,
    );

    await user.click(screen.getByRole('button', { name: '新增孕期檔案' }));
    await user.type(screen.getByLabelText(/寶寶小名/), '小花苞');
    fireEvent.change(screen.getByLabelText('預產期'), { target: { value: DUE } });
    await user.click(screen.getByRole('button', { name: '開始追蹤孕期' }));

    expect(onAddPregnancy).toHaveBeenCalledWith('小花苞', DUE);
    // 視窗沒關：關掉等於告訴家長孕期檔案建好了。
    expect(screen.getByRole('button', { name: '開始追蹤孕期' })).toBeInTheDocument();
    expect(screen.getByLabelText(/寶寶小名/)).toHaveValue('小花苞');
  });
});

describe('PrenatalPage', () => {
  it('列出依週數推算的產檢項目', () => {
    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{}}
        onComplete={noop}
        onUndo={noop}
      />,
    );

    // 每一列都以「第 N 次 · 標題」開頭，故用 getAllBy。
    expect(screen.getAllByText(/^第 \d+ 次 · /).length).toBeGreaterThan(0);

    expect(
      screen.getAllByRole('button', { name: '標記完成' }).length,
    ).toBeGreaterThan(0);
  });

  it('標記完成會帶出項目 id 與日期', async () => {
    const user = userEvent.setup();

    const onComplete = vi.fn<
      (id: string, record: { completedDate: string }) => Promise<void>
    >(async () => {});

    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{}}
        onComplete={onComplete}
        onUndo={noop}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);
    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [templateId, record] = onComplete.mock.calls[0];

    expect(templateId).toBeTruthy();
    expect(record.completedDate).toBe('2026-08-27');
  });

  it('已完成的項目移到已完成區並可取消', async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn<(id: string) => Promise<void>>(async () => {});

    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{ 'prenatal-visit-1': { completedDate: '2026-05-25' } }}
        onComplete={noop}
        onUndo={onUndo}
      />,
    );

    const doneHeading = screen.getByRole('heading', { name: /已完成/ });
    const doneSection = doneHeading.closest('section')!;

    expect(
      within(doneSection).getByText(/已於 2026年5月25日 完成/),
    ).toBeInTheDocument();

    await user.click(within(doneSection).getByRole('button', { name: '取消完成' }));
    expect(onUndo).toHaveBeenCalledWith('prenatal-visit-1');
  });

  it('沒有孕期資料時說明原因', () => {
    render(
      <PrenatalPage
        currentChild={{ ...pregnant(), pregnancyData: undefined }}
        progress={{}}
        onComplete={noop}
        onUndo={noop}
      />,
    );

    expect(screen.getByText('還沒有孕期資料')).toBeInTheDocument();
  });

  /** 末次月經 2026-02-05 → 2026-08-27 恰滿 29 整週，也就是稽核裡那位第 29 週才建檔的孕婦。 */
  const LATE_LMP = '2026-02-05';

  const startedLate = () =>
    pregnant({
      pregnancyData: {
        childId: 'c1',
        dueDate: dueDateFromLmp(LATE_LMP),
        lastPeriodDate: LATE_LMP,
        status: 'active',
      },
      createdAt: '2026-08-27T09:00:00.000Z',
    });

  it('第 29 週才開始用：沒有已過建議週數那一區，前面的產檢收在建檔前的區塊', async () => {
    // 稽核抓到的畫面：一開場就是一疊過期產檢。那是 app 沒有的病歷，
    // 不是她漏掉的產檢，不該用警示色擺在最前面。
    const user = userEvent.setup();

    const historyCount = resolvePrenatalItems({
      lastPeriodDate: LATE_LMP,
      templates: prenatalCheckupSchedule,
      completed: {},
      today: NOW,
    }).filter((item) => item.status === 'overdue').length;

    expect(historyCount).toBeGreaterThan(0);

    render(
      <PrenatalPage
        currentChild={startedLate()}
        progress={{}}
        onComplete={noop}
        onUndo={noop}
      />,
    );

    expect(screen.queryByText('已過建議週數')).not.toBeInTheDocument();
    expect(screen.getByText(`${historyCount} 項`)).toBeInTheDocument();

    // 預設收合：件數看得到，第 1 次產檢那張卡沒攤開。
    const toggle = screen
      .getByText('開始使用前就到期的項目')
      .closest('[role="button"]') as HTMLElement;

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/^第 1 次 · /)).not.toBeInTheDocument();

    await user.click(toggle);

    expect(screen.getByText(/^第 1 次 · /)).toBeInTheDocument();
    // 展開後也不講落後幾週，只留建議週數與日期。
    const history = toggle.closest('section')!;

    expect(within(history).queryByText(/已超過建議週數/)).not.toBeInTheDocument();

    expect(within(history).getAllByText(/^建議第 \d+ 週 · /).length).toBe(
      historyCount,
    );
  });

  it('落後的項目講「已超過建議週數 N 週」，不留可以兩種讀法的「已過 N 週」', () => {
    // 「已過 20 週」既可讀成「已經過了第 20 週」，也可讀成「晚了 20 週」。
    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{}}
        onComplete={noop}
        onUndo={noop}
      />,
    );

    const overdue = screen.getByText('已過建議週數').closest('section')!;

    expect(
      within(overdue).getAllByText(/已超過建議週數 \d+ 週/).length,
    ).toBeGreaterThan(0);

    expect(within(overdue).queryByText(/· 已過 \d+ 週/)).not.toBeInTheDocument();
  });

  it('儲存失敗時表單留著，剛填的內容還在，只說一次', async () => {
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onComplete = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{}}
        onComplete={onComplete}
        onUndo={noop}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);
    await user.type(screen.getByPlaceholderText('院所（選填）'), '仁愛婦幼');
    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByPlaceholderText('院所（選填）')).toHaveValue('仁愛婦幼');
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('儲存失敗');
  });

  it('儲存中的表單不接受第二次送出', async () => {
    // 兩次點擊就是兩筆寫入，而這一頁的儲存原本沒有任何 in-flight 保護。
    const user = userEvent.setup();

    let finish = () => {};

    const onComplete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );

    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{}}
        onComplete={onComplete}
        onUndo={noop}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);
    await user.click(screen.getByRole('button', { name: '儲存' }));

    expect(screen.getByRole('button', { name: '儲存中…' })).toBeDisabled();

    finish();

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: '儲存中…' }),
      ).not.toBeInTheDocument();
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('取消完成失敗時說明失敗，不靜靜吞掉', async () => {
    const user = userEvent.setup();

    vi.spyOn(console, 'error').mockImplementation(() => {});

    const onUndo = vi.fn(async () => {
      throw new Error('offline');
    });

    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{ 'prenatal-visit-1': { completedDate: '2026-05-25' } }}
        onComplete={noop}
        onUndo={onUndo}
      />,
    );

    await user.click(screen.getByRole('button', { name: '取消完成' }));

    expect(onUndo).toHaveBeenCalledWith('prenatal-visit-1');
    expect(screen.getByRole('alert')).toHaveTextContent('取消失敗');
  });
});

/**
 * 孕期知識庫累積到 24 篇時仍只有一個搜尋框：沒有分類 chip，也沒有空狀態，
 * 搜尋不到東西時整頁空白。改用共用的 WikiBrowser 後補上，這裡釘住。
 */
describe('LittleBloomWikiPage', () => {
  // 斷言可見的篇數文字而非 DOM 標題數：AnimatePresence 的離場動畫在
  // happy-dom 不會結束，被篩掉的卡片會滯留在 DOM 裡。
  const articleCount = () =>
    Number(screen.getByText(/共 \d+ 篇文章/).textContent!.match(/\d+/)![0]);

  it('提供分類篩選，而不是只能搜尋', async () => {
    const user = userEvent.setup();

    render(<LittleBloomWikiPage />);

    const total = articleCount();

    expect(total).toBe(pregnancyWikiArticles.length);

    await user.click(
      screen.getByRole('button', { name: '產檢須知', pressed: false }),
    );

    const filtered = articleCount();

    expect(filtered).toBe(
      pregnancyWikiArticles.filter((a) => a.category === 'checkup').length,
    );

    expect(filtered).toBeLessThan(total);
  });

  it('搜尋涵蓋內文，不是只比對標題', async () => {
    const user = userEvent.setup();

    render(<LittleBloomWikiPage />);

    // 取一篇文章處理步驟的內文當關鍵字；該字串不出現在任何標題裡。
    const article = pregnancyWikiArticles.find((a) => a.solutions.length > 0)!;
    const keyword = article.solutions[0].step.slice(0, 5);

    const titleMatches = pregnancyWikiArticles.filter((a) =>
      a.title.toLowerCase().includes(keyword.toLowerCase()),
    ).length;

    await user.type(screen.getByRole('searchbox'), keyword);
    expect(articleCount()).toBeGreaterThan(titleMatches);
  });

  it('搜尋無結果時顯示空狀態，而不是一片空白', async () => {
    const user = userEvent.setup();

    render(<LittleBloomWikiPage />);

    await user.type(screen.getByRole('searchbox'), 'zzzz-不可能命中的字串');
    expect(articleCount()).toBe(0);
    expect(screen.getByText('找不到相關文章')).toBeInTheDocument();
  });
});

/**
 * recordBirth 保留 lastPeriodDate 當孕期紀錄，只把 status 改成 archived。
 * 兩個頁面原本只判斷 `!lmp`，那個條件產後永遠不成立，於是生完的媽媽會一直
 * 看到「第 40 週」與還能按的「登記出生」。每位使用者最終都會走到這個狀態。
 */
describe('出生之後', () => {
  const born = (): ChildProfile => ({
    ...pregnant(),
    isPregnancy: false,
    birthday: '2026-08-20',
    pregnancyData: {
      childId: 'c1',
      lastPeriodDate: LMP,
      dueDate: DUE,
      status: 'archived',
    },
  });

  it('LittleBloom 首頁不再顯示週數，改為已出生通知', () => {
    render(
      <LittleBloomPage
        currentChild={born()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    expect(screen.getByText('寶寶已經出生了')).toBeInTheDocument();
    expect(screen.queryByText(`第 ${EXPECTED_WEEK} 週`)).not.toBeInTheDocument();
    expect(screen.queryByText(/第 \d+ 週/)).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: '登記出生' }),
    ).not.toBeInTheDocument();
  });

  it('產檢頁不再列出時程，改為已出生通知', () => {
    render(
      <PrenatalPage
        currentChild={born()}
        progress={{}}
        onComplete={noop}
        onUndo={noop}
      />,
    );

    expect(screen.getByText('寶寶已經出生了')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: '標記完成' })).toHaveLength(0);
  });

  it('仍在孕期時不會誤判為已出生', () => {
    render(
      <LittleBloomPage
        currentChild={pregnant()}
        progress={{}}
        onRecordBirth={noop}
        onAddPregnancy={noopAdd}
      />,
    );

    expect(screen.queryByText('寶寶已經出生了')).not.toBeInTheDocument();
    expect(screen.getByText(`第 ${EXPECTED_WEEK} 週`)).toBeInTheDocument();
  });
});

describe('欄位上限', () => {
  // 規則對產檢記錄的院所與備註各有長度上限；超過時回來的是 PERMISSION_DENIED，
  // 而這一頁把它講成「請確認網路」。欄位本身不能超過規則，那句話才是真的。
  it('產檢記錄的院所與備註的上限就是規則的上限', async () => {
    const user = userEvent.setup();

    render(
      <PrenatalPage
        currentChild={pregnant()}
        progress={{}}
        onComplete={noop}
        onUndo={noop}
      />,
    );

    await user.click(screen.getAllByRole('button', { name: '標記完成' })[0]);

    expect(screen.getByPlaceholderText('院所（選填）')).toHaveAttribute(
      'maxlength',
      String(PRENATAL_CLINIC_LIMIT),
    );

    expect(screen.getByPlaceholderText('備註（選填）')).toHaveAttribute(
      'maxlength',
      String(PRENATAL_NOTES_LIMIT),
    );
  });
});
