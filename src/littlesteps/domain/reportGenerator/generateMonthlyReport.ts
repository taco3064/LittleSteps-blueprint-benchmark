import { DailyLog, GrowthRecord } from '~app/family/domain/familyRecords';
import { WeeklyReport } from './WeeklyReport';
import { generateReport } from './generateReport';

/**
 * Generate monthly report (30 days)
 */
export function generateMonthlyReport(
  logs: DailyLog[],
  growthRecords: GrowthRecord[],
  ageMonths: number,
): WeeklyReport {
  return generateReport({
    logs: logs,
    growthRecords: growthRecords,
    ageMonths: ageMonths,
    days: 30,
  });
}
