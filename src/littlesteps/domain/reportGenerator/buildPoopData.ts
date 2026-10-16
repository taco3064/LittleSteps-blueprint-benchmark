import { forEachReportDay } from './forEachReportDay';
import { DailyLog, DiaperData } from '~app/family/domain/familyRecords';
import { filterLogsByDate } from '../logHelpers';
import { getDateNDaysAgo } from './getDateNDaysAgo';

export /**
 * Build poop section data for a report
 */
function buildPoopData(logs: DailyLog[], days: number) {
  const dailyCounts: number[] = [];
  const consistencyDistribution: Record<string, number> = {};

  // Collect all poop-related logs from the period for gap calculation
  const allPoopLogs: DailyLog[] = [];
  let loggedDays = 0;
  let poopCountTotal = 0;

  forEachReportDay(days, (i) => {
    const date = getDateNDaysAgo(i);
    const dayLogs = filterLogsByDate(logs, date);

    const poopLogs = dayLogs.filter((log) => {
      if (log.type !== 'diaper') {
        return false;
      }

      const data = log.data as DiaperData;

      return data.type === 'poop' || data.type === 'both';
    });

    dailyCounts.push(poopLogs.length);
    allPoopLogs.push(...poopLogs);

    // 判準是「那天有沒有記尿布」，不是「有沒有大便」：有記但沒大便是真的 0。
    if (dayLogs.some((log) => log.type === 'diaper')) {
      loggedDays += 1;
      poopCountTotal += poopLogs.length;
    }

    poopLogs.forEach((log) => {
      const data = log.data as DiaperData;

      if (data.consistency) {
        consistencyDistribution[data.consistency]
          = (consistencyDistribution[data.consistency] || 0) + 1;
      }
    });
  });

  const avgDailyCount = loggedDays > 0 ? poopCountTotal / loggedDays : 0;

  // Calculate longest gap between consecutive poops (in hours)
  let longestGap = 0;

  if (allPoopLogs.length >= 2) {
    const sortedByTime = [...allPoopLogs].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    for (let i = 1; i < sortedByTime.length; i++) {
      const gap
        = (new Date(sortedByTime[i].timestamp).getTime()
          - new Date(sortedByTime[i - 1].timestamp).getTime())
        / (1000 * 60 * 60);

      if (gap > longestGap) {
        longestGap = gap;
      }
    }
  }

  return {
    dailyCounts,
    avgDailyCount: Math.round(avgDailyCount * 10) / 10,
    loggedDays,
    longestGap: Math.round(longestGap * 10) / 10,
    consistencyDistribution,
  };
}
