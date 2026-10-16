export interface MilestoneProgress {
  [milestoneId: string]: {
    achieved: boolean;
    achievedDate?: string; // Optional: date in 'YYYY-MM-DD' format
  };
}

export interface VaccineProgress {
  [vaccineId: string]: {
    doses: {
      [doseNumber: number]: {
        administered: boolean;
        administeredDate?: string; // YYYY-MM-DD
      };
    };
  };
}

export interface ChildProfile {
  id: string; // Unique UUID for sharing across family members
  name: string;
  birthday: string; // YYYY-MM-DD
  gender?: Gender; // Optional: for growth chart percentiles
  /**
   * 出生時的妊娠週數與天數，例如 32 週 3 天。只有早產兒需要填。
   *
   * 有了它，生長曲線、里程碑與發展檢核才算得出矯正年齡（見
   * common/correctedAge）。沒填一律當足月處理，行為與這個欄位存在之前完全
   * 相同。公費疫苗與兒童健檢刻意不受它影響——那些時程照實際出生日期算。
   */
  gestationalAgeWeeks?: number;
  gestationalAgeDays?: number;
  milestoneProgress: MilestoneProgress;
  vaccineProgress: VaccineProgress;
  foodTrackingProgress?: FoodTrackingProgress; // Optional: complementary food tracking
  // LittleExplorer (幼兒期 1-3 歲) fields
  developmentProgress?: DevelopmentCheckProgress;
  careTaskProgress?: CareTaskProgress;
  toothProgress?: ToothProgress;
  // Pregnancy specific fields
  isPregnancy?: boolean;
  pregnancyData?: PregnancyData;
  prenatalProgress?: PrenatalCheckupProgress;
  createdAt: string; // ISO string
  createdBy: string; // User ID who created this child profile
  /**
   * 誰讀得到、寫得了這份健康紀錄——授權就存在這裡。
   *
   * users/{uid}/childrenIds 只剩「我要訂閱哪幾個孩子」的索引；那份節點只有
   * 本人寫得動，所以代碼一旦傳出去就永遠收不回來，唯一的補救是把紀錄整份
   * 刪掉、連另一位家長的一起。成員名單搬進孩子本體之後，任何一位成員都能把
   * 另一位移掉，分享才真的是可撤回的。
   */
  members: Record<string, true>;
  /** 拿到代碼的人能不能把自己加進 members。關掉之後，流出去的舊代碼就加入不了。 */
  joinOpen?: boolean;
}

export interface PregnancyData {
  childId: string;
  dueDate: string; // YYYY-MM-DD
  lastPeriodDate: string; // YYYY-MM-DD
  status: 'active' | 'archived';
}

/** 產檢與篩檢項目的完成記錄，鍵為 prenatalCheckupSchedule 的 template id。 */
export interface PrenatalCheckupProgress {
  [templateId: string]: {
    completedDate: string; // YYYY-MM-DD
    clinicName?: string;
    notes?: string;
  };
}

export interface DailyLog {
  id: string;
  childId: string;
  type: 'feeding' | 'sleep' | 'diaper';
  timestamp: string; // ISO 8601 format
  data: FeedingData | SleepData | DiaperData;
  createdAt: string; // ISO 8601 format
  updatedAt?: string; // ISO 8601 format
  /**
   * 記錄這一筆的人。餵奶、睡眠、換尿布本來就是兩個人輪流做的事，孩子也可以
   * 用 joinChild 共享——但先前沒有任何一筆紀錄留下是誰做的，「上一餐誰餵的」
   * 在 app 裡問不出答案。
   *
   * 兩個欄位都選填：既有的紀錄沒有這些值，不能因此壞掉。
   */
  createdBy?: string;
  /**
   * 寫入當下的顯示名稱快照。
   *
   * 不能只存 uid：安全規則裡 users/$userId 只有本人讀得到，所以事後沒有任何
   * 辦法把別人的 uid 換成名字。對方改名後這裡會留著舊名字，那是這個限制下
   * 可接受的代價。
   */
  createdByName?: string;
}

/**
 * 一次修改真正改到的欄位，寫入前會攤平成 `data/<欄位>` 這樣的葉節點路徑。
 *
 * 整筆寫回去是不行的：孩子本來就是兩個人共用（見 joinChild 與 members），
 * 兩位照顧者同時開著同一筆紀錄時，後送出的那一筆會連著他讀到的舊值一起蓋
 * 過去，對方剛改的欄位就這樣不見了，而且兩邊都不會收到任何提示。只帶改到
 * 的欄位，兩個人各改各的欄位就會合併而不是互相覆蓋。
 *
 * `data` 裡的 `null` 是「把這個欄位清掉」；沒出現的欄位完全不碰——`Clearable`
 * 就是這個意思，每個欄位都可選、而且可以是 null。
 *
 * 不是 `Record<string, unknown>`：三個呼叫點裡有兩個是手寫的物件字面量，打錯
 * 一個欄位名（`endTme`）在那種型別下完全合法，然後就把一個沒人認得的葉節點寫
 * 進孩子的健康紀錄裡。列成三種形狀的聯集之後，錯的欄位名、錯的值型別都編不過。
 * 代價是 dailyLogChanges 裡一個 cast：changedFields 是結構性的比對，它本來就
 * 不可能知道自己產出的是三種裡的哪一種。
 *
 * 也不是 `Omit<DailyLog, 'id' | 'data'>`：那會讓 childId、createdAt、createdBy
 * 與 updatedAt 都變成可以 patch 的欄位，而沒有任何一個應該被 patch。
 */
type Clearable<T> = { [K in keyof T]?: T[K] | null };

export type DailyLogPatch = Partial<Pick<DailyLog, 'type' | 'timestamp'>> & {
  data?: Clearable<FeedingData> | Clearable<SleepData> | Clearable<DiaperData>;
};

export interface FeedingData {
  /**
   * `pumping` 是唯一一個「不是餵給寶寶」的值：它記的是擠出來的量，是產出不是
   * 攝取。每一個把餵奶次數或總奶量加起來的地方都必須把它排除，否則擠奶會被
   * 當成寶寶喝了，而那個數字會出現在小兒科醫師面前。
   *
   * `breast_milk_bottle` 反過來：瓶餵母乳是量得出來的攝取量，跟親餵不同，也
   * 不是配方奶。
   */
  feedingType:
    | 'breast_left'
    | 'breast_right'
    | 'breast_both'
    | 'breast_milk_bottle'
    | 'formula'
    | 'solid'
    | 'pumping';
  /** ml。餵食是寶寶喝進去的量；`pumping` 是擠出來的量。 */
  amount?: number;
  duration?: number; // minutes
  /** 只有擠奶用得到：追蹤塞奶的家長會想知道是哪一邊。選填。 */
  side?: 'left' | 'right' | 'both';
  notes?: string;
}

export interface SleepData {
  startTime: string; // ISO 8601 format
  endTime?: string; // ISO 8601 format, undefined means still sleeping
  duration?: number; // minutes, auto-calculated
  /**
   * 這一段睡眠中間醒來幾次，關掉一段睡眠時填。
   *
   * undefined 是「沒問到」，0 是「家長說沒醒」。兩者不能混為一談：睡眠品質
   * 分數若把沒問到當成沒醒，每一筆舊紀錄都會被算成完美的一夜。
   */
  nightWakings?: number;
  notes?: string;
}

export interface DiaperData {
  type: 'pee' | 'poop' | 'both';
  consistency?: 'normal' | 'soft' | 'hard'; // only for poop
  notes?: string;
}

// Dashboard Summary Types
export interface DailySummary {
  date: string; // YYYY-MM-DD
  feedingCount: number;
  totalFeedingAmount: number; // ml
  sleepCount: number;
  totalSleepDuration: number; // minutes
  diaperCount: number;
  poopCount: number;
  peeCount: number;
}

// Sleep Analytics Types (睡眠深度分析)
export interface SleepAnalytics {
  // Basic metrics
  totalSleepDuration: number; // minutes, last 24h
  longestSleepDuration: number; // minutes, last 24h
  averageSleepDuration: number; // minutes, per sleep session
  sleepCount: number; // number of sleep sessions

  // Sleep quality
  sleepQualityScore: number; // 0-100
  nightWakingsTotal: number; // total night wakings in last 24h

  // Sleeping through the night detection
  isSleepingThroughNight: boolean; // >= 6 hours continuous
  longestContinuousSleep: number; // minutes

  // Routine analysis
  routineScore: number; // 0-100, consistency of sleep times
  averageBedtime?: string; // HH:mm format
  averageWakeTime?: string; // HH:mm format

  // Recommendations
  recommendations: SleepRecommendation[];
}

export interface SleepRecommendation {
  id: string;
  type: 'positive' | 'suggestion' | 'warning';
  title: string;
  message: string;
  icon: string; // lucide-react icon name
}

export interface SleepPattern {
  date: string; // YYYY-MM-DD
  sleepSessions: {
    startTime: string; // ISO 8601
    endTime?: string; // ISO 8601
    duration: number; // minutes
    nightWakings?: number;
  }[];
  totalDuration: number; // minutes
  longestSession: number; // minutes
  qualityScore: number; // 0-100
}

// Growth Charts Types (生長曲線)
export interface GrowthRecord {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  weight?: number; // kg
  height?: number; // cm
  headCircumference?: number; // cm
  /**
   * 讀取時由 useGrowthTracking 依孩子檔案算出來，寫入端不存。資料庫裡的舊
   * 紀錄可能還帶著寫入當下算的那一份，算不出來時會拿它當備援。
   */
  percentile?: {
    weight?: number; // 0-100
    height?: number;
    headCircumference?: number;
  };
  notes?: string;
}

export type Gender = 'male' | 'female';

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

export interface DevelopmentCheckProgress {
  [checkItemId: string]: {
    achieved: boolean;
    achievedDate?: string; // YYYY-MM-DD
  };
}

export interface CareTaskRecord {
  taskId: string;
  completedDate: string; // YYYY-MM-DD
  location?: string; // 院所
  notes?: string;
}

export interface CareTaskProgress {
  [taskId: string]: CareTaskRecord;
}

export type DiaryMood = 'happy' | 'proud' | 'tired' | 'worried' | 'funny';

export interface DiaryEntry {
  id: string;
  childId: string;
  /** YYYY-MM-DD，家長可改，預設今天 */
  date: string;
  content: string;
  mood?: DiaryMood;
  /** 由成長分頁勾選時建立的條目會帶此欄，指向該檢核項目 */
  linkedCheckItemId?: string;
  createdAt: string; // ISO 8601
  updatedAt?: string;
}

export interface ToothProgress {
  [toothId: string]: {
    erupted: boolean;
    eruptedDate?: string; // YYYY-MM-DD
  };
}
