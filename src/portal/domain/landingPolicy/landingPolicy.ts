import { requiresAuth, serviceOf } from '../routePolicy';
import type { Page } from '../routes';

export type LandingKind
  = 'hub' | 'steps-intro' | 'service-intro' | 'first-child';

/** 這一頁該顯示哪一種首頁；有實際內容可看時回傳 null，交還給 App 渲染真正的頁面。 */
export function landingKindFor(
  page: Page,
  user: { uid: string } | null,
  hasChildren: boolean,
): LandingKind | null {
  if (page === 'home') {
    return 'hub';
  }

  // 未登入又需要登入的頁面：顯示該服務的自我介紹，網址保持不變，
  // 登入後同一個路由就會渲染出使用者原本要去的地方。
  if (!user && requiresAuth(page)) {
    const service = serviceOf(page);

    return service === 'littlebloom' || service === 'littleexplorer'
      ? 'service-intro'
      : 'steps-intro';
  }

  if (page === 'littlesteps') {
    if (!user) {
      return 'steps-intro';
    }

    if (!hasChildren) {
      return 'first-child';
    }
  }

  return null;
}

/**
 * 介紹頁自帶版面，不能套 LittleSteps 的 header 與側邊欄；
 * 服務集合首頁與「先新增寶寶」則要留在既有版面裡（後者還得開側邊欄）。
 */
export function isStandaloneLanding(kind: LandingKind): boolean {
  return kind === 'steps-intro' || kind === 'service-intro';
}
