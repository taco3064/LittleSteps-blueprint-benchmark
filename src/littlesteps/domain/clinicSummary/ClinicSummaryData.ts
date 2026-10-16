import { type HealthEvent } from '~app/family/domain/healthTimeline';

export interface ClinicSummaryData {
  // Basic info
  childName: string;
  birthday: string;
  gender?: string;
  ageDisplay: string;
  /**
   * 早產寶寶才有：出生週數與矯正年齡。
   *
   * 這一頁的百分位是用矯正年齡算的，年齡那一欄卻是實際年齡。摘要是要拿去給
   * 醫師看的，兩個數字並排卻沒說哪一個對應哪一個，等於讓醫師自己猜。
   */
  gestationalAge?: string;
  correctedAgeDisplay?: string;

  /**
   * 產檢、疫苗、成長、兒童健檢併成的一條時間軸。
   *
   * 這份摘要原本只涵蓋四種形狀裡的兩種（成長與疫苗），缺產檢與兒童健檢——
   * 而它是要拿去給醫師看的東西，斷在出生那一刻。
   */
  healthTimeline: HealthEvent[];

  // Latest growth
  latestGrowth?: {
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
    percentile?: {
      weight?: number;
      height?: number;
      headCircumference?: number;
    };
  };

  // Recent 3 growth records
  recentGrowthRecords: Array<{
    date: string;
    weight?: number;
    height?: number;
    headCircumference?: number;
  }>;

  // Vaccine records
  administeredVaccines: Array<{
    name: string;
    dose: number;
    date?: string;
  }>;
  nextVaccine?: { name: string; timing: string; doseNumber: number };
  /**
   * 沒有下一劑時，還沒記錄的公費劑次數。
   *
   * 只在 nextVaccine 缺席、而且真的還有沒記錄的公費劑次時才有值。這一段少一行
   * 的代價比看起來大：醫師讀到疫苗段落沒有下一步，結論是「沒事要談」，而事實
   * 可能是這個孩子有 21 劑公費疫苗沒有紀錄。
   */
  unrecordedNationalDoses?: number;

  // 7-day daily summary
  weekSummary: {
    avgFeedingCount: number;
    avgFeedingAmount: number;
    avgSleepHours: number;
    longestSleep: number; // minutes
    avgPoopCount: number;
    lastPoopTime?: string;
    /**
     * 每個平均各有自己的分母：有記那一項的天數。
     *
     * 共用一個「有任何記錄的天數」會稀釋掉記得比較少的那一項——每天記餵奶、
     * 一週只記兩次睡眠的家長，睡眠平均會被除以七天，變成三分之一，然後這份
     * 文件被拿去給小兒科醫師看。分母不同就不能共用。
     */
    feedingDays: number;
    sleepDays: number;
    diaperDays: number;
    /** 有任何一項記錄的天數，用來說明整段摘要的樣本大小 */
    loggedDays: number;
  };

  generatedAt: string; // ISO timestamp
}
