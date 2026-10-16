import { nursingRoomsMeta } from '~app/knowledge/domain/nursingRoomsMeta';
import type { ViewPreferences } from '../viewPreferences';

/**
 * What the about page claims, as data rather than prose.
 *
 * The page tells a parent where the numbers on every other page come from and
 * what this app keeps about their child. Both are promises that rot quietly:
 * a dataset grows and the count printed here does not, or a preference key is
 * added and "we only store your filters" stops being true. Keeping the claims
 * in typed objects is what lets `dataSources.test.ts` hold each one against the
 * real data, the way `serviceCopy.test.ts` already holds the hub's copy.
 */

/** One upstream dataset or publication that a part of the app is built from. */
export interface DataSource {
  /** The publishing body, as a parent would recognise it. */
  agency: string;
  /** The specific dataset or publication. */
  dataset: string;
  /** What in the app is built from it. */
  what: string;
  /** Where a parent can go to see it for themselves. */
  sourceUrl: string;
  /**
   * The day the data drawn from this source was last checked against it. It is
   * the verification date the owning data file records, not the day this list
   * was written: a card saying "checked today" over data checked last month
   * would be the exact kind of claim this page exists to rule out.
   */
  verifiedOn: string;
}

/**
 * Every source the app cites, one card each.
 *
 * Nothing here is a blog, a parenting forum or a news article. The allowlist
 * in the test is the enforcement; this comment is the reason. A parent who
 * taps a card lands on the publisher, and the publisher is either a government
 * body, the WHO, or OpenStreetMap.
 */
export const DATA_SOURCES: DataSource[] = [
  {
    agency: '衛生福利部疾病管制署',
    dataset: '兒童常規疫苗接種時程與各疫苗簡介',
    what: '疫苗追蹤裡每一劑的接種時機、公費／健保給付／自費狀態、副作用與出處',
    sourceUrl: 'https://www.cdc.gov.tw/',
    // Every row of littlesteps/data/vaccines.ts was checked against its own
    // CDC page on this day.
    verifiedOn: '2026-09-04',
  },
  {
    agency: '衛生福利部疾病管制署',
    dataset: '健保門診就診人次統計（政府資料開放平臺）',
    what: '疫情雷達的每週門診人次，依縣市與年齡層，每週更新',
    sourceUrl: 'https://od.cdc.gov.tw/eic/',
    // public/data/diseaseRadar.json carries its own verifiedOn.
    verifiedOn: '2026-09-04',
  },
  {
    agency: '衛生福利部國民健康署',
    dataset: '哺集乳室地圖與依法應設置場所名單',
    what: '哺乳室地圖上的每一個地點、座標、設施與開放時間',
    sourceUrl: 'https://mammy.hpa.gov.tw/',
    // Stamped by scripts/buildNursingRooms.cjs into the sidecar the map's
    // attribution reads too, so the two can never show different dates.
    verifiedOn: nursingRoomsMeta.verifiedOn,
  },
  {
    agency: '衛生福利部社會及家庭署',
    dataset: '全國親子館（托育資源中心）名冊',
    what: '親子好去處裡全台的親子館名單、地址與電話',
    sourceUrl: 'https://www.sfaa.gov.tw/sfaa/list/detail/5eC/5Ea',
    // Every venue in public/data/familyCentres.json carries this verifiedOn.
    verifiedOn: '2026-08-28',
  },
  {
    agency: '衛生福利部與國民健康署',
    dataset: '孕產婦、嬰幼兒衛教資料與兒童預防保健服務',
    what: '三個百科的文章內容、孕期指南、兒童健檢與發展篩檢的時程',
    sourceUrl: 'https://www.hpa.gov.tw/',
    // The three wikis were checked on 2026-08-27 and 2026-09-04; the earlier
    // day is the honest one for a card that covers all of them.
    verifiedOn: '2026-08-27',
  },
  {
    agency: '世界衛生組織 WHO',
    dataset: 'Child Growth Standards（2006）',
    what: '成長曲線圖上身高、體重與頭圍的每一條百分位曲線',
    sourceUrl: 'https://www.who.int/tools/child-growth-standards',
    // littlesteps/data/growthChartData.ts was transcribed and re-checked
    // against the WHO tables on this day.
    verifiedOn: '2026-08-29',
  },
  {
    agency: 'OpenStreetMap 貢獻者',
    dataset: '捷運與輕軌車站座標（ODbL 授權）',
    what: '哺乳室地圖裡「我要去某一站」用的車站位置',
    sourceUrl: 'https://www.openstreetmap.org/copyright',
    // src/babyoasis/data/mrtStations.ts records this as its build date.
    verifiedOn: '2026-09-04',
  },
];

/**
 * How much of the country the datasets cover, as the number strip prints it.
 *
 * Typed literals, on purpose: the nursing-room and family-centre files are
 * fetched at runtime and must not be imported into this chunk, and the wiki
 * arrays are large enough that pulling all three in here for a `.length` would
 * more than double the page's weight. Each value is asserted against the real
 * data in `dataSources.test.ts`, so a regenerated dataset turns the test red
 * rather than leaving a stale number on the page.
 */
export const COVERAGE = [
  { value: 3852, unit: '處哺乳室' },
  { value: 234, unit: '間親子館' },
  { value: 36, unit: '劑疫苗' },
  { value: 85, unit: '篇百科文章' },
  { value: 7, unit: '種傳染病' },
] as const;

/**
 * The gaps the app names instead of papering over. Each number is asserted in
 * the test like the coverage above.
 */
export const HONEST_GAPS = {
  /** Counties whose family-centre access rules have no official page to cite. */
  unverifiedCentreCounties: 18,
  /** Family-friendly restaurants, labelled as a sample rather than a register. */
  restaurantSample: 12,
} as const;

/**
 * What each key the device store keeps means to a parent.
 *
 * `satisfies Record<keyof ViewPreferences, string>` is the guarantee: a key
 * added to `ViewPreferences` without a line here fails to compile, so the
 * page's sentence about what is stored on the device cannot silently fall
 * behind the store. The page prints the distinct values.
 */
export const DEVICE_STORE_DESCRIBED = {
  guardCounty: '上次看的縣市',
  guardAgeBand: '孩子的年齡層',
  outingTab: '上次停在哪一個分頁',
  outingCity: '上次看的縣市',
  oasisCity: '上次看的縣市',
  oasisDistrict: '上次看的行政區',
  oasisCategory: '場所類型的篩選',
  oasisExcludeInternal: '要不要隱藏員工與學生專用的場所',
} as const satisfies Record<keyof ViewPreferences, string>;

/** The day the copy on the about page was last read against the system it describes. */
export const ABOUT_LAST_UPDATED = '2026-09-07';
