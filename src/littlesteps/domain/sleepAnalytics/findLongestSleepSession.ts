import type { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { filterSleepLogs } from './filterSleepLogs';

/**
 * Find the longest sleep session
 */
export function findLongestSleepSession(logs: DailyLog[]): number {
  const sleepLogs = filterSleepLogs(logs);

  if (sleepLogs.length === 0) {
    return 0;
  }

  return Math.max(
    ...sleepLogs.map((log) => {
      const sleepData = log.data as SleepData;

      return sleepData.duration || 0;
    }),
  );
}
