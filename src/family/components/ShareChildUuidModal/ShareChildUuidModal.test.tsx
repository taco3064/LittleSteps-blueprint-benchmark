import { goTo } from '../../../portal/services/navigate/index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareChildUuidModal as ShareChildUuidModal } from '../../index';
import type { ChildProfile } from '../../domain/familyRecords/index';

/**
 * 代碼一旦傳出去就收不回來，除非這扇窗能移除其他帳號並關掉加入。這組測試釘住
 * 那條路：家長看得到有幾個帳號、關得掉加入、移得掉別人，而且寫入失敗時窗不會
 * 關、也不會假裝成功。
 */

const makeChild = (overrides: Partial<ChildProfile> = {}): ChildProfile => ({
  id: 'child-1',
  name: '小豆',
  birthday: '2025-02-27',
  milestoneProgress: {},
  vaccineProgress: {},
  createdAt: '2025-02-27T00:00:00.000Z',
  createdBy: 'u1',
  members: { u1: true },
  ...overrides,
});

const renderModal = (
  child: ChildProfile,
  handlers: {
    revokeOtherMembers?: (childId: string) => Promise<void>;
    setJoinOpen?: (childId: string, open: boolean) => Promise<void>;
  } = {},
) => {
  // setup() 會換掉 navigator.clipboard，所以剪貼簿的 spy 只能掛在它之後。
  const user = userEvent.setup();
  const writeText = vi.spyOn(navigator.clipboard, 'writeText');
  const revokeOtherMembers = vi.fn(handlers.revokeOtherMembers ?? (async () => {}));
  const setJoinOpen = vi.fn(handlers.setJoinOpen ?? (async () => {}));
  const onClose = vi.fn();

  render(
    <ShareChildUuidModal
      isOpen
      onClose={onClose}
      onAbout={() => goTo('about')}
      child={child}
      revokeOtherMembers={revokeOtherMembers}
      setJoinOpen={setJoinOpen}
    />,
  );

  return { revokeOtherMembers, setJoinOpen, onClose, writeText, user };
};

beforeEach(() => {
  vi.clearAllMocks();
  // happy-dom 沒有實作 window.confirm，所以是指派而不是 spyOn。
  window.confirm = vi.fn(() => true);
});

describe('看得到的人有幾個', () => {
  it('說出帳號數量，而不是列出沒有意義的 uid', () => {
    const child = makeChild({ members: { u1: true, u2: true } });

    renderModal(child);

    expect(
      screen.getByText('目前有 2 個帳號可以看到小豆的紀錄（包含你）'),
    ).toBeInTheDocument();

    expect(screen.queryByText(/u2/)).toBeNull();
  });
});

describe('移除其他帳號', () => {
  it('只有一個帳號時不出現——沒有人可以移除', () => {
    renderModal(makeChild());

    expect(screen.queryByRole('button', { name: /移除其他/ })).toBeNull();
  });

  it('確認之後才呼叫 revokeOtherMembers', async () => {
    window.confirm = vi.fn(() => false);
    const child = makeChild({ members: { u1: true, u2: true, u3: true } });
    const { revokeOtherMembers, user } = renderModal(child);

    const button = screen.getByRole('button', { name: '移除其他 2 個帳號的存取權' });

    await user.click(button);
    expect(revokeOtherMembers).not.toHaveBeenCalled();

    window.confirm = vi.fn(() => true);
    await user.click(button);
    expect(revokeOtherMembers).toHaveBeenCalledWith('child-1');
  });

  it('寫入被拒時留在原地、只講一次，其他帳號仍然算在裡面', async () => {
    const child = makeChild({ members: { u1: true, u2: true } });

    const { user } = renderModal(child, {
      revokeOtherMembers: () => Promise.reject(new Error('permission denied')),
    });

    await user.click(screen.getByRole('button', { name: '移除其他 1 個帳號的存取權' }));

    expect(await screen.findAllByRole('alert')).toHaveLength(1);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '移除沒有成功，其他帳號仍然看得到',
    );

    expect(screen.getByRole('dialog', { name: '分享寶寶資料' })).toBeInTheDocument();

    expect(
      screen.getByText('目前有 2 個帳號可以看到小豆的紀錄（包含你）'),
    ).toBeInTheDocument();
  });
});

describe('開放用代碼加入', () => {
  it('新的寶寶預設是關的，打開時寫入 true', async () => {
    const { setJoinOpen, user } = renderModal(makeChild());

    const toggle = screen.getByRole('switch', { name: '開放用代碼加入' });

    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await user.click(toggle);

    expect(setJoinOpen).toHaveBeenCalledWith('child-1', true);
  });

  it('已經開著時關掉它', async () => {
    const { setJoinOpen, user } = renderModal(makeChild({ joinOpen: true }));

    await user.click(screen.getByRole('switch', { name: '開放用代碼加入' }));

    expect(setJoinOpen).toHaveBeenCalledWith('child-1', false);
  });

  it('寫入被拒時開關不會移動到資料庫沒有的位置', async () => {
    const { onClose, user } = renderModal(makeChild(), {
      setJoinOpen: () => Promise.reject(new Error('offline')),
    });

    await user.click(screen.getByRole('switch', { name: '開放用代碼加入' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '設定沒有存到，開關維持原本的狀態',
    );

    expect(screen.getByRole('switch', { name: '開放用代碼加入' })).toHaveAttribute(
      'aria-checked',
      'false',
    );

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('複製代碼', () => {
  it('關著的時候先開放加入再複製，家長手上不會有加不進來的代碼', async () => {
    const { setJoinOpen, writeText, user } = renderModal(makeChild());

    await user.click(screen.getByRole('button', { name: '開放加入並複製代碼' }));

    // 按鈕改口說「已複製」是家長唯一看得到的成功訊號，等到它出現才問剪貼簿。
    expect(
      await screen.findByRole('button', { name: '已複製代碼' }),
    ).toBeInTheDocument();

    expect(setJoinOpen).toHaveBeenCalledWith('child-1', true);
    expect(writeText).toHaveBeenCalledWith('child-1');
  });

  it('開放加入失敗就不複製，並且說代碼還不能用', async () => {
    const { writeText, user } = renderModal(makeChild(), {
      setJoinOpen: () => Promise.reject(new Error('offline')),
    });

    await user.click(screen.getByRole('button', { name: '開放加入並複製代碼' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('代碼現在還不能用');
    expect(writeText).not.toHaveBeenCalled();
  });
});

describe('資料怎麼被保護', () => {
  it('把代碼交出去的這扇窗，連得到關於頁，並且先把自己關掉', async () => {
    window.history.replaceState(null, '', '/');
    const { onClose, user } = renderModal(makeChild());

    await user.click(screen.getByRole('button', { name: '看看孩子的紀錄怎麼被保護' }));

    expect(onClose).toHaveBeenCalled();
    expect(window.location.pathname).toBe('/about');
  });
});
