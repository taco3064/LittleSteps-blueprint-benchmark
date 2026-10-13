import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  ChildProfile,
  DailyLog,
  GrowthRecord,
} from '~app/domain/records';
import ClinicSummaryPage from './ClinicSummaryPage';
import { useGrowthTracking } from '~app/hooks/useGrowthTracking';

/**
 * 這一頁號稱「一鍵產生看診資料」，卻長期沒有任何帶得走的出口，而「特殊事項」
 * 打的字連分享都帶不出去。趨勢箭頭另外有一個獨立的錯：+0.5% 到 +1% 之間的
 * 上升會畫成向下的箭頭——在一份要交給醫師的文件上。
 */

vi.mock('~app/hooks/useGrowthTracking', () => ({
  useGrowthTracking: vi.fn(),
}));

const child: ChildProfile = {
  id: 'c1',
  name: '小豆',
  birthday: '2026-02-01',
  gender: 'female',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2026-02-01T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
};

const growth = (
  date: string,
  weight: number,
  height: number,
): GrowthRecord => ({
  id: `g-${date}`,
  childId: 'c1',
  date,
  weight,
  height,
  percentile: {},
});

const withGrowth = (records: GrowthRecord[]) =>
  vi.mocked(useGrowthTracking).mockReturnValue({
    records,
    loading: false,
    error: false,
    addRecord: vi.fn(),
    updateRecord: vi.fn(),
    deleteRecord: vi.fn(),
  });

const feedingToday = (): DailyLog => ({
  id: 'l1',
  childId: 'c1',
  type: 'feeding',
  timestamp: new Date().toISOString(),
  data: { feedingType: 'formula', amount: 150 },
  createdAt: new Date().toISOString(),
});

const renderPage = (dailyLogs: DailyLog[] = []) => {
  const user = userEvent.setup();

  render(
    <ClinicSummaryPage
      currentChild={child}
      dailyLogs={dailyLogs}
      user={null}
    />,
  );

  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
  withGrowth([]);
});

afterEach(() => {
  Reflect.deleteProperty(navigator, 'share');
});

describe('趨勢箭頭', () => {
  it('小幅上升畫的是上升的箭頭', () => {
    // 63.2 -> 63.6 是 +0.63%，落在原本判斷順序的縫裡，會畫成向下的箭頭。
    withGrowth([
      growth('2026-08-10', 7.4, 63.6),
      growth('2026-08-01', 7.4, 63.2),
    ]);

    renderPage();

    expect(screen.getByLabelText('上升')).toBeInTheDocument();
    expect(screen.queryByLabelText('下降')).toBeNull();
    expect(screen.queryByLabelText('明顯下降')).toBeNull();
  });

  it('小幅下降還是畫下降的箭頭', () => {
    // 63.6 -> 63.2 是 -0.63%。
    withGrowth([
      growth('2026-08-10', 7.4, 63.2),
      growth('2026-08-01', 7.4, 63.6),
    ]);

    renderPage();

    expect(screen.getByLabelText('下降')).toBeInTheDocument();
    expect(screen.queryByLabelText('上升')).toBeNull();
  });

  it('幾乎沒變就是持平', () => {
    withGrowth([
      growth('2026-08-10', 7.4, 63.2),
      growth('2026-08-01', 7.4, 63.2),
    ]);

    renderPage();

    expect(screen.getAllByLabelText('持平').length).toBeGreaterThan(0);
  });
});

describe('近 7 天日常摘要', () => {
  it('說出這些平均是用幾天算的', () => {
    renderPage([feedingToday()]);

    expect(screen.getByText('以 1 天的記錄計算')).toBeInTheDocument();
  });

  it('完全沒有記錄時就直說沒有', () => {
    renderPage();

    expect(screen.getByText('近 7 天沒有任何記錄')).toBeInTheDocument();
  });

  it('睡眠平均不會被記得比較勤的餵奶稀釋', () => {
    // 每天記餵奶、只有兩天記睡眠。共用一個分母的話，兩晚各 10 小時會被除成
    // 每日 2.9 小時，然後這個數字被拿給小兒科醫師看。
    const days = [0, 1, 2, 3, 4, 5, 6];

    const at = (daysAgo: number, hour: number) => {
      const d = new Date();

      d.setDate(d.getDate() - daysAgo);
      d.setHours(hour, 0, 0, 0);

      return d.toISOString();
    };

    const logs: DailyLog[] = [
      ...days.map((daysAgo) => ({
        id: `f-${daysAgo}`,
        childId: 'c1',
        type: 'feeding' as const,
        timestamp: at(daysAgo, 9),
        data: { feedingType: 'formula' as const, amount: 150 },
        createdAt: at(daysAgo, 9),
      })),
      ...[0, 1].map((daysAgo) => ({
        id: `s-${daysAgo}`,
        childId: 'c1',
        type: 'sleep' as const,
        timestamp: at(daysAgo, 21),
        data: {
          startTime: at(daysAgo, 21),
          endTime: at(daysAgo - 1, 7),
          duration: 600,
        },
        createdAt: at(daysAgo, 21),
      })),
    ];

    renderPage(logs);

    expect(screen.getByText('10 小時')).toBeInTheDocument();
    expect(screen.getByText('2 天有記錄')).toBeInTheDocument();
    // 餵奶那兩格各自寫 7 天。
    expect(screen.getAllByText('7 天有記錄')).toHaveLength(2);
  });

  it('沒記過的那一項寫「無記錄」，而不是 0', () => {
    renderPage([feedingToday()]);

    // 一筆餵奶記錄不代表寶寶那週沒睡、沒大便。
    expect(screen.getAllByText('無記錄').length).toBeGreaterThanOrEqual(2);
  });
});

describe('分享看診摘要', () => {
  it('把家長在特殊事項打的字一起帶出去', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    });

    const user = renderPage([feedingToday()]);

    await user.type(
      screen.getByPlaceholderText('可在此記錄要告知醫師的事項...'),
      '對蛋白過敏',
    );

    await user.click(screen.getByRole('button', { name: '分享看診摘要' }));

    await waitFor(() => expect(share).toHaveBeenCalled());

    const { title, text } = share.mock.calls[0][0];

    expect(title).toBe('看診摘要 - 小豆');
    expect(text).toContain('■ 特殊事項');
    expect(text).toContain('對蛋白過敏');
  });

  it('沒打字時不留一個空的特殊事項段落', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    });

    const user = renderPage([feedingToday()]);

    await user.click(screen.getByRole('button', { name: '分享看診摘要' }));

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0][0].text).not.toContain('■ 特殊事項');
  });

  it('分享的內容帶著寶寶的基本資料與樣本天數', async () => {
    const share = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'share', {
      value: share,
      configurable: true,
    });

    const user = renderPage([feedingToday()]);

    await user.click(screen.getByRole('button', { name: '分享看診摘要' }));

    await waitFor(() => expect(share).toHaveBeenCalled());

    const { text } = share.mock.calls[0][0];

    expect(text).toContain('【看診摘要】小豆');
    expect(text).toContain('性別：女');
    expect(text).toContain('■ 近 7 天日常摘要（1 天有記錄）');
  });
});
