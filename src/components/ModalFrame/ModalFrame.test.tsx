import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModalFrame from './ModalFrame';

function Harness({ closeDisabled }: { closeDisabled?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        開啟表單
      </button>
      <ModalFrame
        isOpen={open}
        onClose={() => setOpen(false)}
        title="新增紀錄"
        closeDisabled={closeDisabled}
      >
        <button type="button">送出</button>
      </ModalFrame>
    </>
  );
}

describe('ModalFrame', () => {
  it('打開時把焦點移進對話框，Escape 關掉之後還給觸發它的按鈕', async () => {
    const user = userEvent.setup();

    render(<Harness />);

    const trigger = screen.getByRole('button', { name: '開啟表單' });

    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: '新增紀錄' });

    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard('{Escape}');

    expect(trigger).toHaveFocus();
  });

  it('Tab 走不出對話框', async () => {
    const user = userEvent.setup();

    render(
      <ModalFrame isOpen onClose={vi.fn()} title="新增紀錄">
        <button type="button">送出</button>
      </ModalFrame>,
    );

    const close = screen.getByRole('button', { name: '關閉' });
    const submit = screen.getByRole('button', { name: '送出' });

    await user.tab();
    expect(close).toHaveFocus();
    await user.tab();
    expect(submit).toHaveFocus();

    // 最後一個之後應該繞回開頭，而不是跑到被遮住的頁面上。
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(submit).toHaveFocus();
  });

  it('遮罩點得掉', () => {
    const onClose = vi.fn();

    render(
      <ModalFrame isOpen onClose={onClose} title="新增紀錄">
        <p>內容</p>
      </ModalFrame>,
    );

    // 遮罩沒有語意角色可以指名，它就是對話框前面那一片。
    fireEvent.click(screen.getByRole('dialog').previousElementSibling as HTMLElement);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closeDisabled 時，關閉鈕、遮罩與 Escape 三條路都關不掉', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ModalFrame isOpen onClose={onClose} title="儲存中" closeDisabled>
        <p>內容</p>
      </ModalFrame>,
    );

    const close = screen.getByRole('button', { name: '關閉' });

    expect(close).toBeDisabled();
    await user.click(close);

    fireEvent.click(screen.getByRole('dialog').previousElementSibling as HTMLElement);
    await user.keyboard('{Escape}');

    expect(onClose).not.toHaveBeenCalled();
  });
});
