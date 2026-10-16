/**
 * 路由表：這個 app 所有的頁面，以及每一頁在網址列上的樣子。
 *
 * 六個服務：
 * - home: 服務集合首頁
 * - LittleSteps: 0-1 歲寶寶追蹤
 * - LittleBloom: 孕期陪伴
 * - LittleExplorer: 1-3 歲幼兒陪伴
 * - LittleOuting: 親子好去處
 * - BabyOasis: 哺乳室地圖
 * - LittleGuard: 疫情雷達
 *
 * 這張表是唯一的事實來源。Page 型別由它推導，反查表也由它推導，所以
 * 「加了一頁卻只加了一半」在型別上就不成立——不會再出現能導過去、卻無法
 * 從網址直接進來的頁面（深連結靜默掉回首頁），或反過來。
 *
 * 路徑而不是 hash：`#/littleexplorer/wiki` 之類的 fragment 不會送到伺服器，
 * 搜尋引擎一律忽略，整個站等於只有一個可索引的網址。85 篇查證過出處的
 * 百科文章因此完全搜不到。舊的 hash 連結由 redirectLegacyHash() 接住。
 */
export const ROUTE_PATH = {
  home: '/',
  // 關於資料：孩子的紀錄存在哪裡、誰看得到，以及每一頁的內容出自哪一份公開
  // 資料。和 home 一樣不屬於任何服務。
  about: '/about',
  littlesteps: '/littlesteps',
  'littlesteps/dashboard': '/littlesteps/dashboard',
  'littlesteps/milestones': '/littlesteps/milestones',
  'littlesteps/care-guide': '/littlesteps/care-guide',
  'littlesteps/vaccine-tracking': '/littlesteps/vaccine-tracking',
  'littlesteps/complementary-food': '/littlesteps/complementary-food',
  'littlesteps/daily-log': '/littlesteps/daily-log',
  'littlesteps/growth-charts': '/littlesteps/growth-charts',
  'littlesteps/sleep-training': '/littlesteps/sleep-training',
  'littlesteps/sleep-analysis': '/littlesteps/sleep-analysis',
  'littlesteps/baby-wiki': '/littlesteps/baby-wiki',
  'littlesteps/clinic-summary': '/littlesteps/clinic-summary',
  'littlesteps/report': '/littlesteps/report',
  littlebloom: '/littlebloom',
  'littlebloom/prenatal': '/littlebloom/prenatal',
  'littlebloom/wiki': '/littlebloom/wiki',
  littleexplorer: '/littleexplorer',
  'littleexplorer/reminders': '/littleexplorer/reminders',
  'littleexplorer/diary': '/littleexplorer/diary',
  'littleexplorer/wiki': '/littleexplorer/wiki',
  littleouting: '/littleouting',
  babyoasis: '/babyoasis',
  littleguard: '/littleguard',
} as const;

export type Page = keyof typeof ROUTE_PATH;

/** LittleSteps 自己的頁面（側邊選單用）。 */
export type LittleStepsPage = Extract<Page, `littlesteps${string}`>;

const PAGE_BY_PATH = new Map<string, Page>(
  (Object.entries(ROUTE_PATH) as [Page, string][]).map(([page, path]) => [
    path,
    page,
  ]),
);

/**
 * 網址列的路徑對應到哪一頁。認不得的一律回服務集合首頁——使用者把網址
 * 打錯、或舊連結失效時，看到入口比看到空白畫面好。
 *
 * 結尾的斜線一律忽略：/littleouting 與 /littleouting/ 是同一頁，不然分享
 * 出去的連結會因為多一個字元就掉回首頁。
 */
export function pageFromPath(pathname: string): Page {
  const normalised
    = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  return PAGE_BY_PATH.get(normalised || '/') ?? 'home';
}
