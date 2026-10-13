import type { NursingRoom } from '../records';

/**
 * What kind of place is this nursing room in, and can a parent walk into it?
 *
 * The 國健署 dataset carries no venue type. Everything below is inferred from
 * the venue's registered name, which is the only field that describes the
 * place at all — so a category is a good guess, not a published fact. Names
 * are registered names, too: 「新光三越百貨股份有限公司台北天母分公司」 is a
 * department store and 「臺北大眾捷運股份有限公司-劍潭站」 is a metro station,
 * even though both read like a corporation. That is why the rule table below
 * is ordered and why every public-facing category is tested before `workplace`
 * and `school`.
 *
 * `isInternalVenue` is the one place the inference is joined to real evidence.
 * The map holds both 依法應設置 and 自願設置 venues; only the statutory list
 * (`room.statutory`, from the ODS the build script merges in) tells them apart.
 * A factory or a campus that is absent from that list is almost always
 * staff-or-student-only, but "almost always" is as strong as the data gets —
 * so the UI says the room looks like an internal one and never hides it by
 * default.
 */
export type RoomCategory
  = | 'transport'
    | 'shopping'
    | 'medical'
    | 'leisure'
    | 'culture'
    | 'welfare'
    | 'government'
    | 'school'
    | 'workplace'
    | 'other';

/**
 * The six a parent picks while planning where to go. The other four are
 * classified — `isInternalVenue` needs `workplace` and `school` — but nobody
 * plans an outing around a tax office, so they get no chip, and therefore no
 * label either: a label nothing renders goes stale without anyone noticing.
 */
export const CATEGORY_CHIPS = [
  'shopping',
  'transport',
  'medical',
  'leisure',
  'culture',
  'welfare',
] as const satisfies readonly RoomCategory[];

export type ChipCategory = (typeof CATEGORY_CHIPS)[number];

/** In chip order, so the row on screen reads the same as this table. */
export const CATEGORY_LABEL: Record<ChipCategory, string> = {
  shopping: '百貨・賣場',
  transport: '車站・機場',
  medical: '醫院・衛生所',
  leisure: '公園・戶外',
  culture: '圖書館・展館',
  welfare: '親子館・社福',
};

/**
 * Ordered rule table, first match wins. The order carries as much of the
 * meaning as the patterns do:
 *
 * - `transport` first, so 捷運/臺鐵 subsidiaries are stations rather than
 *   corporations. No bare `站$` — that swallows 監理站 and 移民署服務站.
 * - `government`'s department suffixes (`處$`, `局$`, …) come after the
 *   specific public venues, so 文化局 stays culture and 衛生局 stays medical.
 * - Hotels resolve to `other` on purpose: a room inside a hotel is not a
 *   destination a parent filters for, and it is not a workplace either.
 * - `workplace` and `school` are last, because their patterns (公司, 校區)
 *   appear inside the registered names of shops, stations and hospitals.
 */
const RULES: readonly (readonly [RoomCategory, RegExp])[] = [
  [
    'transport',
    /捷運|高鐵|[臺台]鐵|鐵路|火車站|車站|轉運站|客運|機場|航空站|航廈|服務區|休息站/,
  ],
  [
    'shopping',
    /百貨|購物中心|商場|商城|遠百|三越|崇光|SOGO|微風|誠品|愛買|家樂福|家福|大潤發|好市多|全聯|量販|超市|市場|夜市|商圈|宜家家居|IKEA|Citylink|[Ll]a[Ll]aport|[Oo]utlet|OUTLET|免稅|廣場/i,
  ],
  ['medical', /醫院|醫療|診所|衛生所|衛生局|保健|醫學|護理之家|長照/],
  [
    'leisure',
    // 觀光工廠/遊樂事業 are ticketed family destinations, so they belong here
    // rather than in `workplace` — being flagged as staff-only would be wrong.
    /公園|風景|遊憩|遊客|動物園|水族|農場|牧場|林場|步道|溫泉|球場|運動|體育|游泳|樂園|遊樂|觀光工廠|漁港|露營|休閒/,
  ],
  [
    'culture',
    /圖書館|文化|藝文|藝術|美術館|博物館|博物院|展覽|文物|紀念館|音樂廳|戲劇院|劇場|影城|電影|演藝|社教|科學館|教育館|故事館|偶戲館/,
  ],
  [
    'welfare',
    /社福|福利|活動中心|關懷|托育|親子館|家庭中心|育兒|婦幼|婦女|老人|服務中心|里民|集會所/,
  ],
  [
    'government',
    /公所|政府|市府|縣府|地政|戶政|稅捐|國稅|法院|警察|分局|派出所|消防|監理|郵局|銀行|農會|漁會|水利|林務|議會|代表會|管理處|事務所|服務站|[處局署部院會]$/,
  ],
  ['other', /飯店|酒店|旅館|會館|山莊|民宿/],
  [
    'school',
    // 小學/中學, not just 國小/國中: the registered names in this dataset are
    // 「臺北市中正區忠孝國民小學」 and 「臺北市私立東山高級中學」 in full.
    /國小|國中|高中|小學|中學|高工|高商|高職|大學|學院|專科|科大|幼兒園|幼稚園|托嬰|附幼|學校|校區/,
  ],
  [
    'workplace',
    /股份有限公司|有限公司|公司|工廠|廠$|廠區|科技|電子|實業|企業|工業|保險|人壽|證券|集團|營造|物流|倉儲|園區|宿舍/,
  ],
];

/** The venue type inferred from `room.name`. Never throws; falls back to `other`. */
export function categoryOf(room: NursingRoom): RoomCategory {
  for (const [category, pattern] of RULES) {
    if (pattern.test(room.name)) {
      return category;
    }
  }

  return 'other';
}

/**
 * Whether the remarks say a member of staff has to be involved — the door is
 * locked, the key is at the desk, someone has to walk you there.
 *
 * A bare 登記 is deliberately not a match. 「請自行前往哺乳室並登記」 is the
 * commonest remark in the dataset and describes a walk-in that signs a book,
 * not a detour to a service counter.
 */
const STAFF_HELP = /洽|櫃[台臺檯]|服務[台臺]|借用|鑰匙|帶領|引導|陪同|門禁|申請/;

export function needsStaffHelp(room: NursingRoom): boolean {
  return room.remarks !== undefined && STAFF_HELP.test(room.remarks);
}

/**
 * A workplace or a campus that the statutory list does not know about: the
 * room is registered, but it sits behind a staff entrance or a school gate.
 */
export function isInternalVenue(room: NursingRoom): boolean {
  const category = categoryOf(room);

  return (category === 'workplace' || category === 'school') && !room.statutory;
}

/**
 * How hard it is to walk in, as one value.
 *
 * The precedence is the reason this lives here rather than at each call site:
 * `internal` wins when both predicates fire, because "you cannot get in" is a
 * different kind of answer from "you will need to ask at the desk", which costs
 * one detour to a counter. 474 rooms carry the first and 973 the second, so a
 * list and a report disagreeing about which one applies is a silent failure —
 * nothing throws, the report just describes a claim the app never made.
 */
export type RoomAccess = 'internal' | 'staff_help' | 'open';

export function accessOf(room: NursingRoom): RoomAccess {
  if (isInternalVenue(room)) {
    return 'internal';
  }

  if (needsStaffHelp(room)) {
    return 'staff_help';
  }

  return 'open';
}

/**
 * `open` is spelled out rather than left blank, and the two callers differ in what
 * they do with it: the search list renders no tag at all, because a row with nothing
 * on it already reads as "just walk in", while a report field left blank reads
 * as "we have no data" instead. One wording, two renderings — which is why the
 * string lives here and the decision to hide it lives in the list.
 */
export const ACCESS_LABEL: Record<RoomAccess, string> = {
  internal: '內部場所',
  staff_help: '需洽服務台',
  open: '沒有特別標註',
};
