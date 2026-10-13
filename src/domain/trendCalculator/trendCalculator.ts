import { DailyLog, FeedingData, SleepData, DiaperData } from '../records';
import {
  filterLogsByDate,
  calculateSleepDuration,
  isIntakeFeedingLog,
  isStaleOpenSleep,
} from '../logHelpers';
import { getSleepRequirementForAge } from '../sleep';
import { toLocalDateKey } from '../dateHelpers';

/**
 * 'insufficient-data' 和 'stable' 不一樣：一個是「沒得說」，一個是「沒變」。
 * 少了前者，沒記錄的日子會被當成 0，於是「這幾天太累沒記」和「真的變好了」
 * 在報告上長得一模一樣。
 */
export type TrendDirection
  = 'increasing' | 'decreasing' | 'stable' | 'insufficient-data';

/** 報告上那四張趨勢卡的指標 */
export type MetricType
  = 'feeding_count' | 'feeding_amount' | 'sleep_duration' | 'poop_count';

export interface TrendData {
  direction: TrendDirection;
  changeRate: number; // percentage
  currentValue: number;
  averageValue: number;
  sparklinePoints: number[];
}

/**
 * 一筆紀錄算不算「那天有記這個指標」。
 *
 * 睡眠要跳過忘了按「醒了」的那一筆。它沒有時長，卻會把那一天標成「有記睡眠
 * 但只睡了 0 小時」——分數因此掉下來，而同一頁的睡眠區塊還印著每天 11 小時。
 * 報告自己跟自己打架，比少一個數字更難解釋。
 *
 * 餵奶兩個指標問的不是「有沒有餵奶紀錄」而是「有沒有餵到寶寶」：只擠了奶的
 * 那一天，寶寶喝了多少仍然是不知道，不是 0。
 */
const OBSERVES: Record<MetricType, (log: DailyLog) => boolean> = {
  feeding_count: isIntakeFeedingLog,
  feeding_amount: isIntakeFeedingLog,
  sleep_duration: (log) => log.type === 'sleep' && !isStaleOpenSleep(log),
  poop_count: (log) => log.type === 'diaper',
};

/**
 * 那一天的觀測值；那天沒有這一類的紀錄就是 null。
 *
 * 判準是「有沒有記那一類」而不是「有沒有記任何東西」：只記餵奶不記尿布的
 * 家長，他的排便趨勢不是「都是 0」，是根本沒有資料。反過來，有記尿布但那天
 * 沒有大便，就是真的 0，要算進去。
 */
function getDailyObservation(
  logs: DailyLog[],
  date: string,
  type: MetricType,
): number | null {
  const dayLogs = filterLogsByDate(logs, date);

  if (!dayLogs.some((log) => OBSERVES[type](log))) {
    return null;
  }

  return getDailyValue(logs, date, type);
}

/**
 * 每天一格的觀測序列，沒記錄的那天是 null。
 */
export function generateDailySeries(
  logs: DailyLog[],
  days: number,
  type: MetricType,
): Array<number | null> {
  const points: Array<number | null> = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    points.push(getDailyObservation(logs, getDateNDaysAgo(i), type));
  }

  return points;
}

/**
 * Get the date string (YYYY-MM-DD) for N days ago from today
 */
function getDateNDaysAgo(daysAgo: number): string {
  const date = new Date();

  date.setDate(date.getDate() - daysAgo);

  return toLocalDateKey(date);
}

/**
 * Extract the daily value for a specific metric type from a day's logs
 */
function getDailyValue(logs: DailyLog[], date: string, type: MetricType): number {
  const dayLogs = filterLogsByDate(logs, date);

  switch (type) {
    // 擠奶不是一餐，擠出來的量也不是寶寶喝進去的量。
    case 'feeding_count':
      return dayLogs.filter(isIntakeFeedingLog).length;

    case 'feeding_amount':
      return dayLogs.filter(isIntakeFeedingLog).reduce((sum, log) => {
        const data = log.data as FeedingData;

        return sum + (data.amount || 0);
      }, 0);

    case 'sleep_duration': {
      return dayLogs
        .filter((log) => log.type === 'sleep' && !isStaleOpenSleep(log))
        .reduce((sum, log) => {
          const data = log.data as SleepData;
          const duration = data.duration || calculateSleepDuration(data) || 0;

          return sum + duration / 60; // convert minutes to hours
        }, 0);
    }

    case 'poop_count':
      return dayLogs
        .filter((log) => log.type === 'diaper')
        .filter((log) => {
          const data = log.data as DiaperData;

          return data.type === 'poop' || data.type === 'both';
        }).length;

    default:
      return 0;
  }
}

/**
 * Calculate daily average of a metric over N days
 */
export function calculateDailyAverage(
  logs: DailyLog[],
  days: number,
  type: MetricType,
): number {
  if (days <= 0) {
    return 0;
  }

  let total = 0;

  for (let i = 0; i < days; i++) {
    const date = getDateNDaysAgo(i);

    total += getDailyValue(logs, date, type);
  }

  return total / days;
}

/**
 * Calculate trend direction over N days.
 * Compares the average of the second half to the first half.
 * 'increasing' if second half average > first half average by >10%
 * 'decreasing' if < -10%
 * otherwise 'stable'
 */
export function calculateTrend(dailyValues: Array<number | null>): TrendDirection {
  if (dailyValues.length < 2) {
    return 'insufficient-data';
  }

  const midpoint = Math.floor(dailyValues.length / 2);

  // 沒記錄的日子不能當成 0 參與平均：停記三天和「真的變好了」會算出同一個答案。
  const firstHalf = dailyValues
    .slice(0, midpoint)
    .filter((v): v is number => v !== null);

  const secondHalf = dailyValues
    .slice(midpoint)
    .filter((v): v is number => v !== null);

  // 任一半少於兩天有記錄，就沒有可比的兩段。硬要比只是把雜訊講成趨勢。
  if (firstHalf.length < 2 || secondHalf.length < 2) {
    return 'insufficient-data';
  }

  const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

  return compareAverages(firstAvg, secondAvg);
}

function compareAverages(firstAvg: number, secondAvg: number): TrendDirection {
  if (firstAvg === 0) {
    return secondAvg > 0 ? 'increasing' : 'stable';
  }

  const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (changePercent > 10) {
    return 'increasing';
  }

  if (changePercent < -10) {
    return 'decreasing';
  }

  return 'stable';
}

/**
 * Calculate change rate between current value and average value (percentage)
 */
export function calculateChangeRate(
  currentValue: number,
  averageValue: number,
): number {
  if (averageValue === 0) {
    return currentValue > 0 ? 100 : 0;
  }

  return ((currentValue - averageValue) / averageValue) * 100;
}

/**
 * Generate sparkline data points (one per day, for N days).
 * Returns values ordered from oldest to newest.
 */
export function generateSparklineData(
  logs: DailyLog[],
  days: number,
  type: MetricType,
): number[] {
  const points: number[] = [];

  // Iterate from oldest day to most recent (i = days-1 is oldest, i = 0 is today)
  for (let i = days - 1; i >= 0; i--) {
    const date = getDateNDaysAgo(i);

    points.push(getDailyValue(logs, date, type));
  }

  return points;
}

/**
 * Parse sleep requirement totalHours string (e.g. "16-17 小時") into { min, max }
 */
function parseSleepHoursRange(totalHours: string): { min: number; max: number } {
  const match = totalHours.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);

  if (match) {
    return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
  }

  // Single value like "13 小時"
  const singleMatch = totalHours.match(/(\d+(?:\.\d+)?)/);

  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);

    return { min: value, max: value };
  }

  return { min: 12, max: 16 }; // fallback
}

/**
 * Compare a value with age-recommended sleep hours.
 *
 * Band selection lives with the data in littlesteps/data/sleep: this used to
 * be an if/else ladder indexing `sleepRequirements[0]`…`[5]` positionally,
 * which silently mapped every child past 18 months onto the 1.5-2 歲 band and
 * would have kept doing so after a new band was appended.
 */
export function getRecommendedSleepHours(ageMonths: number): {
  min: number;
  max: number;
} {
  return parseSleepHoursRange(getSleepRequirementForAge(ageMonths).totalHours);
}

/**
 * Build a TrendData object for a given metric type over N days
 */
function buildTrendData(logs: DailyLog[], days: number, type: MetricType): TrendData {
  const series = generateDailySeries(logs, days, type);
  // 圖照畫，沒記錄的那天畫成 0；但趨勢的判斷不能用這個補過的版本。
  const sparklinePoints = series.map((v) => v ?? 0);
  const todayValue = sparklinePoints[sparklinePoints.length - 1] || 0;
  const averageValue = calculateDailyAverage(logs, days, type);
  const direction = calculateTrend(series);
  const changeRate = calculateChangeRate(todayValue, averageValue);

  return {
    direction,
    changeRate,
    currentValue: todayValue,
    averageValue,
    sparklinePoints,
  };
}

/**
 * Get feeding trend data for the past N days
 */
export function getFeedingTrend(logs: DailyLog[], days: number): TrendData {
  return buildTrendData(logs, days, 'feeding_amount');
}

/**
 * Get sleep trend data for the past N days
 */
export function getSleepTrend(logs: DailyLog[], days: number): TrendData {
  return buildTrendData(logs, days, 'sleep_duration');
}

/**
 * Get poop trend data for the past N days
 */
export function getPoopTrend(logs: DailyLog[], days: number): TrendData {
  return buildTrendData(logs, days, 'poop_count');
}
