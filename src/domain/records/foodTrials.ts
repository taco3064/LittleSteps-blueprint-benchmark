import type { Clearable } from './dailyLogs';

// Complementary Food Tracking Types (副食品追蹤)
export type AllergyReactionType
  = | 'rash'
    | 'diarrhea'
    | 'vomiting'
    | 'constipation'
    | 'runny_nose'
    | 'cough'
    | 'eczema'
    | 'other';

export type FoodPreference = 'love' | 'like' | 'neutral' | 'dislike' | 'refuse';

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export interface AllergyReaction {
  type: AllergyReactionType;
  severity: AllergySeverity;
  description?: string; // Additional notes about the reaction
  date: string; // YYYY-MM-DD
}

/**
 * 嘗試日期的寫入形狀：以日期為 key 的集合，`{ '2026-09-06': true }`。
 *
 * 原本是 `['2026-09-01', '2026-09-02']`，多記一天就整個陣列重寫——共享的孩子
 * 有兩位照顧者，同一天各按一次「記錄今天嘗試」，後到的那筆連著自己手上的舊
 * 清單蓋回去，對方那一天就沒了。以日期為 key 之後，每一天是一條 leaf，
 * update() 逐條合併，兩個人的都留得住。
 */
export type TrialDateSet = Record<string, true>;

/**
 * 資料庫裡可能長的樣子。舊紀錄是陣列（資料庫存成 0、1、… 為 key 的物件），
 * 新的是日期集合；舊節點上一旦多記一天，兩種 key 就會並存在同一個物件裡：
 * `{ 0: '2026-09-01', '2026-09-06': true }`。讀的時候一律經過
 * littlesteps/utils/foodTrialDates 的 trialDatesOf，不要直接碰這個欄位。
 */
export type StoredTrialDates = string[] | Record<string, string | true>;

/** 改嘗試日期的補丁：要加的日期是 true，要拿掉的 key（日期或舊索引）是 null。 */
export type TrialDatePatch = Record<string, true | null>;

export interface FoodTrialRecord {
  id: string;
  foodName: string;
  category?: string; // 蔬菜、水果、穀類、蛋白質等
  firstTriedDate: string; // YYYY-MM-DD, first time trying this food
  trialDates?: StoredTrialDates; // 4x3 法則的嘗試日期；形狀見 StoredTrialDates
  hasAllergy: boolean;
  allergyReactions?: AllergyReaction[]; // Details if hasAllergy is true
  preference?: FoodPreference; // Baby's preference for this food
  notes?: string;
  createdAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
}

/** 表單送出、addFoodTrial 收下的一筆新紀錄：嘗試日期一律是集合。 */
export type FoodTrialInput = Omit<
  FoodTrialRecord,
  'id' | 'createdAt' | 'trialDates'
> & {
  trialDates: TrialDateSet;
};

/**
 * updateFoodTrial 收的補丁：嘗試日期只能逐條加減，不能整個換掉。
 *
 * 其餘欄位是 Clearable 而不是 Partial：家長把分類或備註清掉時要寫 null，
 * 沒被列到的欄位才是「不要動」。少了 null 這個值，清空就只能靠把欄位整個
 * 省略，而省略在 update() 眼裡等於不碰，舊值原封不動留在資料庫裡，家長刪掉
 * 的備註下次讀回來又在了（#104）。
 */
export type FoodTrialPatch = Clearable<
  Omit<FoodTrialRecord, 'id' | 'createdAt' | 'trialDates'>
> & {
  trialDates?: TrialDatePatch;
};

export interface FoodTrackingProgress {
  [foodId: string]: FoodTrialRecord;
}
