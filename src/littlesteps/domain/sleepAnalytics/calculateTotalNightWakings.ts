import type { DailyLog, SleepData } from '~app/family/domain/familyRecords';
import { filterSleepLogs } from './filterSleepLogs';

/**
 * Calculate total night wakings
 */
export function calculateTotalNightWakings(logs: DailyLog[]): number {
  return filterSleepLogs(logs).reduce((total, log) => {
    const sleepData = log.data as SleepData;

    return total + (sleepData.nightWakings || 0);
  }, 0);
}
