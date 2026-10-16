import { useMemo } from 'react';
import type {
  DailyLog,
  SleepAnalytics,
  SleepPattern,
} from '~app/family/domain/familyRecords';
import {
  analyzeSleepPatterns,
  getSleepPatternsByDate,
} from '~app/littlesteps/domain/sleepAnalytics';

/**
 * Hook for analyzing sleep patterns and providing insights
 *
 * @param logs - All daily logs (will filter sleep logs internally)
 * @param days - Number of days to analyze for patterns (default: 7)
 * @returns Sleep analytics and patterns
 *
 * @example
 * ```tsx
 * const { analytics, patterns } = useSleepAnalytics(dailyLogs);
 * console.log(analytics.isSleepingThroughNight);
 * console.log(analytics.recommendations);
 * ```
 */
export function useSleepAnalytics(
  logs: DailyLog[],
  days: number = 7,
): {
  analytics: SleepAnalytics;
  patterns: SleepPattern[];
} {
  const now = new Date();

  // Calculate sleep analytics (memoized)
  const analytics = useMemo(() => {
    return analyzeSleepPatterns(logs, now);
  }, [logs]);

  // Get sleep patterns by date (memoized)
  const patterns = useMemo(() => {
    return getSleepPatternsByDate(logs, days, now);
  }, [logs, days]);

  return {
    analytics,
    patterns,
  };
}
