import {
  circularTimeStats,
  formatMinutesOfDay,
} from '~app/family/domain/circularTime';
import type { DailyLog } from '~app/family/domain/familyRecords';
import { nightSleepBedtimes } from './nightSleepBedtimes';

/**
 * Calculate average bedtime (first sleep of the day)
 */
export function calculateAverageBedtime(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): string | undefined {
  const stats = circularTimeStats(nightSleepBedtimes(logs, days, baseDate));

  return stats ? formatMinutesOfDay(stats.meanMinutes) : undefined;
}
