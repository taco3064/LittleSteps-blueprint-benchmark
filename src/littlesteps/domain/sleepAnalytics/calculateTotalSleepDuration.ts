import type { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { filterSleepLogs } from './filterSleepLogs';

/**
 * Calculate total sleep duration from logs
 */
export function calculateTotalSleepDuration(logs: DailyLog[]): number {
  return filterSleepLogs(logs).reduce((total, log) => {
    const sleepData = log.data as SleepData;

    return total + (sleepData.duration || 0);
  }, 0);
}
