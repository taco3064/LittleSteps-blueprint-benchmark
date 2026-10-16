import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { toLocalDateKey } from '~app/platform/domain/calendar';
import type { FoodTrialRecord } from '../../../family/domain/familyRecords/index';
import FourByThreeTracker from './FourByThreeTracker';

/**
 * 這個追蹤器實作的是同一頁印出來的 4x3 試敏法：三個各 3 天的階段，同一種食物
 * 天天給。它原本卻要求兩次之間隔 3 天，還把「記錄今天嘗試」藏起來三天——照著
 * 步驟做的家長昨天試過，今天就按不下去。
 */

const dayOffset = (days: number) => {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return toLocalDateKey(date);
};

const food = (trialDates: string[]): FoodTrialRecord => ({
  id: 'f1',
  foodName: '地瓜',
  firstTriedDate: trialDates[0] ?? toLocalDateKey(),
  trialDates,
  hasAllergy: false,
  createdAt: '2026-08-01T00:00:00.000Z',
});

const renderTracker = (foodTrials: FoodTrialRecord[]) => {
  const onAddTrialDate = vi.fn();
  const user = userEvent.setup();

  render(
    <FourByThreeTracker
      foodTrials={foodTrials}
      onAddTrialDate={onAddTrialDate}
      onViewFood={vi.fn()}
    />,
  );

  return { user, onAddTrialDate };
};

describe('連續兩天嘗試同一種食物', () => {
  it('昨天試過，今天還是記得下去', async () => {
    const { user, onAddTrialDate } = renderTracker([food([dayOffset(-1)])]);

    await user.click(screen.getByRole('button', { name: '記錄今天嘗試' }));

    expect(onAddTrialDate).toHaveBeenCalledWith('f1');
  });

  it('前天、昨天都試過，今天照樣可以記', async () => {
    const { user, onAddTrialDate } = renderTracker([
      food([dayOffset(-2), dayOffset(-1)]),
    ]);

    await user.click(screen.getByRole('button', { name: '記錄今天嘗試' }));

    expect(onAddTrialDate).toHaveBeenCalledWith('f1');
  });

  it('今天已經記過就不再給記第二次', () => {
    renderTracker([food([dayOffset(-1), toLocalDateKey()])]);

    expect(screen.queryByRole('button', { name: '記錄今天嘗試' })).toBeNull();
    expect(screen.getByText('今天已記錄')).toBeInTheDocument();
  });
});

describe('進度依照指南的三個階段', () => {
  it('前三天在小量階段，總天數是 9 天', () => {
    renderTracker([food([dayOffset(-1)])]);

    expect(screen.getByText('進度：1 / 9 天')).toBeInTheDocument();
    expect(screen.getByText('小量試3天')).toBeInTheDocument();
  });

  it('記滿三天就進到增量階段', () => {
    renderTracker([food([dayOffset(-3), dayOffset(-2), dayOffset(-1)])]);

    expect(screen.getByText('進度：3 / 9 天')).toBeInTheDocument();
    expect(screen.getByText('增量試3天')).toBeInTheDocument();
  });

  it('記滿九天就不再是追蹤中的食物', () => {
    renderTracker([food(Array.from({ length: 9 }, (_, i) => dayOffset(-9 + i)))]);

    expect(
      screen.getByRole('heading', { name: '目前沒有正在追蹤的食物' }),
    ).toBeInTheDocument();

    expect(screen.getByText('1 種食物已完成 9 天的試敏追蹤')).toBeInTheDocument();
  });
});
