import { TrendDirection } from '../trendCalculator';
import { ReportScores } from './ReportScores';

export interface WeeklyReport {
  period: { start: string; end: string };
  scores: ReportScores;
  feeding: {
    dailyAmounts: number[];
    avgDailyCount: number;
    avgDailyAmount: number;
    /** 這幾個平均是用幾天算的。沒記錄的日子不算，否則平均會被稀釋成假數字 */
    loggedDays: number;
    /** 一天餵奶都沒記過就沒有「最高日」可言 */
    maxDay?: { date: string; amount: number };
    minDay?: { date: string; amount: number };
  };
  /**
   * 只有真的擠過奶才有。擠奶是產出，所以它自己一段，不會併進 `feeding`。
   */
  pumping?: {
    sessions: number;
    totalAmount: number; // ml
    totalMinutes: number;
    /** 有擠奶紀錄的天數，也是下面兩個平均的分母 */
    loggedDays: number;
    avgDailySessions: number;
    avgDailyAmount: number; // ml
  };
  sleep: {
    dailyDurations: number[];
    avgDailyHours: number;
    /** 這個平均是用幾天算的 */
    loggedDays: number;
    longestContinuous: number;
    nightWakingsTrend: TrendDirection;
    recommendedHours: number;
  };
  poop: {
    dailyCounts: number[];
    avgDailyCount: number;
    /** 這個平均是用幾天算的 */
    loggedDays: number;
    longestGap: number; // hours
    consistencyDistribution: Record<string, number>;
  };
  growth?: {
    weightChange: number;
    heightChange: number;
    latestPercentiles: Record<string, number>;
  };
  summaryText: string;
}
