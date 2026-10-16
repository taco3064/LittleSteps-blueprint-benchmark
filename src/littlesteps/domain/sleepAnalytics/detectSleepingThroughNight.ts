import type { DailyLog } from '~app/family/domain/familyRecords';
import { findLongestSleepSession } from './findLongestSleepSession';

/**
 * Detect if baby is sleeping through the night (>= 6 hours continuous)
 */
export function detectSleepingThroughNight(logs: DailyLog[]): boolean {
  const longestSleep = findLongestSleepSession(logs);

  return longestSleep >= 360; // 6 hours = 360 minutes
}
