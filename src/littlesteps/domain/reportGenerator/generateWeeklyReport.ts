import { DailyLog, GrowthRecord } from '~app/family/domain/familyRecords';
import { WeeklyReport } from './WeeklyReport';
import { generateReport } from './generateReport';

/**
 * Generate weekly report (7 days)
 */
export function generateWeeklyReport(
  logs: DailyLog[],
  growthRecords: GrowthRecord[],
  ageMonths: number,
): WeeklyReport {
  return generateReport({
    logs: logs,
    growthRecords: growthRecords,
    ageMonths: ageMonths,
    days: 7,
  });
}
