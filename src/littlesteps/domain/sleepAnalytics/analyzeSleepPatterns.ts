import type { DailyLog, SleepAnalytics } from '~app/family/domain/familyRecords';
import { calculateAverageBedtime } from './calculateAverageBedtime';
import { calculateAverageSleepDuration } from './calculateAverageSleepDuration';
import { calculateAverageWakeTime } from './calculateAverageWakeTime';
import { calculateRoutineScore } from './calculateRoutineScore';
import { calculateSleepQualityScore } from './calculateSleepQualityScore';
import { calculateTotalNightWakings } from './calculateTotalNightWakings';
import { calculateTotalSleepDuration } from './calculateTotalSleepDuration';
import { detectSleepingThroughNight } from './detectSleepingThroughNight';
import { filterSleepLogs } from './filterSleepLogs';
import { findLongestSleepSession } from './findLongestSleepSession';
import { generateSleepRecommendations } from './generateSleepRecommendations';
import { getSleepLogsInRange } from './getSleepLogsInRange';

/**
 * Analyze sleep patterns and generate full analytics
 */
export function analyzeSleepPatterns(
  logs: DailyLog[],
  baseDate: Date = new Date(),
): SleepAnalytics {
  const last24hLogs = getSleepLogsInRange(logs, 1, baseDate);
  const last7dLogs = getSleepLogsInRange(logs, 7, baseDate);

  const totalSleepDuration = calculateTotalSleepDuration(last24hLogs);
  const longestSleepDuration = findLongestSleepSession(last24hLogs);
  const averageSleepDuration = calculateAverageSleepDuration(last24hLogs);
  const sleepCount = filterSleepLogs(last24hLogs).length;
  const sleepQualityScore = calculateSleepQualityScore(last24hLogs);
  const nightWakingsTotal = calculateTotalNightWakings(last24hLogs);
  const isSleepingThroughNight = detectSleepingThroughNight(last24hLogs);
  const routineScore = calculateRoutineScore(last7dLogs, 7, baseDate);
  const averageBedtime = calculateAverageBedtime(last7dLogs, 7, baseDate);
  const averageWakeTime = calculateAverageWakeTime(last7dLogs, 7, baseDate);

  const analytics: SleepAnalytics = {
    totalSleepDuration,
    longestSleepDuration,
    averageSleepDuration,
    sleepCount,
    sleepQualityScore,
    nightWakingsTotal,
    isSleepingThroughNight,
    longestContinuousSleep: longestSleepDuration,
    routineScore,
    averageBedtime,
    averageWakeTime,
    recommendations: [],
  };

  // Generate recommendations based on analytics
  analytics.recommendations = generateSleepRecommendations(logs, analytics);

  return analytics;
}
