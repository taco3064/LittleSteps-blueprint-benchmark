import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../../index';
import { useToast } from '../../hooks/useToast/index';

/**
 * 25 處失敗訊息原本都用 window.alert：凍住整個分頁、樣式不受控、在已安裝的
 * PWA 裡跳出瀏覽器對話框，而且一次只能一則。抱著孩子的人得先騰出手點掉。
 */

function Trigger({ message, tone }: { message: string; tone?: 'error' | 'success' }) {
  const toast = useToast();

  return (
    <button type="button" onClick={() => toast.show(message, tone)}>
      觸發
    </button>
  );
}

describe('ToastProvider', () => {
  it('顯示訊息，而且不擋住畫面其他部分', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <Trigger message="儲存失敗，請稍後再試" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '觸發' }));

    expect(screen.getByText('儲存失敗，請稍後再試')).toBeInTheDocument();
    // 觸發它的按鈕仍然可以按——alert 會把整頁凍住。
    expect(screen.getByRole('button', { name: '觸發' })).toBeEnabled();
  });

  it('失敗訊息要打斷朗讀，成功訊息不必', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ToastProvider>
        <Trigger message="失敗了" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '觸發' }));
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'assertive');

    rerender(
      <ToastProvider>
        <Trigger message="已複製" tone="success" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '觸發' }));

    const polite = screen
      .getAllByRole('status')
      .find((el) => el.textContent?.includes('已複製'));

    expect(polite).toHaveAttribute('aria-live', 'polite');
  });

  it('可以手動關掉，不必等它自己消失', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <Trigger message="關掉我" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '觸發' }));
    await user.click(screen.getByRole('button', { name: '關閉訊息' }));

    // AnimatePresence 的退場動畫還在跑，節點會殘留一下。
    await waitFor(() => expect(screen.queryByText('關掉我')).toBeNull());
  });

  it('多則訊息會排隊，不會互相覆蓋', async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <Trigger message="第一則" />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: '觸發' }));
    await user.click(screen.getByRole('button', { name: '觸發' }));

    expect(screen.getAllByText('第一則')).toHaveLength(2);
  });

  it('時間到了自己消失，不必使用者動手', async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <Trigger message="會自己走" />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole('button', { name: '觸發' }).click();
    });

    expect(screen.getByText('會自己走')).toBeInTheDocument();

    // 推過自動關閉的時間，讓移除排進 state。
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // 退場動畫跑在 rAF 上，假時鐘推不動它——換回真時鐘等它收尾。
    vi.useRealTimers();
    await waitFor(() => expect(screen.queryByText('會自己走')).toBeNull());
  });
});

describe('沒有 provider 時', () => {
  beforeEach(() => {
    // happy-dom 沒有實作 window.alert，spyOn 會拒絕沒有東西可以攔的目標。
    window.alert = () => {};

    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('退回 alert 而不是讓畫面壞掉', async () => {
    // 這些呼叫點全都在報告失敗；為了通知機制沒接上而丟例外，等於把小失敗
    // 放大成整頁錯誤。
    const user = userEvent.setup();

    render(<Trigger message="沒有 provider" />);

    await user.click(screen.getByRole('button', { name: '觸發' }));
    expect(window.alert).toHaveBeenCalledWith('沒有 provider');
  });
});
