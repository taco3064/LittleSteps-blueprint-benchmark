import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ChildStoreProvider } from '../ChildStoreProvider';
import { ToastProvider } from '../Toast';
import type { ChildExportSource } from '~app/domain/childExport';
import { downloadFile } from '~app/domain/download';
import AccountButton from '../AccountButton';

/**
 * 帳號與寶寶切換原本只存在於 LittleSteps 的側邊抽屜，而那個抽屜只在
 * LittleSteps 的路由下渲染——另外四個服務登不出，也換不了孩子。
 *
 * 這組測試釘住修好之後的規則：帳號到處都碰得到，寶寶切換只出現在真的會讀
 * 孩子資料的服務裡。
 */

// vi.mock 的 factory 會被提升到檔案最上方，所以它引用的東西也必須先被提升。
const mocks = vi.hoisted(() => ({
  setCurrentChild: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
  readChildExport: vi.fn(),
  deleteAccount: vi.fn().mockResolvedValue(true),
  deleteAccountData: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('~app/domain/download', () => ({ downloadFile: vi.fn() }));

vi.mock('~app/hooks/useChildStore', () => ({
  useChildStore: () => ({
    childProfiles: [
      {
        id: 'c1',
        name: '小豆',
        birthday: '2025-02-27',
        milestoneProgress: {},
        vaccineProgress: {},
        createdAt: '2025-02-27T00:00:00.000Z',
        createdBy: 'u1',
      },
      {
        id: 'c2',
        name: '小樹',
        birthday: '2024-02-27',
        milestoneProgress: {},
        vaccineProgress: {},
        createdAt: '2024-02-27T00:00:00.000Z',
        createdBy: 'u1',
      },
    ],
    currentChildId: 'c1',
    setCurrentChild: mocks.setCurrentChild,
    addChild: vi.fn(),
    joinChild: vi.fn(),
    updateChild: vi.fn(),
    deleteChild: vi.fn(),
    readChildExport: mocks.readChildExport,
    deleteAccountData: mocks.deleteAccountData,
  }),
}));

vi.mock('~app/hooks/useAuth', async () => {
  const actual
    = await vi.importActual<typeof import('~app/contexts/Auth')>('~app/contexts/Auth');

  const value = {
    user: {
      uid: 'u1',
      displayName: '測試家長',
      email: 'test@example.com',
      photoURL: null,
    },
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: mocks.signOut,
    deleteAccount: mocks.deleteAccount,
  };

  return { ...actual, useAuth: () => value, useOptionalAuth: () => value };
});

const openSheet = async (
  service: 'littlesteps' | 'littleexplorer' | 'babyoasis' | 'littleouting',
) => {
  const user = userEvent.setup();

  render(
    <ToastProvider>
      <ChildStoreProvider>
        <AccountButton service={service} />
      </ChildStoreProvider>
    </ToastProvider>,
  );

  await user.click(screen.getByRole('button', { name: '帳號與寶寶' }));

  return user;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('每個服務都碰得到帳號', () => {
  it.each(['littlesteps', 'littleexplorer', 'babyoasis', 'littleouting'] as const)(
    '%s 可以開啟帳號視窗並登出',
    async (service) => {
      const user = await openSheet(service);

      expect(await screen.findByText('測試家長')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '登出' }));
      expect(mocks.signOut).toHaveBeenCalled();
    },
  );
});

describe('寶寶切換只出現在會讀孩子資料的服務', () => {
  it.each(['littlesteps', 'littleexplorer'] as const)(
    '%s 顯示寶寶清單並可切換',
    async (service) => {
      const user = await openSheet(service);

      expect(
        await screen.findByRole('heading', { name: '我的寶寶' }),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '小樹' }));
      expect(mocks.setCurrentChild).toHaveBeenCalledWith('c2');
    },
  );

  it.each(['babyoasis', 'littleouting'] as const)(
    '%s 不顯示寶寶切換——那裡的畫面不會因為換孩子而改變',
    async (service) => {
      await openSheet(service);

      // 帳號仍然在，只有切換器不該出現。
      expect(await screen.findByText('測試家長')).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: '我的寶寶' })).toBeNull();
    },
  );
});

describe('關於資料', () => {
  it.each(['littlesteps', 'babyoasis'] as const)(
    '%s 的帳號視窗都到得了關於頁，而且到了就把視窗收起來',
    async (service) => {
      window.history.replaceState(null, '', '/');
      const user = await openSheet(service);

      await user.click(await screen.findByRole('button', { name: /關於資料/ }));

      expect(window.location.pathname).toBe('/about');

      // 視窗留在新頁面上，看起來就像那一頁自己開了一張帳號表。AnimatePresence
      // 會讓它多留一個退場動畫的時間，所以等它消失而不是立刻斷言。
      await waitFor(() =>
        expect(screen.queryByRole('dialog', { name: '帳號與寶寶' })).toBeNull(),
      );
    },
  );
});

/**
 * 「帶得走」在這個 app 裡原本只有看診摘要、週報與行事曆三種摘要版本。整份
 * 紀錄匯出是家長離開這個 app 之後手上唯一會留下的東西，所以這裡驗的是那個
 * 檔案真的被交出去了，以及交不出去的時候他知道。
 */
describe('匯出整份紀錄', () => {
  const exportSource = (): ChildExportSource => ({
    child: {
      id: 'c1',
      name: '小豆',
      birthday: '2025-02-27',
      milestoneProgress: {},
      vaccineProgress: {},
      createdAt: '2025-02-27T00:00:00.000Z',
      createdBy: 'u1',
      members: { u1: true },
    },
    dailyLogs: [
      {
        id: 'l1',
        childId: 'c1',
        type: 'feeding',
        timestamp: '2026-01-01T08:00:00.000Z',
        data: { feedingType: 'formula', amount: 120 },
        createdAt: '2026-01-01T08:00:00.000Z',
      },
    ],
    diaryEntries: [],
    growthRecords: [],
  });

  it('每個寶寶都有自己的匯出鍵，按下去就送出一份檔案', async () => {
    mocks.readChildExport.mockResolvedValue(exportSource());
    const user = await openSheet('littlesteps');

    // 兩個寶寶各一個，而且說得出是誰的——四顆圖示鍵擠在同一列，只靠圖示分不出來。
    expect(
      await screen.findByRole('button', { name: '匯出 小樹 的資料' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '匯出 小豆 的資料' }));

    await waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(1));
    expect(mocks.readChildExport).toHaveBeenCalledWith('c1');

    const [content, filename, mimeType] = vi.mocked(downloadFile).mock.calls[0];

    expect(filename).toMatch(/^littlesteps-小豆-\d{4}-\d{2}-\d{2}\.json$/);
    expect(mimeType).toContain('application/json');

    const exported = JSON.parse(content);

    expect(exported.child.name).toBe('小豆');
    expect(exported.child.members).toBeUndefined();
    expect(exported.dailyLogs).toHaveLength(1);
    expect(exported.diaryEntries).toEqual([]);
    expect(exported.growthRecords).toEqual([]);
  });

  it('下載開始之後說一聲，不然按了跟沒按一樣', async () => {
    // 手機上的下載幾乎不出聲：Safari 只在頂端閃一下，Chrome 的下載列在分頁
    // 底下。這張抽屜自己要講，否則「檔案好了」和「這顆鍵壞了」長得一模一樣。
    mocks.readChildExport.mockResolvedValue(exportSource());
    const user = await openSheet('littlesteps');

    await user.click(
      await screen.findByRole('button', { name: '匯出 小豆 的資料' }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      '已匯出 小豆 的紀錄',
    );
  });

  it('讀取還沒回來時再按一次，不會多下載一份一模一樣的檔案', async () => {
    // 四筆讀取要一點時間，而按鍵在那段時間裡看起來跟沒按過一樣。
    // Promise.withResolvers needs lib es2024; this repo targets lower.
    let release!: (source: ChildExportSource) => void;

    mocks.readChildExport.mockReturnValue(
      new Promise<ChildExportSource>((resolve) => {
        release = resolve;
      }),
    );

    const user = await openSheet('littlesteps');

    const button = await screen.findByRole('button', { name: '匯出 小豆 的資料' });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    await user.click(button);

    release(exportSource());
    await waitFor(() => expect(downloadFile).toHaveBeenCalledTimes(1));
    expect(mocks.readChildExport).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button).toBeEnabled());
  });

  it('讀失敗時說出來，而不是安靜地什麼都不做', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.readChildExport.mockRejectedValue(new Error('PERMISSION_DENIED'));
    const user = await openSheet('littlesteps');

    await user.click(
      await screen.findByRole('button', { name: '匯出 小豆 的資料' }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent('匯出失敗');
    expect(downloadFile).not.toHaveBeenCalled();
  });
});

/**
 * 刪除帳號。兩個順序上的事實要釘住：確認視窗按取消時什麼都不刪，以及資料
 * 一定刪在 Auth 使用者之前——反過來的話，使用者一消失就沒有任何身分回得去清
 * 那些節點，孩子的紀錄會留在資料庫裡而且誰都碰不到。
 */
describe('刪除帳號', () => {
  it.each(['littlesteps', 'babyoasis'] as const)(
    '%s 的帳號視窗都到得了刪除帳號',
    async (service) => {
      await openSheet(service);

      expect(
        await screen.findByRole('button', { name: '刪除帳號' }),
      ).toBeInTheDocument();
    },
  );

  it('確認視窗按取消時，什麼都不刪', async () => {
    // happy-dom 沒有實作 window.confirm，所以是指派而不是 spyOn。
    window.confirm = vi.fn(() => false);
    const user = await openSheet('littlesteps');

    await user.click(await screen.findByRole('button', { name: '刪除帳號' }));

    // 說出留下來的是什麼：共用的孩子留給對方。這是刪帳號唯一「不是全部刪掉」
    // 的地方，而家長只有這一次機會知道。
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('和家人共用的寶寶會留給他們'),
    );

    expect(mocks.deleteAccountData).not.toHaveBeenCalled();
    expect(mocks.deleteAccount).not.toHaveBeenCalled();
  });

  it('確認之後先刪資料，才刪 Auth 使用者，然後收起視窗', async () => {
    window.confirm = vi.fn(() => true);
    const user = await openSheet('littlesteps');

    await user.click(await screen.findByRole('button', { name: '刪除帳號' }));

    await waitFor(() => expect(mocks.deleteAccount).toHaveBeenCalled());

    expect(mocks.deleteAccountData.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.deleteAccount.mock.invocationCallOrder[0],
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: '帳號與寶寶' })).toBeNull(),
    );
  });

  it('帳號沒刪掉時，視窗留著讓家長再試一次', async () => {
    // WebView 那條路要家長重新登入，而登入按鈕就在這張表上；重新驗證被取消
    // 時也一樣，刪除的入口只有這裡。
    window.confirm = vi.fn(() => true);
    mocks.deleteAccount.mockResolvedValueOnce(false);
    const user = await openSheet('littlesteps');

    await user.click(await screen.findByRole('button', { name: '刪除帳號' }));

    await waitFor(() => expect(mocks.deleteAccount).toHaveBeenCalled());
    expect(screen.getByRole('dialog', { name: '帳號與寶寶' })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: '刪除帳號' })).toBeEnabled();
  });

  it('資料刪不掉時，Auth 使用者留著', async () => {
    // 這一步失敗就停住。照樣刪掉使用者的話，那些節點就再也沒有人碰得到了。
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.deleteAccountData.mockRejectedValueOnce(new Error('PERMISSION_DENIED'));
    const user = await openSheet('littlesteps');

    await user.click(await screen.findByRole('button', { name: '刪除帳號' }));

    await waitFor(() => expect(mocks.deleteAccountData).toHaveBeenCalled());
    expect(mocks.deleteAccount).not.toHaveBeenCalled();
  });
});
