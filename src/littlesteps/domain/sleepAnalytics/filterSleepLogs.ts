import type { DailyLog } from '~app/family/domain/familyRecords';

/**
 * Filter sleep logs from daily logs
 */
export function filterSleepLogs(logs: DailyLog[]): DailyLog[] {
  return logs.filter((log) => log.type === 'sleep');
}
