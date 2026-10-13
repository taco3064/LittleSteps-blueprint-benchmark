import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from 'firebase/auth';
import Sidebar from './Sidebar';

const SIGNED_IN = { uid: 'parent-1' } as unknown as User;

describe('Sidebar', () => {
  it('Escape 關得掉抽屜', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Sidebar
        isOpen
        onClose={onClose}
        currentPage="littlesteps/dashboard"
        onNavigate={vi.fn()}
        user={SIGNED_IN}
      />,
    );

    expect(
      screen.getByRole('dialog', { name: 'LittleSteps 選單' }),
    ).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('目前這一頁標成 aria-current，其他列沒有', () => {
    render(
      <Sidebar
        isOpen
        onClose={vi.fn()}
        currentPage="littlesteps/daily-log"
        onNavigate={vi.fn()}
        user={SIGNED_IN}
      />,
    );

    expect(screen.getByRole('button', { name: /快速日誌/ })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(screen.getByRole('button', { name: /儀表板/ })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('未登入時只列得出路由政策真的放行的頁面', () => {
    render(
      <Sidebar
        isOpen
        onClose={vi.fn()}
        currentPage="littlesteps/care-guide"
        onNavigate={vi.fn()}
        user={null}
      />,
    );

    for (const label of ['睡眠訓練', '照顧重點', '寶寶百科']) {
      expect(
        screen.getByRole('button', { name: new RegExp(label) }),
      ).toBeInTheDocument();
    }

    // 里程碑、疫苗、副食品三頁的清單看似是參考資料，但整頁的主體是某個孩子的
    // 勾選紀錄，白名單裡沒有它們。列出來只會讓人點進去被彈回介紹頁。
    for (const label of [
      '儀表板',
      '快速日誌',
      '成長曲線圖',
      '週報月報',
      '看診摘要',
      '里程碑追蹤',
      '疫苗追蹤',
      '副食品指南',
      '睡眠分析',
    ]) {
      expect(screen.queryByRole('button', { name: new RegExp(label) })).toBeNull();
    }

    // 三列導覽加一顆關閉鈕。多出任何一顆就是又有人在選單裡自己判斷權限。
    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('登入後十二頁全部列得出來', () => {
    render(
      <Sidebar
        isOpen
        onClose={vi.fn()}
        currentPage="littlesteps/dashboard"
        onNavigate={vi.fn()}
        user={SIGNED_IN}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(13);
  });
});
