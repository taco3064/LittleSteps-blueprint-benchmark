import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ChildProfile, GrowthRecord } from '~app/domain/records';
import GrowthChartsPage from './GrowthChartsPage';
import { useGrowthTracking } from '~app/hooks/useGrowthTracking';

/**
 * 這一頁曾經同時疊兩張「沒東西」的卡：GrowthChartDisplay 的「無法顯示圖表」
 * 加上 GrowthRecordList 的「尚無記錄」。兩張講同一件事，只有後者告訴家長下一
 * 步要做什麼。這組測試守住「空狀態只出現一次」，同時守住另一半——有記錄但
 * 缺這個項目時，圖表自己的訊息仍然是對的回答，不能一起被關掉。
 *
 * 另外兩件事也釘在這裡：打錯的體重要改得回來（以前只能刪掉重建），以及
 * 讀取失敗不能被說成「還沒量過」。
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

/** 只量了體重、沒量身高的一筆——足以讓「有記錄」與「缺這項」同時成立。 */
const weightOnly: GrowthRecord = {
  id: 'g1',
  childId: 'c1',
  date: '2026-08-01',
  weight: 7.4,
  percentile: { weight: 52 },
};

const updateRecord = vi.fn();

const withRecords = (records: GrowthRecord[], error = false) =>
  vi.mocked(useGrowthTracking).mockReturnValue({
    records,
    loading: false,
    error,
    addRecord: vi.fn(),
    updateRecord,
    deleteRecord: vi.fn(),
  });

const renderPage = () => {
  const user = userEvent.setup();
  const { rerender } = render(<GrowthChartsPage currentChild={child} user={null} />);

  return {
    user,
    rerender: () => rerender(<GrowthChartsPage currentChild={child} user={null} />),
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('完全沒有記錄時', () => {
  it('只有一張空狀態卡，且是帶著下一步的那張', () => {
    withRecords([]);
    renderPage();

    expect(screen.getByRole('heading', { name: '尚無記錄' })).toBeInTheDocument();
    expect(screen.getByText('點擊「新增記錄」開始追蹤成長數據')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '無法顯示圖表' })).toBeNull();
  });

  it('沒有圖可畫，就不留下選圖的 chip', () => {
    withRecords([]);
    renderPage();

    for (const label of ['體重', '身高', '頭圍']) {
      expect(screen.queryByRole('button', { name: label })).toBeNull();
    }
  });
});

describe('有記錄但缺選中的項目時', () => {
  it('切到身高，圖表換成自己的訊息，而不是回到「尚無記錄」', async () => {
    withRecords([weightOnly]);
    const { user } = renderPage();

    // 預設的體重有資料，所以先看到圖、看不到任何空狀態。
    expect(screen.queryByRole('heading', { name: '無法顯示圖表' })).toBeNull();

    await user.click(screen.getByRole('button', { name: '身高' }));

    expect(
      screen.getByRole('heading', { name: '無法顯示圖表' }),
    ).toBeInTheDocument();

    expect(screen.getByText('尚無此項目的測量記錄')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: '尚無記錄' })).toBeNull();
  });
});

describe('改一筆打錯的記錄', () => {
  it('編輯會帶入原本的值，存檔後送出新的體重', async () => {
    withRecords([weightOnly]);
    const { user, rerender } = renderPage();

    await user.click(screen.getByRole('button', { name: /^編輯 .* 的記錄$/ }));

    const weight = await screen.findByLabelText('體重 (kg)');

    expect(weight).toHaveValue(7.4);

    // 表單開著的時候另一位照顧者改了體重，listener 推來 8.0。hook 拿來當比對
    // 基準的必須是打開表單那一刻的 7.4，不是畫面上最新的那一版——否則對方
    // 剛補的欄位在這張表單裡是空白，存下去就變成清掉它。
    withRecords([{ ...weightOnly, weight: 8.0 }]);
    rerender();

    /*
      體重欄是 step="0.01"，而 happy-dom 的 stepMismatch 用浮點取餘數判斷，
      連 8 都會被判成不合法（8 % 0.01 ≈ 0.0099…），表單就送不出去。真實瀏覽器
      是十進位比對，任何兩位小數都收。所以這裡挑一個兩邊都認可的值。
    */
    await user.clear(weight);
    await user.type(weight, '10.24');
    await user.click(screen.getByRole('button', { name: '更新' }));

    // 第三個參數是打開表單時的那一版（7.4），不是 listener 最新的那一版（8.0）。
    await waitFor(() =>
      expect(updateRecord).toHaveBeenCalledWith(
        'g1',
        expect.objectContaining({ weight: 10.24 }),
        expect.objectContaining({ id: 'g1', weight: 7.4 }),
      ),
    );
  });

  it('新增記錄開的是空白的表，不會沾到剛剛編輯的那筆', async () => {
    withRecords([weightOnly]);
    const { user } = renderPage();

    await user.click(screen.getByRole('button', { name: /^編輯 .* 的記錄$/ }));
    await screen.findByRole('heading', { name: '編輯成長記錄' });
    await user.click(screen.getByRole('button', { name: '取消' }));

    await user.click(screen.getByRole('button', { name: '新增記錄' }));

    expect(
      await screen.findByRole('heading', { name: '新增成長記錄' }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText('體重 (kg)')).toHaveValue(null);
  });
});

describe('讀不到記錄時', () => {
  it('說讀取失敗，而不是說還沒量過', () => {
    withRecords([], true);
    renderPage();

    expect(
      screen.getByText('讀不到成長記錄，請確認網路後重新載入'),
    ).toBeInTheDocument();

    expect(screen.queryByRole('heading', { name: '尚無記錄' })).toBeNull();
  });
});
