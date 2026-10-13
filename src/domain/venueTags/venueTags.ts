import type { VenueTag } from '../records';

/**
 * 場館標籤的顯示文字與分組。
 *
 * 為什麼每個標籤都是可查核的事實，而不是形容詞
 *   「有沒有尿布台」「要不要穿襪」「是不是預約制」都能在來源頁面上指出那一行
 *   字；「高 CP 值」「網美」「質感」不能。研究家長怎麼挑場館時看到的抱怨幾乎
 *   一致：滿是行銷用語的清單看不出能不能去，因為每一間都寫得一樣好。更根本的
 *   問題是形容詞會腐壞——業配文一多，形容詞的門檻就被稀釋，同一個「高 CP 值」
 *   三年後指的是完全不同的東西；而「有尿布台」三年後仍然只有兩種答案。
 *   因此這裡一個形容詞標籤都不放，UI 也不該再加。想表達品質，用 verifiedOn
 *   和 sourceUrl，讓家長自己去看來源。
 *
 * 標籤只表示「來源明載有」。沒有標籤代表「來源沒寫」，不代表「沒有」——這與
 * BabyOasis 在 facilities 為 undefined 時的處理一致，理由也相同：把「未提供
 * 資訊」講成「沒有這項設施」，會讓家長錯過其實有尿布台的場館。
 */
export const venueTagLabels: Record<VenueTag, string> = {
  // 費用與門檻
  free: '免費入場',
  needsBooking: '需預約',
  walkInQueue: '可現場排隊',
  guardianRequired: '需家長陪同',
  // 設施
  diaperTable: '尿布台',
  nursingRoom: '哺乳室',
  highChair: '兒童餐椅',
  kidsTableware: '兒童餐具',
  playArea: '遊戲區',
  toyLending: '教玩具借閱',
  // 到達
  parking: '停車場',
  nearMetro: '鄰近捷運',
  strollerAccess: '推車可進',
  // 環境與服務
  indoor: '室內',
  outdoor: '戶外空間',
  privateRoom: '可包場',
  socksRequired: '需穿襪',
};

/**
 * 篩選器的顯示順序，UI 依此順序渲染，不要重排。
 *
 * 順序是照家長決定「今天去不去」的先後排的：先確認進不進得去、要不要花錢
 * （費用與門檻），再看帶著嬰幼兒需要什麼（設施），然後才是怎麼到（到達）與
 * 現場環境。把設施排在到達之前是刻意的——沒有尿布台會直接讓行程失敗，停車
 * 不便只是麻煩。
 */
export const VENUE_TAG_GROUPS: { label: string; tags: VenueTag[] }[] = [
  {
    label: '費用與門檻',
    tags: ['free', 'needsBooking', 'walkInQueue', 'guardianRequired'],
  },
  {
    label: '設施',
    tags: [
      'diaperTable',
      'nursingRoom',
      'highChair',
      'kidsTableware',
      'playArea',
      'toyLending',
    ],
  },
  {
    label: '到達',
    tags: ['parking', 'nearMetro', 'strollerAccess'],
  },
  {
    label: '環境與服務',
    tags: ['indoor', 'outdoor', 'privateRoom', 'socksRequired'],
  },
];
