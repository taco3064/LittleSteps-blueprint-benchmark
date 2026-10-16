import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChildProfile, DailyLog } from '../family/domain/familyRecords/index';
import SleepAnalysisPage from './SleepAnalysisPage';
import { useDailyLogs } from './hooks/useDailyLogs/useDailyLogs';

/**
 * 這一頁原本把「視窗長度」當分母：一晚 10 小時除以 7 天，畫面寫每日平均
 * 1.4 小時，旁邊再對照建議的 13 小時，於是每個剛開始記錄的家長都被告知
 * 寶寶嚴重睡眠不足。分母應該是有記錄的天數。
 */

vi.mock('./hooks/useDailyLogs/useDailyLogs', () => ({
  useDailyLogs: vi.fn(),
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

const sleepLog = (daysAgo: number, hours: number): DailyLog => {
  const start = new Date();

  start.setDate(start.getDate() - daysAgo);
  start.setHours(21, 0, 0, 0);
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

  return {
    id: `s-${daysAgo}`,
    childId: 'c1',
    type: 'sleep',
    timestamp: start.toISOString(),
    data: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: hours * 60,
    },
    createdAt: start.toISOString(),
  };
};

const withLogs = (logs: DailyLog[]) =>
  vi.mocked(useDailyLogs).mockReturnValue({ logs, loading: false, error: false });

const renderPage = () =>
  render(<SleepAnalysisPage currentChild={child} user={null} />);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('睡眠分析的分母', () => {
  it('一晚 10 小時的每日平均就是 10 小時，不是除以七天', () => {
    withLogs([sleepLog(1, 10)]);
    renderPage();

    // 除以七天會寫成 1.4h，而那一晚實際睡了 10 小時。
    expect(screen.queryByText('1.4h')).toBeNull();
    expect(screen.getAllByText('10.0h').length).toBeGreaterThan(0);
    expect(screen.getByText('1 天有記錄')).toBeInTheDocument();
  });

  it('選到的期間沒有記錄時不畫長條圖，也不寫 0 小時', () => {
    // 兩個月前記過，所以整頁不是空的；但「本週」這個視窗裡什麼都沒有。
    withLogs([sleepLog(60, 10)]);
    renderPage();

    expect(screen.getByText('這段時間還沒有睡眠記錄')).toBeInTheDocument();
    expect(screen.queryByText('睡眠時長對比')).toBeNull();
    expect(screen.queryByText('0.0h')).toBeNull();
  });
});
