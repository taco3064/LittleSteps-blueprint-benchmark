import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { redirectLegacyHash } from '~app/domain/navigate';
import type { Page } from '~app/domain/routes';
import App from './App';

/**
 * 路由的行為特性測試（characterization test）。
 *
 * 只驗「網址列的路徑進來會渲染出哪一頁」這個對外行為，不碰任何內部寫法。
 *
 * 這組測試原本斷言的是 hash。路由改成 History API 的真實路徑是刻意的行為
 * 變更（hash fragment 不會送到伺服器，搜尋引擎一律忽略），所以斷言跟著改；
 * 涵蓋的行為與判準一條沒少。
 */

// 未登入時所有需登入的頁面都會落到同一張服務介紹頁，彼此無法區分，
// 就驗不出路由有沒有接對。所以這裡一律以登入狀態跑。
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    callback({
      uid: 'test-uid',
      displayName: '測試家長',
      email: 'test@example.com',
    });

    return vi.fn();
  }),
  getRedirectResult: vi.fn().mockResolvedValue(null),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  getAuth: vi.fn(() => ({ currentUser: null })),
}));

/**
 * 每條路由「渲染對了」的判準。
 *
 * LittleSteps 的頁面靠頁首標題區分；LittleExplorer 的三頁在沒有寶寶資料時
 * 畫面完全一樣，只有分頁列的 aria-current 不同，就拿它當判準——順帶把
 * 「目前在哪一頁」這個無障礙語意也一起釘住。
 */
type Probe = { path: string; page: Page; expect: () => Promise<unknown> };

const heading = (text: string) => () =>
  screen.findByRole('heading', { name: new RegExp(text) }, { timeout: 5000 });

const currentTab = (label: string) => async () => {
  const tab = await screen.findByRole(
    'button',
    { name: label },
    { timeout: 5000 },
  );

  expect(tab).toHaveAttribute('aria-current', 'page');

  return tab;
};

const ROUTES: Probe[] = [
  { path: '/', page: 'home', expect: heading('從懷孕到三歲') },
  {
    path: '/littlesteps',
    page: 'littlesteps',
    expect: heading('開始記錄寶寶的成長'),
  },
  {
    path: '/littlesteps/dashboard',
    page: 'littlesteps/dashboard',
    expect: heading('成長總覽'),
  },
  {
    path: '/littlesteps/milestones',
    page: 'littlesteps/milestones',
    expect: heading('里程碑追蹤'),
  },
  {
    path: '/littlesteps/care-guide',
    page: 'littlesteps/care-guide',
    expect: heading('照顧重點'),
  },
  {
    path: '/littlesteps/vaccine-tracking',
    page: 'littlesteps/vaccine-tracking',
    expect: heading('疫苗追蹤'),
  },
  {
    path: '/littlesteps/complementary-food',
    page: 'littlesteps/complementary-food',
    expect: heading('副食品指南'),
  },
  {
    path: '/littlesteps/daily-log',
    page: 'littlesteps/daily-log',
    expect: heading('快速日誌'),
  },
  {
    path: '/littlesteps/growth-charts',
    page: 'littlesteps/growth-charts',
    expect: heading('成長曲線圖'),
  },
  {
    path: '/littlesteps/sleep-training',
    page: 'littlesteps/sleep-training',
    expect: heading('睡眠訓練'),
  },
  {
    path: '/littlesteps/sleep-analysis',
    page: 'littlesteps/sleep-analysis',
    expect: heading('睡眠分析'),
  },
  {
    path: '/littlesteps/baby-wiki',
    page: 'littlesteps/baby-wiki',
    expect: heading('寶寶百科'),
  },
  {
    path: '/littlesteps/clinic-summary',
    page: 'littlesteps/clinic-summary',
    expect: heading('看診摘要'),
  },
  {
    path: '/littlesteps/report',
    page: 'littlesteps/report',
    expect: heading('週報月報'),
  },
  {
    path: '/littlebloom',
    page: 'littlebloom',
    expect: heading('還沒有孕期檔案'),
  },
  {
    path: '/littlebloom/prenatal',
    page: 'littlebloom/prenatal',
    expect: heading('產檢時程'),
  },
  {
    path: '/littlebloom/wiki',
    page: 'littlebloom/wiki',
    expect: heading('孕期知識庫'),
  },
  {
    path: '/littleexplorer',
    page: 'littleexplorer',
    expect: currentTab('成長'),
  },
  {
    path: '/littleexplorer/reminders',
    page: 'littleexplorer/reminders',
    expect: currentTab('提醒'),
  },
  {
    path: '/littleexplorer/diary',
    page: 'littleexplorer/diary',
    expect: currentTab('日記'),
  },
  {
    path: '/littleexplorer/wiki',
    page: 'littleexplorer/wiki',
    expect: currentTab('百科'),
  },
  {
    path: '/littleouting',
    page: 'littleouting',
    expect: heading('LittleOuting'),
  },
  { path: '/babyoasis', page: 'babyoasis', expect: heading('BabyOasis') },
  { path: '/littleguard', page: 'littleguard', expect: heading('LittleGuard') },
];

const visit = (path: string) => window.history.replaceState(null, '', path);

beforeEach(() => {
  visit('/');
});

describe('深連結', () => {
  it.each(ROUTES)(
    '$path 進來會渲染 $page',
    async ({ path, expect: assertRendered }) => {
      visit(path);
      render(<App />);
      await assertRendered();
      // 路由不該在渲染後改寫網址，否則使用者分享出去的連結會變成另一頁。
      expect(window.location.pathname).toBe(path);
    },
    20000,
  );

  it('認不得的路徑落回服務集合首頁，而不是空白畫面', async () => {
    visit('/does-not-exist');
    render(<App />);
    await screen.findByRole('heading', { name: /從懷孕到三歲/ });
  });

  it('根路徑就是服務集合首頁', async () => {
    visit('/');
    render(<App />);
    await screen.findByRole('heading', { name: /從懷孕到三歲/ });
  });
});

describe('上一頁／下一頁', () => {
  it('popstate 會把畫面換成新路徑對應的頁', async () => {
    visit('/littlesteps/milestones');
    render(<App />);
    await screen.findByRole('heading', { name: /里程碑追蹤/ });

    // 瀏覽器的上一頁只改網址並送出 popstate，不會重新掛載 App。
    visit('/littlesteps/vaccine-tracking');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await screen.findByRole('heading', { name: /疫苗追蹤/ });
  }, 20000);

  it('認不得的路徑也會即時落回首頁', async () => {
    visit('/littlesteps/report');
    render(<App />);
    await screen.findByRole('heading', { name: /週報月報/ });

    visit('/garbage');
    window.dispatchEvent(new PopStateEvent('popstate'));
    await screen.findByRole('heading', { name: /從懷孕到三歲/ });
  }, 20000);
});

describe('點擊導覽寫回網址', () => {
  it('切到另一個分頁時網址跟著變，重新整理會回到同一頁', async () => {
    visit('/littleexplorer');
    render(<App />);
    const diary = await screen.findByRole('button', { name: '日記' });

    diary.click();

    await waitFor(() =>
      expect(window.location.pathname).toBe('/littleexplorer/diary'),
    );

    // 寫回去的網址必須是深連結吃得下的那一個，否則重新整理就掉回首頁。
    cleanup();
    render(<App />);
    await currentTab('日記')();
  }, 20000);

  it('側邊選單切頁時網址跟著變，重新整理會回到同一頁', async () => {
    // 分頁列與側邊選單都走 goTo，但一個在元件內自己呼叫、一個經過 App 的
    // navigateToPage；兩條寫入路徑都要驗。
    visit('/littlesteps/dashboard');
    render(<App />);
    await screen.findByRole('heading', { name: /成長總覽/ });

    (await screen.findByRole('button', { name: '開啟選單' })).click();

    const milestones = await screen.findByRole('button', {
      name: /里程碑追蹤/,
    });

    milestones.click();

    await waitFor(() =>
      expect(window.location.pathname).toBe('/littlesteps/milestones'),
    );

    await screen.findByRole('heading', { name: /里程碑追蹤/ });

    cleanup();
    render(<App />);
    await screen.findByRole('heading', { name: /里程碑追蹤/ });
  }, 20000);
});

describe('舊的 hash 連結', () => {
  it('#/ 開頭的舊連結會就地換成對應路徑', async () => {
    // 改路由之前分享出去的連結全是 hash 形式，不能因此失效。
    visit('/');
    window.location.hash = '#/littleexplorer/wiki';
    redirectLegacyHash();

    expect(window.location.pathname).toBe('/littleexplorer/wiki');
    render(<App />);
    await currentTab('百科')();
  }, 20000);

  it('已經是真實路徑時不動 hash——那是頁內錨點', () => {
    visit('/littleouting');
    window.location.hash = '#section-2';
    redirectLegacyHash();

    expect(window.location.pathname).toBe('/littleouting');
    expect(window.location.hash).toBe('#section-2');
  });
});
