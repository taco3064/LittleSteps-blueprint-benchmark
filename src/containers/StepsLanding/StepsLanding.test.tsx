import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepsLanding, { FEATURES, PUBLIC_CONTENT } from './StepsLanding';
import { MAX_CHILDREN } from '~app/domain/childLimits';
import { SERVICE_HOME, requiresAuth, serviceOf } from '~app/domain/routePolicy';
import { ROUTE_PATH, type Page } from '~app/domain/routes';

/**
 * 這一頁是所有「需要登入的 LittleSteps 路由」在未登入時的落點：登出之後、
 * 從書籤進入、瀏覽器還原分頁都會到這裡。
 *
 * 它原本沒有任何通往服務集合首頁的路，頁面本身也完全沒提到 LittleBloom、
 * LittleExplorer 與 BabyOasis，於是未登入的訪客會以為整個產品就是 LittleSteps，
 * 而且只能手動改網址才出得去。LittleBloom 與 LittleExplorer 的介紹頁
 * （ServiceLandingPage）一直都有這顆按鈕，只有這一頁漏掉。
 */
describe('StepsLanding', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/littlesteps/dashboard');
  });

  const renderPage = () =>
    render(<StepsLanding onNavigate={vi.fn()} onSignIn={vi.fn()} />);

  it('提供通往所有服務的出口', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '所有服務' })).toBeInTheDocument();
  });

  /**
   * 這一頁在 App.tsx 的 isStandaloneLanding 那裡就先回傳了，外框的 <main> 走
   * 不到，所以它自己不給地標的話，未登入訪客在任何需登入的 LittleSteps 路由
   * 上拿到的第一頁就一個地標都沒有——沒有頁首可以跳、也沒有內容可以跳。
   *
   * banner 是零而不是一：整頁的 chrome 只有一顆回服務集合首頁的連結，包成
   * <header> 只會多一個什麼都沒指名的地標。
   */
  it('恰好一個 main 地標，而且沒有 banner', () => {
    renderPage();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.queryAllByRole('banner')).toHaveLength(0);
  });

  it('按下之後回到服務集合首頁，而不是停在 LittleSteps', async () => {
    const user = userEvent.setup();

    renderPage();

    await user.click(screen.getByRole('button', { name: '所有服務' }));

    expect(window.location.pathname).toBe('/');
  });

  /**
   * 這顆按鈕是未登入訪客在這一頁唯一的下一步，而整份測試原本沒有一條斷言它
   * 存在：把它整段刪掉，其餘七條全數通過，包含三條在斷言這一頁文案的。用
   * 正規表示式而不是整句比對，是因為要守的是「有一個入口會開始登入」，不是
   * 這句文案的每一個字。
   */
  it('未登入的訪客拿到登入入口，按下去就開始登入', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn();

    render(<StepsLanding onNavigate={vi.fn()} onSignIn={onSignIn} />);

    await user.click(screen.getByRole('button', { name: /Google 登入/ }));

    expect(onSignIn).toHaveBeenCalledTimes(1);
  });

  /**
   * 授權掛在 children/$childId/members，一份紀錄是整個家庭的，成員之間權限
   * 相同——這一頁原本卻寫著「僅限本人存取」。家長是照著這一段決定要不要把
   * 孩子的健康紀錄交出來的，所以它只要跟 database.rules.json 有出入，就是
   * 這一頁最嚴重的錯誤。另外兩句「永久免費」與「企業級加密」也一起收掉：
   * 一個是對未來的承諾，一個把 Firebase 的預設講成自己做的。
   */
  it('不宣稱資料庫規則給不了的獨占存取、永久免費與企業級加密', () => {
    const { container } = renderPage();

    expect(container.textContent).not.toMatch(/僅限本人存取|永久免費|企業級加密/);
  });

  it('說明家庭共用，包含成員之間可以互相移除', () => {
    renderPage();

    expect(screen.getByText(/分享代碼/)).toBeInTheDocument();
    expect(screen.getByText(/可以移除其他成員/)).toBeInTheDocument();
  });

  /**
   * 「免費」在哪裡出現，限制就要跟在哪裡——原本的頁面寫「永久免費」，一個帳號
   * 最多兩個寶寶這件事整頁沒提。用 getAllByText 是因為要守的是每一處，不是
   * 剛好存在的那一處。
   */
  it('提到免費的地方都一併說出一個帳號能追蹤幾個寶寶', () => {
    renderPage();

    const mentions = screen.getAllByText(/免費/);

    expect(mentions.length).toBeGreaterThan(0);

    mentions.forEach((mention) => {
      expect(mention.textContent).toContain(`${MAX_CHILDREN} 個寶寶`);
    });
  });

  /**
   * 該列哪幾份內容不是這一頁自己說了算。
   *
   * 這一頁是未登入訪客唯一看得到「不用帳號也讀得到哪些東西」的地方——入口頁
   * 只說了「知識內容不需登入」這句概括，睡眠指南的入口也只有這裡有。所以判準
   * 在 routePolicy：凡是不需登入的 LittleSteps 內容頁，這裡就該列得出來。
   *
   * 拿 ROUTE_PATH 與 requiresAuth 反推，而不是在測試裡手抄三個標題：手抄的那
   * 份會跟著 PUBLIC_CONTENT 一起被改，於是刪掉一項不會有任何測試變紅——這正是
   * 寶寶百科那一項原本的處境。
   */
  it('每一個免登入的 LittleSteps 內容頁都在這一頁列得出來', () => {
    // 服務首頁本身不算「列得出來的內容」——這一頁就是它。今天它需要登入，所以
    // 這個條件還用不到；寫出來是為了讓它哪天變公開時，這一條要求的是內容清單
    // 完整，而不是要求這一頁連到自己。
    const readableWithoutAccount = (Object.keys(ROUTE_PATH) as Page[]).filter(
      (page) =>
        serviceOf(page) === 'littlesteps'
        && page !== SERVICE_HOME.littlesteps
        && !requiresAuth(page),
    );

    expect([...PUBLIC_CONTENT.map((item) => item.page)].sort()).toEqual(
      [...readableWithoutAccount].sort(),
    );
  });

  /**
   * 逐項點過去，所以第四項要是接錯了、或根本沒渲染出來，這一條就會變紅，
   * 不必有人記得回來補測試。順帶守住「免登入」這件事本身：讀這些內容不該
   * 觸發登入。
   */
  it('每一則免登入內容都導到自己的頁面，而且不要求登入', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onSignIn = vi.fn();

    render(<StepsLanding onNavigate={onNavigate} onSignIn={onSignIn} />);

    for (const item of PUBLIC_CONTENT) {
      await user.click(
        screen.getByRole('button', { name: (name) => name.includes(item.title) }),
      );
    }

    expect(onNavigate.mock.calls.map(([page]) => page)).toEqual(
      PUBLIC_CONTENT.map((item) => item.page),
    );

    expect(onSignIn).not.toHaveBeenCalled();
  });

  /**
   * 這一段是整頁對「這是什麼、我為什麼要登入」的全部回答。整塊刪掉之前不會有
   * 任何測試變紅，而未登入的訪客看不到它就沒有理由登入。
   *
   * 守的是「每一項都寫得出來」，不是「剛好有五項」：項目增減是文案決定，沒有
   * 另一份清單可以拿來對帳。長度的斷言只為了讓陣列被清空時不會靜默通過。
   */
  it('登入後做得到什麼，每一項都寫得出來', () => {
    renderPage();

    expect(FEATURES.length).toBeGreaterThan(0);

    for (const feature of FEATURES) {
      expect(screen.getByText(feature.title)).toBeInTheDocument();
      expect(screen.getByText(feature.detail)).toBeInTheDocument();
    }
  });
});
