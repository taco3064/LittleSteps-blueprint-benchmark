import { toLocalDateKey } from '~app/platform/domain/calendar';
import type {
  DailyLog,
  SleepData,
  SleepPattern,
} from '~app/family/domain/familyRecords';
import { calculateSleepQualityScore } from './calculateSleepQualityScore';
import { getSleepLogsInRange } from './getSleepLogsInRange';

/**
 * Get sleep patterns by date (for visualization)
 */
export function getSleepPatternsByDate(
  logs: DailyLog[],
  days: number = 7,
  baseDate: Date = new Date(),
): SleepPattern[] {
  const sleepLogs = getSleepLogsInRange(logs, days, baseDate);

  // Group by date
  const logsByDate: { [date: string]: DailyLog[] } = {};

  sleepLogs.forEach((log) => {
    const date = toLocalDateKey(log.timestamp);

    if (!logsByDate[date]) {
      logsByDate[date] = [];
    }

    logsByDate[date].push(log);
  });

  // Convert to SleepPattern array
  return Object.entries(logsByDate)
    .map(([date, logs]) => {
      const sessions = logs.map((log) => {
        const sleepData = log.data as SleepData;

        return {
          startTime: sleepData.startTime,
          endTime: sleepData.endTime,
          duration: sleepData.duration || 0,
          nightWakings: sleepData.nightWakings,
        };
      });

      const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
      const longestSession = Math.max(...sessions.map((s) => s.duration));
      const qualityScore = calculateSleepQualityScore(logs);

      return {
        date,
        sleepSessions: sessions,
        totalDuration,
        longestSession,
        qualityScore,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date)); // Sort newest first
}
