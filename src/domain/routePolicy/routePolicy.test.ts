import { describe, it, expect } from 'vitest';
import { ROUTE_PATH, pageFromPath, type Page } from '../routes';
import type { ServiceId } from './routePolicy';
import {
  SERVICE_HOME,
  isStandaloneSubApp,
  requiresAuth,
  serviceOf,
} from './routePolicy';

/**
 * 執行期的 Page 清單，直接從路由表推導。
 *
 * 以前這張表是手抄的，而且靠正規表示式去 App.tsx 撈出兩張路由字典來對帳——
 * 路由真相散在三個地方，抄漏一個就會有頁面靜靜地連不進來。現在 ROUTE_PATH
 * 是唯一來源，Page 型別也由它推導，所以這裡不可能過期。
 *
 * 剩下要人決定的只有一件事：新的路由公開還是需登入。下面的 PUBLIC/GATED
 * 仍然手寫，漏了就會在「每條路由不是公開就是需登入」那條失敗。
 */
const ALL_PAGES = Object.keys(ROUTE_PATH) as Page[];

/**
 * 公開範圍是產品決定，不是實作細節。判準是「這一頁需不需要某個孩子的資料
 * 才有意義」：純知識內容不需要，一律公開。
 *
 * 用窮舉表比對，而不是各挑幾個路由抽查：新增一條路由卻沒決定它公不公開時，
 * 這裡要失敗，而不是靜靜沿用預設值。
 */
const PUBLIC: Page[] = [
  'home',
  'about',
  'littlesteps/baby-wiki',
  'littlesteps/care-guide',
  'littlesteps/sleep-training',
  'littlebloom/wiki',
  'littleexplorer/wiki',
  'littleouting',
  'babyoasis',
  'littleguard',
];

/**
 * 需要某個孩子的資料才有意義的頁面。
 *
 * 和 PUBLIC 合起來必須恰好等於 ALL_PAGES：新增一條路由卻沒決定它屬於哪一邊時，
 * 下面的分割測試會失敗。這條測試存在的理由很具體——白名單的預設值是「擋下來」，
 * 所以漏分類不會外洩，但也不會有人發現那一頁其實該公開。兩種漏都要抓。
 */
const GATED: Page[] = [
  'littlesteps',
  'littlesteps/dashboard',
  'littlesteps/milestones',
  'littlesteps/vaccine-tracking',
  'littlesteps/complementary-food',
  'littlesteps/daily-log',
  'littlesteps/growth-charts',
  'littlesteps/sleep-analysis',
  'littlesteps/clinic-summary',
  'littlesteps/report',
  'littlebloom',
  'littlebloom/prenatal',
  'littleexplorer',
  'littleexplorer/reminders',
  'littleexplorer/diary',
];

/**
 * 與 ServiceId union 同步（真身在 ui/serviceTheme.ts，routePolicy 只是轉出）；
 * 少一個，SERVICE_HOME 的窮舉就會鬆掉。
 */
const ALL_SERVICES = Object.keys({
  littlesteps: true,
  littlebloom: true,
  littleexplorer: true,
  babyoasis: true,
  littleouting: true,
  littleguard: true,
} satisfies Record<ServiceId, true>) as ServiceId[];

describe('路由表同步', () => {
  it('每條路由都能從網址列直接進來', () => {
    // 導得過去卻連不進來的頁面 = 分享出去的連結會靜靜掉回首頁。
    // 反查表由 ROUTE_PATH 推導，所以這條現在是結構保證，不是巧合。
    for (const page of ALL_PAGES) {
      expect(pageFromPath(ROUTE_PATH[page])).toBe(page);
    }
  });

  it('沒有兩頁共用同一個路徑', () => {
    // 撞號的話後面那頁永遠進不去，而型別不會抱怨——Record 的值沒有唯一性限制。
    const paths = Object.values(ROUTE_PATH);

    expect(new Set(paths).size).toBe(paths.length);
  });

  it('結尾多一條斜線還是同一頁', () => {
    // 分享連結時多一個斜線很常見，不該因此掉回首頁。
    expect(pageFromPath('/littleouting/')).toBe('littleouting');
    expect(pageFromPath('/')).toBe('home');
  });

  it('認不得的路徑回服務集合首頁', () => {
    expect(pageFromPath('/nope')).toBe('home');
    expect(pageFromPath('')).toBe('home');
  });

  it('每條路由不是公開就是需登入，沒有第三種狀態', () => {
    expect([...PUBLIC, ...GATED].sort()).toEqual([...ALL_PAGES].sort());
  });
});

describe('requiresAuth', () => {
  it('公開的就是宣告的那幾條，一條不多', () => {
    const actual = ALL_PAGES.filter((page) => !requiresAuth(page)).sort();

    expect(actual).toEqual([...PUBLIC].sort());
  });

  it('不需要孩子資料的知識頁都不需登入', () => {
    // 這幾頁不收任何 prop，只讀專案內或政府公開的靜態資料。
    expect(requiresAuth('littlesteps/baby-wiki')).toBe(false);
    expect(requiresAuth('littlesteps/care-guide')).toBe(false);
    expect(requiresAuth('littlesteps/sleep-training')).toBe(false);
    expect(requiresAuth('littlebloom/wiki')).toBe(false);
    expect(requiresAuth('littleexplorer/wiki')).toBe(false);
    expect(requiresAuth('babyoasis')).toBe(false);
    expect(requiresAuth('littleguard')).toBe(false);
  });

  it('會讀或寫孩子資料的頁面都需要登入', () => {
    for (const page of GATED) {
      expect(requiresAuth(page), page).toBe(true);
    }
  });

  it('未知路由預設需要登入，而不是預設公開', () => {
    expect(requiresAuth('littlesteps/something-new' as Page)).toBe(true);
  });
});

describe('isStandaloneSubApp', () => {
  /**
   * 這條守的是「誰靠 LittleSteps 外框」的補集，而不是再抄一份自帶版面的清單。
   *
   * 外框只認得服務集合首頁與 LittleSteps 的頁面：多出第三種，App.tsx 的
   * `currentPage as LittleStepsPage` 就會是謊話，側邊欄會掛在一個不屬於
   * LittleSteps 的頁面上；反過來少一種，那一頁就會同時拿到外框的 <main> 與
   * 自己畫的那一個，變成巢狀的兩個 main。
   */
  it('恰好切分全部路由：不是自帶版面，就是靠 LittleSteps 外框', () => {
    const shellBased = ALL_PAGES.filter((page) => !isStandaloneSubApp(page)).sort();

    expect(shellBased).toEqual(
      ALL_PAGES.filter(
        (page) => page === 'home' || page.startsWith('littlesteps'),
      ).sort(),
    );
  });
});

/** 不屬於任何服務的頁面：服務集合首頁，以及講全站資料的關於頁。 */
const SERVICELESS: Page[] = ['home', 'about'];

describe('serviceOf', () => {
  it('home 與 about 不屬於任何服務', () => {
    // about 沒有明講就會掉進最後那行 fallthrough，被當成 BabyOasis 的頁面。
    for (const page of SERVICELESS) {
      expect(serviceOf(page), page).toBeNull();
    }
  });

  it('其餘每個路由都對應到一個服務', () => {
    for (const page of ALL_PAGES) {
      if (SERVICELESS.includes(page)) {
        continue;
      }

      expect(serviceOf(page), page).not.toBeNull();
    }
  });

  it('以前綴歸屬，子路由跟著自己的服務', () => {
    expect(serviceOf('littlesteps/report')).toBe('littlesteps');
    expect(serviceOf('littlebloom/wiki')).toBe('littlebloom');
    expect(serviceOf('littleexplorer/diary')).toBe('littleexplorer');
    expect(serviceOf('babyoasis')).toBe('babyoasis');
  });

  it('littleexplorer 不會被誤判成 littlesteps', () => {
    // 兩者都以 'little' 開頭，前綴比對順序錯了就會歸錯服務。
    expect(serviceOf('littleexplorer')).toBe('littleexplorer');
    expect(serviceOf('littleexplorer/wiki')).toBe('littleexplorer');
  });

  it('littleouting 與 littleguard 歸自己，不會掉進最後那行 fallthrough', () => {
    // serviceOf 的最後一行是 `return 'babyoasis'`：任何前面沒被認領的路由都會
    // 落到那裡。新增服務時漏掉判斷，頁面不會壞，只會歸錯服務——所以要有測試。
    expect(serviceOf('littleouting')).toBe('littleouting');
    expect(serviceOf('littleguard')).toBe('littleguard');
  });

  it('只有 babyoasis 自己會被歸到 babyoasis', () => {
    expect(ALL_PAGES.filter((page) => serviceOf(page) === 'babyoasis')).toEqual([
      'babyoasis',
    ]);
  });

  it('每條路由都歸到自己前綴的服務', () => {
    for (const page of ALL_PAGES) {
      if (SERVICELESS.includes(page)) {
        continue;
      }

      const service = serviceOf(page);

      expect(page === service || page.startsWith(`${service}/`), page).toBe(true);
    }
  });

  it('每個服務的首頁都歸屬於自己', () => {
    for (const [service, home] of Object.entries(SERVICE_HOME)) {
      expect(serviceOf(home), home).toBe(service);
    }
  });
});

describe('SERVICE_HOME', () => {
  it('每個服務都有首頁，一個都不缺', () => {
    // 缺一個，被擋下的頁面就退無可退（SERVICE_HOME[id] 是 undefined）。
    expect(Object.keys(SERVICE_HOME).sort()).toEqual([...ALL_SERVICES].sort());
  });

  it('首頁都是真的存在的路由', () => {
    for (const id of ALL_SERVICES) {
      expect(ALL_PAGES, id).toContain(SERVICE_HOME[id]);
    }
  });
});
