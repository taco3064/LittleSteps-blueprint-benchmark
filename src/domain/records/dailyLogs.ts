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
export type Clearable<T> = { [K in keyof T]?: T[K] | null };

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
