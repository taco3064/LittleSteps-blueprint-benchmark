import { getSleepRequirementForAge } from '~app/littlesteps/domain/sleep';
import {
  calculateSleepRegularity,
  calculateSleepStats,
  parseHourRange,
} from '~app/littlesteps/domain/sleepAnalysis';

export function getSleepChartModel({
  recommendation, stats, period, regularity,
}: {
  recommendation: ReturnType<typeof getSleepRequirementForAge>;
  stats: ReturnType<typeof calculateSleepStats>;
  period: 'today' | 'week' | 'month';
  regularity: ReturnType<typeof calculateSleepRegularity>;
}) {
  // Parse recommendation hours
  const { max: maxHours } = parseHourRange(recommendation.totalHours);
  const actualHours = stats.dailyAverage / 60; // 使用每日平均

  // 分母是「有記錄的天數」，不是視窗長度。除以固定的 7 或 30 會把一晚 10 小時
  // 算成每日 0.3 小時，然後對照建議時數說睡眠不足——那不是結論，是沒記錄。
  const hasRecords = stats.daysWithRecords > 0;

  const dailyNightSleep = hasRecords
    ? stats.nightSleep / stats.daysWithRecords / 60
    : 0;

  const dailyDaytimeNaps = hasRecords
    ? stats.daytimeNaps / stats.daysWithRecords / 60
    : 0;

  // Chart data for actual vs recommended. Bars carry no text, so the DEFAULT
  // token fills are the right shades here.
  const comparisonData = [
    {
      label: period === 'today' ? '今日睡眠' : '每日平均',
      value: actualHours,
      max: maxHours,
      color: 'bg-primary',
    },
    {
      label: '建議睡眠',
      value: maxHours,
      max: maxHours,
      color: 'bg-ink/20',
    },
  ];

  // Chart data for night vs day
  const nightDayData = [
    {
      label: '夜間睡眠',
      value: dailyNightSleep,
      max: actualHours > 0 ? actualHours : 1,
      color: 'bg-secondary',
    },
    {
      label: '白天小睡',
      value: dailyDaytimeNaps,
      max: actualHours > 0 ? actualHours : 1,
      color: 'bg-butter',
    },
  ];

  // Calculate regularity stars (5-star rating)
  const bedtimeStars = Math.round((regularity.bedtimeRegularity / 100) * 5);
  const wakeTimeStars = Math.round((regularity.wakeTimeRegularity / 100) * 5);

  return { hasRecords, comparisonData, nightDayData, bedtimeStars, wakeTimeStars };
}
