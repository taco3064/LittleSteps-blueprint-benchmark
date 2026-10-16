import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import CountyPicker from './index';

describe('CountyPicker presentation intents', () => {
  it('reports location and county selection intents', async () => {
    const onLocate = vi.fn();
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <CountyPicker
        counties={['台北市', '花蓮縣']}
        selected="台北市"
        onLocate={onLocate}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: '用目前位置選縣市' }));

    expect(onLocate).toHaveBeenCalledOnce();
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: '花蓮縣' }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith('花蓮縣');

    expect(screen.getByRole('button', { name: '台北市' })).toHaveAttribute(
      'aria-pressed', 'true',
    );
  });
});
