import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { requiresAuth } from '~app/portal/domain/routePolicy/routePolicy';
import type { ServiceId } from '~app/portal/domain/serviceCatalogue/index';
import { SERVICE_ORDER } from '~app/portal/domain/serviceCatalogue/index';
import { SERVICE_THEME } from '../ServiceTheme/index';
import { goTo } from '~app/portal/services/navigate';
import HubLanding, { SERVICE_GROUPS } from './HubLanding';

/**
 * The main landing page is the only place a parent can discover the other
 * sub-apps: no sub-app links to any sibling, and the LittleSteps sidebar is
 * scoped to LittleSteps routes by type. If a card goes missing here, that
 * sub-app becomes unreachable without hand-editing the URL.
 */
describe('HubLanding', () => {
  /**
   * 每張卡片上「做得到什麼」那一行裡，只屬於這個服務的一句。
   *
   * 打成完整的 `Record<ServiceId, …>`，所以第六個服務不列進來就編譯不過，而
   * 底下每一條也就自動涵蓋它。一個手寫的四元素陣列，正是 LittleOuting 當初
   * 一條卡片斷言都沒有就上線的原因，`routePolicy.test.ts` 也同樣悄悄漏掉它。
   *
   * 這裡原本對的是進入按鈕的說法。按鈕已經拿掉——它只是把卡片標題重講一遍
   * ——所以改對這一行：它現在是卡片除了名稱與角色以外唯一的內容，也是「這個
   * 服務跟另外四個差在哪」真正的答案。
   */
  const DOES: Record<ServiceId, string> = {
    littlebloom: '14 次公費產檢時程與完成紀錄',
    littlesteps: '快速日誌與睡眠分析',
    littleexplorer: '12-36 個月成長檢核',
    littleouting: '全台 234 間親子館',
    babyoasis: '全台 22 縣市、3,852 處',
    littleguard: '七種兒童常見傳染病',
  };

  /** Derived from the same list the page maps over. */
  const SUB_APPS = SERVICE_ORDER.map((id) => ({
    id,
    name: SERVICE_THEME[id].name,
    role: SERVICE_THEME[id].role,
    does: DOES[id],
  }));

  /**
   * 整張卡自己就是點擊區，所以入口是包住標題的那個 `role="button"`，不是卡片
   * 裡的某顆按鈕。取不到就直接紅：那表示卡片又變回一塊點不動的區域。
   */
  function cardOf(name: string): HTMLElement {
    const card = screen
      .getByRole('heading', { name })
      .closest('[role="button"]');

    expect(card, `${name} 的卡片不是點擊區`).not.toBeNull();

    return card as HTMLElement;
  }

  it('清單涵蓋每一個服務', () => {
    // 沒有這條，SUB_APPS 少一個服務時底下兩條就只是「少測一張卡」，不會紅。
    expect([...SERVICE_ORDER].sort()).toEqual(
      Object.keys(SERVICE_THEME).sort(),
    );

    for (const app of SUB_APPS) {
      expect(app.name, `${app.id} 沒有 name`).toBeTruthy();
      expect(app.does, `${app.id} 沒有列出它做得到什麼`).toBeTruthy();
    }
  });

  it('每個子應用都有一張卡片，卡片也說得出它做什麼', () => {
    render(<HubLanding onNavigate={goTo} />);

    for (const app of SUB_APPS) {
      expect(
        screen.getByRole('heading', { name: app.name }),
      ).toBeInTheDocument();

      // 卡片縮短了，但不能縮到只剩五個英文名：角色與能力都要還在。
      expect(cardOf(app.name), app.name).toHaveTextContent(app.role);
      expect(cardOf(app.name), app.name).toHaveTextContent(app.does);
    }
  });

  it('點卡片上任何一處都導向自己的子應用', async () => {
    const user = userEvent.setup();

    for (const app of SUB_APPS) {
      const onNavigate = vi.fn();
      const { unmount } = render(<HubLanding onNavigate={onNavigate} />);

      // 點的是「做得到什麼」那一行，也就是離原本那顆按鈕最遠的地方：
      // 確認入口是整張卡，不是卡片裡某個特定元素。
      await user.click(screen.getByText(app.does, { exact: false }));
      expect(onNavigate, app.name).toHaveBeenCalledWith(app.id);

      unmount();
    }
  });

  it('卡片用鍵盤也進得去', () => {
    render(<HubLanding onNavigate={goTo} />);

    // 沒有按鈕代打之後，鍵盤路徑只剩卡片自己的 pressable；焦點停不下來，
    // 五個服務就全部只剩滑鼠進得去。
    for (const app of SUB_APPS) {
      expect(cardOf(app.name), app.name).toHaveAttribute('tabindex', '0');
    }
  });

  it('聚焦在卡片上按 Enter 或空白鍵就會進去', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<HubLanding onNavigate={onNavigate} />);

    const card = cardOf('BabyOasis');

    card.focus();
    expect(card).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onNavigate).toHaveBeenCalledWith('babyoasis');

    await user.keyboard(' ');
    expect(onNavigate, '空白鍵沒有作用').toHaveBeenCalledTimes(2);
  });

  it('卡片裡沒有第二個入口', () => {
    render(<HubLanding onNavigate={goTo} />);

    for (const app of SUB_APPS) {
      // 原本每張卡底下有一顆把標題重講一遍的全寬按鈕，吃掉近 60px 高度，
      // 又在 tab 順序裡多一個停留點，做的還是外層卡片同一件事。
      expect(
        cardOf(app.name).querySelectorAll('button').length,
        `${app.name} 卡片裡又多了一顆按鈕`,
      ).toBe(0);
    }
  });

  it('LittleExplorer 卡片點出 1-3 歲的三項能力', () => {
    render(<HubLanding onNavigate={goTo} />);

    // 三條功能現在併成一行，所以對的是這張卡的內容，而不是三個獨立節點。
    const card = cardOf('LittleExplorer');

    expect(card).toHaveTextContent('幼兒期陪伴');
    expect(card).toHaveTextContent('12-36 個月成長檢核');
    expect(card).toHaveTextContent('健檢、疫苗與塗氟提醒');
    expect(card).toHaveTextContent('幼兒百科與成長日記');
  });

  it('兩組加起來正好是每一個服務，一個不多一個不少', () => {
    // 分組之後，「漏掉一個服務」多了一條新途徑：不是少一張卡，而是整組不見。
    // 對的是 SERVICE_ORDER 而不是渲染結果，因為重複列一個服務也要擋下來。
    const grouped = SERVICE_GROUPS.flatMap((group) => group.ids);

    expect([...grouped].sort()).toEqual([...SERVICE_ORDER].sort());
    expect(new Set(grouped).size, '有服務被列進兩組').toBe(grouped.length);
  });

  it('組標題渲染得出來——它是「哪一個是我的」的答案', () => {
    render(<HubLanding onNavigate={goTo} />);

    for (const group of SERVICE_GROUPS) {
      expect(
        screen.getByRole('heading', { name: group.title }),
      ).toBeInTheDocument();
    }
  });

  it('三個階段服務都說得出自己的年齡範圍', () => {
    render(<HubLanding onNavigate={goTo} />);

    // 「寶寶成長」與「幼兒期陪伴」分不出一歲三個月的孩子該進哪一個。這三行
    // 原本在頁尾的旅程時間軸上，時間軸拿掉之後資訊必須留在卡片上。
    expect(cardOf('LittleBloom')).toHaveTextContent('0-40 週');
    expect(cardOf('LittleSteps')).toHaveTextContent('0-12 月');
    expect(cardOf('LittleExplorer')).toHaveTextContent('1-3 歲');
  });

  it('說「不需要登入」的那一組，routePolicy 確實這麼認定', () => {
    // 這句話是承諾，不是修飾語：哪天有服務被移到需登入，入口頁就在騙人。
    // 用註記去找那一組而不是寫死索引：組的順序是版面決定的，這條規則不是。
    const promising = SERVICE_GROUPS.filter((group) =>
      group.note.includes('不需要登入'),
    );

    expect(
      promising.length,
      '沒有任何一組說不需要登入了，這條規則要跟著改',
    ).toBe(1);

    for (const id of promising[0].ids) {
      expect(requiresAuth(id), `${id} 需要登入，組標題卻說不用`).toBe(false);
    }
  });

  it('有孩子時只標出目前階段那一張卡', () => {
    render(<HubLanding onNavigate={goTo} currentService="littlesteps" />);

    // 六個服務並排時家長第一個問題是「哪一個是我的」。標記回答它，而標兩張
    // 就等於沒答。未登入或還沒有孩子時 currentService 是 undefined，這一頁
    // 對訪客與以前完全一樣。
    expect(cardOf('LittleSteps')).toHaveTextContent('目前階段');
    expect(screen.getAllByText('目前階段')).toHaveLength(1);
  });

  it('沒有孩子時不標任何一張卡', () => {
    render(<HubLanding onNavigate={goTo} />);
    expect(screen.queryByText('目前階段')).not.toBeInTheDocument();
  });

  it('未登入時進入點自己就給得出登入，也說清楚登入換到什麼', async () => {
    const user = userEvent.setup();
    const onSignIn = vi.fn(async () => {});

    render(<HubLanding onNavigate={goTo} user={null} onSignIn={onSignIn} />);

    await user.click(screen.getByRole('button', { name: /使用 Google 登入/ }));
    expect(onSignIn).toHaveBeenCalled();

    // 全站唯一交代「不登入能看什麼、登入才能做什麼」的一句話。
    expect(
      screen.getByText(
        '知識內容不需登入即可閱讀；記錄功能登入後才能跨裝置同步',
      ),
    ).toBeInTheDocument();
  });

  it('已登入時不再顯示登入按鈕', () => {
    render(
      <HubLanding
        onNavigate={goTo}
        user={{ uid: 'u1' } as never}
        onSignIn={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /使用 Google 登入/ }),
    ).not.toBeInTheDocument();
  });

  it('「資料從哪裡來」整塊就是進關於頁的入口，鍵盤也進得去', async () => {
    // 這一段是入口頁最有說服力的文字，而關於頁把它講完整。它原本是一塊點不
    // 動的區域；現在整塊可按，而且不靠 onNavigate——那個 prop 只認服務。
    const user = userEvent.setup();

    window.history.replaceState(null, '', '/');
    render(<HubLanding onNavigate={goTo} />);

    const panel = screen.getByRole('button', { name: /資料從哪裡來/ });

    expect(panel).toHaveAttribute('tabindex', '0');
    expect(panel).toHaveTextContent('誰看得到');

    await user.click(panel);
    expect(window.location.pathname).toBe('/about');
  });
});
