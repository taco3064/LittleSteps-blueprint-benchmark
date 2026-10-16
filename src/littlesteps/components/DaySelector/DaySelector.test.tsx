import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DaySelector from './DaySelector';

/**
 * 這一頁原本硬寫成 `new Date()`：半夜 00:10 打開，23:40 那一餐就再也看不到了，
 * 而新生兒的餵奶大半發生在半夜。紀錄一直都載進來了，只是沒有入口。
 */

describe('DaySelector', () => {
  it('今天就說今天，不用讀日期', async () => {
    render(<DaySelector value={new Date()} onChange={() => {}} />);

    expect(screen.getByText('今天')).toBeInTheDocument();
  });

  it('往前一天會退一天，跨月也對', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    // 3 月 1 日往前是 2 月最後一天——不是 3 月 0 日。
    render(<DaySelector value={new Date(2026, 2, 1)} onChange={onChange} />);

    await user.click(screen.getByLabelText('前一天'));

    const moved = onChange.mock.calls[0][0] as Date;

    expect(moved.getMonth()).toBe(1);
    expect(moved.getDate()).toBe(28);
  });

  it('今天不能再往後——未來沒有紀錄，只會是一片空白', () => {
    render(<DaySelector value={new Date()} onChange={() => {}} />);

    expect(screen.getByLabelText('後一天')).toBeDisabled();
  });

  it('回到過去以後可以再往後走', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);
    render(<DaySelector value={yesterday} onChange={onChange} />);

    const forward = screen.getByLabelText('後一天');

    expect(forward).not.toBeDisabled();
    await user.click(forward);

    const moved = onChange.mock.calls[0][0] as Date;

    expect(moved.getDate()).toBe(new Date().getDate());
  });

  it('不是今天的話會寫出是哪一天', () => {
    render(<DaySelector value={new Date(2026, 7, 15)} onChange={() => {}} />);

    // 星期幾要算對：2026-08-15 是週六。
    expect(screen.getByText('8月15日（六）')).toBeInTheDocument();
    expect(screen.getByText('2026-08-15')).toBeInTheDocument();
  });
});
