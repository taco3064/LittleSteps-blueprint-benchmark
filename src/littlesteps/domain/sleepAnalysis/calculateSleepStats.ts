import { toLocalDateKey } from '~app/platform/domain/calendar';
import { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { SleepStats } from './SleepStats';
import { filterLogsByPeriod } from './filterLogsByPeriod';
import { isNightSleep } from './isNightSleep';

/**
 * 計算睡眠統計
 */
export function calculateSleepStats(
  logs: DailyLog[],
  period: 'today' | 'week' | 'month',
): SleepStats {
  const sleepLogs = filterLogsByPeriod(
    logs.filter((log) => log.type === 'sleep'),
    period,
  );

  // 只計算已完成的睡眠（有 endTime 和 duration）
  const completedSleeps = sleepLogs.filter((log) => {
    const data = log.data as SleepData;

    return data.endTime && data.duration;
  });

  const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 1;

  // 真正有睡眠記錄的日曆日。跨夜的睡眠歸在入睡那天，與報表其他地方一致。
  const daysWithRecords = new Set(
    completedSleeps.map((log) => toLocalDateKey(log.timestamp)),
  ).size;

  let totalDuration = 0;
  let nightSleep = 0;
  let daytimeNaps = 0;
  let nightSleepCount = 0;
  let napCount = 0;

  completedSleeps.forEach((log) => {
    const data = log.data as SleepData;
    const duration = data.duration || 0;

    totalDuration += duration;

    if (isNightSleep(data.startTime)) {
      nightSleep += duration;
      nightSleepCount++;
    } else {
      daytimeNaps += duration;
      napCount++;
    }
  });

  const sleepCount = completedSleeps.length;
  const averageDuration = sleepCount > 0 ? totalDuration / sleepCount : 0;
  const dailyAverage = daysWithRecords > 0 ? totalDuration / daysWithRecords : 0;

  return {
    totalDuration,
    dailyAverage,
    sleepCount,
    averageDuration,
    nightSleep,
    daytimeNaps,
    nightSleepCount,
    napCount,
    daysInPeriod,
    daysWithRecords,
  };
}
