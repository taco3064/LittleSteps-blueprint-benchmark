import { ROUTE_PATH, type Page } from '~app/portal/domain/routes';

/**
 * pushState 不會觸發 popstate，所以自己換頁時得另外發一個事件，App 才知道
 * 要重畫。用具名事件而不是偽造 popstate，是為了在 devtools 裡看得出來
 * 這是誰發的。
 */
const NAVIGATION_EVENT = 'littlesteps:navigate';

/**
 * 換頁。
 *
 * 元件不需要拿到任何 callback 就能導向別的服務——App 訂閱下面的
 * subscribeToNavigation，路徑一變就跟著換畫面。
 *
 * 吃 Page 而不是字串：以前每個呼叫點都自己寫 '#/littlesteps/vaccine-tracking'
 * 這種字面值，打錯不會有任何錯誤訊息，只會靜靜地掉回首頁。現在打錯是編譯失敗。
 */
export function goTo(page: Page, options?: { search?: string }): void {
  const search = options?.search ? `?${options.search}` : '';
  const target = `${ROUTE_PATH[page]}${search}`;

  // 比對含 query 的完整網址。只比 pathname 的話，帶著不同關鍵字跳到同一個
  // 知識庫會被當成「已經在那裡了」而直接 return——網址變了、畫面沒動。
  if (`${window.location.pathname}${window.location.search}` === target) {
    return;
  }

  window.history.pushState(null, '', target);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}

/** 訂閱網址變化：瀏覽器上一頁／下一頁，以及 app 內部的換頁。 */
export function subscribeToNavigation(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATION_EVENT, onChange);

  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATION_EVENT, onChange);
  };
}

/**
 * 把舊的 `#/littlesteps/...` 連結換成對應的路徑。
 *
 * 路由從 hash 換成路徑之前分享出去的連結——LINE 群組、書籤、社群貼文——
 * 全都是 hash 形式。這裡在 React 掛載前用 replaceState 就地改寫，使用者
 * 不會看到跳轉，那些連結也繼續有效。
 */
export function redirectLegacyHash(): void {
  const { hash, pathname, search } = window.location;

  if (!hash.startsWith('#/')) {
    return;
  }

  // 只在還停在根路徑時改寫。若已經是真實路徑，hash 是頁內錨點，不該動它。
  if (pathname !== '/') {
    return;
  }

  window.history.replaceState(null, '', `${hash.slice(1)}${search}`);
}
