import { circularTimeStats } from '~app/family/domain/circularTime';
import type { DailyLog } from '~app/family/domain/familyRecords';
import { nightSleepBedtimes } from './nightSleepBedtimes';

/**
 * Calculate routine score (0-100)
 * Measures consistency of sleep start times
 */
export function calculateRoutineScore(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): number {
  const bedtimes = nightSleepBedtimes(logs, days, baseDate);

  if (bedtimes.length < 3) {
    return 0;
  } // Need at least 3 data points

  const stats = circularTimeStats(bedtimes);

  if (!stats) {
    return 0;
  }

  // 標準差 30 分鐘以內算完全規律，超過 2 小時是 0 分。
  const { stdDevMinutes } = stats;

  if (stdDevMinutes <= 30) {
    return 100;
  }

  return Math.round(Math.max(0, 100 - ((stdDevMinutes - 30) / 90) * 100));
}
