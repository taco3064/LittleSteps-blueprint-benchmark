import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardCard from './DashboardCard';

describe('DashboardCard', () => {
  it('可點的卡片進得了 Tab，Enter 與空白鍵都能開啟', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <DashboardCard title="今日記錄" onClick={onClick}>
        <p>餵奶 3 次</p>
      </DashboardCard>,
    );

    const card = screen.getByRole('button', { name: /今日記錄/ });

    await user.tab();
    expect(card).toHaveFocus();

    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('沒有 onClick 的卡片不假裝成按鈕', () => {
    render(
      <DashboardCard title="今日記錄">
        <p>餵奶 3 次</p>
      </DashboardCard>,
    );

    expect(screen.queryByRole('button')).toBeNull();
  });
});
