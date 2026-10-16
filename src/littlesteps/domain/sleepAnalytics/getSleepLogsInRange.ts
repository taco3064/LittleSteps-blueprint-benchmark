import type { DailyLog } from '~app/family/domain/familyRecords';
import { filterSleepLogs } from './filterSleepLogs';

/**
 * Get sleep logs from the last N days
 */
export function getSleepLogsInRange(
  logs: DailyLog[],
  days: number = 1,
  baseDate: Date = new Date(),
): DailyLog[] {
  const cutoffDate = new Date(baseDate);

  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);

  return filterSleepLogs(logs).filter((log) => {
    const logDate = new Date(log.timestamp);

    return logDate >= cutoffDate && logDate <= baseDate;
  });
}
