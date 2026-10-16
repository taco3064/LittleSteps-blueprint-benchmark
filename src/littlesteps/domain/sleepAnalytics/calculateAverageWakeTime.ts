import {
  circularTimeStats,
  formatMinutesOfDay,
  minutesOfDay,
} from '~app/family/domain/circularTime';
import type { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { isNightSleep } from '../sleepAnalysis';
import { getSleepLogsInRange } from './getSleepLogsInRange';

/**
 * 夜間睡醒的平均時刻。原本取的是「每一天最後一次睡眠的結束」，那是下午小睡
 * 醒來的時間，不是早上起床的時間。
 */
export function calculateAverageWakeTime(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): string | undefined {
  const wakeTimes = getSleepLogsInRange(logs, days, baseDate)
    .filter((log) => {
      const data = log.data as SleepData;

      return data.endTime && isNightSleep(data.startTime);
    })
    .map((log) => minutesOfDay(new Date((log.data as SleepData).endTime!)));

  const stats = circularTimeStats(wakeTimes);

  return stats ? formatMinutesOfDay(stats.meanMinutes) : undefined;
}
