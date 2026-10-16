import type { DailyLog } from '~app/family/domain/familyRecords';
import { calculateTotalSleepDuration } from './calculateTotalSleepDuration';
import { filterSleepLogs } from './filterSleepLogs';

/**
 * Calculate average sleep duration per session
 */
export function calculateAverageSleepDuration(logs: DailyLog[]): number {
  const sleepLogs = filterSleepLogs(logs);

  if (sleepLogs.length === 0) {
    return 0;
  }

  const total = calculateTotalSleepDuration(sleepLogs);

  return Math.round(total / sleepLogs.length);
}
