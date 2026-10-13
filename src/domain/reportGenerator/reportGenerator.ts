import { getDateNDaysAgo } from './reportDates';
import { buildFeedingData, buildPumpingData } from './feedingReport';
import { buildSleepData } from './sleepReport';
import { buildPoopData } from './poopReport';
import { buildGrowthData } from './growthReport';
import { DailyLog, GrowthRecord } from '../records';

import {
  TrendDirection,
  getRecommendedSleepHours,
  generateDailySeries,
} from '../trendCalculator';

export interface ReportScore {
  /**
   * 樣本太少時沒有分數。
   *
   * 這三個分數量的都是「天與天之間差多少」，兩天的記錄再怎麼算都得不出規律，
   * 只會把偶然講成結論——而 0 分在畫面上是紅色的「需注意」。
   */
  score: number | null;
  label: string;
  /** 這個分數是用幾天的記錄算出來的 */
  loggedDays: number;
}

export interface ReportScores {
  feeding: ReportScore;
  sleep: ReportScore;
  poop: ReportScore;
}

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

/**
 * Compute the standard deviation of an array of numbers
 */
function standardDeviation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Coefficient of variation (CV): std / mean, returns 0 if mean is 0
 */
function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;

  if (mean === 0) {
    return 0;
  }

  return standardDeviation(values) / mean;
}

/**
 * Get the score label in Traditional Chinese
 */
function getScoreLabel(score: number): string {
  if (score >= 80) {
    return '很棒！';
  }

  if (score >= 60) {
    return '不錯';
  }

  if (score >= 40) {
    return '尚可';
  }

  return '需注意';
}

/**
 * Clamp a value between 0 and 100
 */
function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * 少於這麼多天有記錄就不給分數。
 *
 * 三個分數量的都是天與天之間的變異，三天以內的樣本量不到規律：兩天的
 * 變異係數只反映那兩天差多少，而報告會把它畫成紅色的 0 分。
 */
const MIN_DAYS_FOR_SCORE = 4;

/** 只留下有記錄的那幾天；沒記錄的那天是 null，不是 0 */
function observedDays(series: Array<number | null>): number[] {
  return series.filter((value): value is number => value !== null);
}

/**
 * 分數少於 MIN_DAYS_FOR_SCORE 天就不給——`score` 是 null，畫面顯示「資料不足」，
 * `label` 給的是下一步而不是評語。`loggedDays` 是分母，讀分數的人要看得到。
 */
function buildScore(loggedDays: number, score: number): ReportScore {
  if (loggedDays < MIN_DAYS_FOR_SCORE) {
    return { score: null, label: '再記幾天', loggedDays };
  }

  return { score, label: getScoreLabel(score), loggedDays };
}

/**
 * 三個 0-100 分數。分母一律是「有記錄的天數」，不是視窗長度。
 *
 * 補 0 的序列會讓 30 天裡只記了 2 天的家長，在正確忽略未記錄日的平均值
 * 旁邊看到滿滿的紅字：22 天的 0 把變異係數推爆，分數歸零，標籤寫「需注意」。
 * 那不是寶寶的狀況，是記錄的密度。
 */
export function calculateScores(
  logs: DailyLog[],
  days: number,
  ageMonths: number,
): ReportScores {
  const feedingAmounts = observedDays(
    generateDailySeries(logs, days, 'feeding_amount'),
  );

  const feedingCounts = observedDays(
    generateDailySeries(logs, days, 'feeding_count'),
  );

  const sleepHours = observedDays(generateDailySeries(logs, days, 'sleep_duration'));
  const poopCounts = observedDays(generateDailySeries(logs, days, 'poop_count'));

  // 餵奶規律度：奶量與次數的變異係數。CV 0 得 100 分，CV ≥ 1 得 0 分。
  const feedingCV
    = (coefficientOfVariation(feedingAmounts) + coefficientOfVariation(feedingCounts))
      / 2;

  // 睡眠品質：達到月齡建議時數佔 60 分，日與日之間的穩定度佔 40 分。
  const recommended = getRecommendedSleepHours(ageMonths);
  const totalSleepHours = sleepHours.reduce((sum, v) => sum + v, 0);
  const avgSleep = sleepHours.length > 0 ? totalSleepHours / sleepHours.length : 0;

  const meetingRatio
    = recommended.min > 0 ? Math.min(avgSleep / recommended.min, 1) : 1;

  const sleepConsistency = clampScore(100 - coefficientOfVariation(sleepHours) * 100);

  // 排便正常度：有記錄的日子裡一次都沒大便才是 0 分，其餘看每日次數穩不穩。
  const poopTotal = poopCounts.reduce((sum, v) => sum + v, 0);
  const poopRegularity = clampScore(100 - coefficientOfVariation(poopCounts) * 100);

  return {
    feeding: buildScore(feedingAmounts.length, clampScore(100 - feedingCV * 100)),
    sleep: buildScore(
      sleepHours.length,
      clampScore(meetingRatio * 60 + (sleepConsistency / 100) * 40),
    ),
    poop: buildScore(
      poopCounts.length,
      poopTotal > 0 ? clampScore(poopRegularity * 0.7 + 30) : 0,
    ),
  };
}

/**
 * Generate summary text in Traditional Chinese
 */
export function generateSummaryText(report: WeeklyReport): string {
  const parts: string[] = [];

  // Feeding summary
  if (report.feeding.avgDailyAmount > 0) {
    parts.push(`餵奶量平均每日 ${report.feeding.avgDailyAmount}ml`);
  } else if (report.feeding.avgDailyCount > 0) {
    parts.push(`平均每日餵奶 ${report.feeding.avgDailyCount} 次`);
  }

  // Sleep summary
  if (report.sleep.avgDailyHours > 0) {
    const sleepComment
      = report.sleep.avgDailyHours < report.sleep.recommendedHours
        ? '，略低於建議值，建議觀察作息'
        : '，符合建議範圍';

    parts.push(`睡眠時數平均 ${report.sleep.avgDailyHours} 小時${sleepComment}`);
  }

  // Poop summary
  if (report.poop.avgDailyCount > 0) {
    if (report.poop.longestGap > 48) {
      parts.push(`排便間隔最長達 ${Math.round(report.poop.longestGap)} 小時，需留意`);
    } else {
      parts.push('排便規律正常');
    }
  }

  if (parts.length === 0) {
    return '尚無足夠資料產生摘要，請持續記錄寶寶的日常。';
  }

  return parts.join('。') + '。';
}

/**
 * Generate a report for a given number of days
 */
function generateReport({
  logs,
  growthRecords,
  ageMonths,
  days,
}: {
  logs: DailyLog[];
  growthRecords: GrowthRecord[];
  ageMonths: number;
  days: number;
}): WeeklyReport {
  const periodStart = getDateNDaysAgo(days - 1);
  const periodEnd = getDateNDaysAgo(0);

  const scores = calculateScores(logs, days, ageMonths);
  const feeding = buildFeedingData(logs, days);
  const pumping = buildPumpingData(logs, days);
  const sleep = buildSleepData(logs, days, ageMonths);
  const poop = buildPoopData(logs, days);
  const growth = buildGrowthData(growthRecords, days);

  const report: WeeklyReport = {
    period: { start: periodStart, end: periodEnd },
    scores,
    feeding,
    pumping,
    sleep,
    poop,
    growth,
    summaryText: '', // will be filled below
  };

  report.summaryText = generateSummaryText(report);

  return report;
}

/**
 * Generate weekly report (7 days)
 */
export function generateWeeklyReport(
  logs: DailyLog[],
  growthRecords: GrowthRecord[],
  ageMonths: number,
): WeeklyReport {
  return generateReport({
    logs: logs,
    growthRecords: growthRecords,
    ageMonths: ageMonths,
    days: 7,
  });
}

/**
 * Generate monthly report (30 days)
 */
export function generateMonthlyReport(
  logs: DailyLog[],
  growthRecords: GrowthRecord[],
  ageMonths: number,
): WeeklyReport {
  return generateReport({
    logs: logs,
    growthRecords: growthRecords,
    ageMonths: ageMonths,
    days: 30,
  });
}
