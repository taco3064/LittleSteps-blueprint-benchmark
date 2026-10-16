import { DailyLog, GrowthRecord } from '~app/family/domain/familyRecords';
import { WeeklyReport } from './WeeklyReport';
import { buildFeedingData } from './buildFeedingData';
import { buildGrowthData } from './buildGrowthData';
import { buildPoopData } from './buildPoopData';
import { buildPumpingData } from './buildPumpingData';
import { buildSleepData } from './buildSleepData';
import { calculateScores } from './calculateScores';
import { generateSummaryText } from './generateSummaryText';
import { getDateNDaysAgo } from './getDateNDaysAgo';

export /**
 * Generate a report for a given number of days
 */
function generateReport({
  logs,
  growthRecords,
  ageMonths,
  days,
}: {
  logs: DailyLog[];
  growthRecords: GrowthRecord[];
  ageMonths: number;
  days: number;
}): WeeklyReport {
  const periodStart = getDateNDaysAgo(days - 1);
  const periodEnd = getDateNDaysAgo(0);

  const scores = calculateScores(logs, days, ageMonths);
  const feeding = buildFeedingData(logs, days);
  const pumping = buildPumpingData(logs, days);
  const sleep = buildSleepData(logs, days, ageMonths);
  const poop = buildPoopData(logs, days);
  const growth = buildGrowthData(growthRecords, days);

  const report: WeeklyReport = {
    period: { start: periodStart, end: periodEnd },
    scores,
    feeding,
    pumping,
    sleep,
    poop,
    growth,
    summaryText: '', // will be filled below
  };

  report.summaryText = generateSummaryText(report);

  return report;
}
